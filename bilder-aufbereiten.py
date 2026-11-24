#!/usr/bin/env python3
"""Erzeugt aus Bilder/ die Webfassungen der Fotoseite (nur am Mac, Originale bleiben lokal).

    python3 bilder-aufbereiten.py            nur Neues/Geändertes verarbeiten
    python3 bilder-aufbereiten.py --alles    alles neu erzeugen

Regeln:
- Ein Album = ein Ordner direkt unter Bilder/ (z. B. "Bilder/2026 11").
- Fotos = alle .jpg/.jpeg in diesem Ordner, auch in Unterordnern – außer in alten Galerie-Exporten
  (Ordner "images", "assets"). Andere Formate (TIFF, RAW, Video, PDF) werden ignoriert.
- Reihenfolge im Album: nach Dateiname. Reihenfolge der Alben: neuestes Jahr zuerst.
- Ausgabe: seite/alben/<album>/gross/<foto>.jpg (2000 px) und …/klein/<foto>.jpg (640 px),
  gedreht nach EXIF und OHNE Metadaten (kein GPS, keine Kameradaten). Dazu seite/alben.json.
"""
import json
import os
import re
import sys
import unicodedata
from concurrent.futures import ProcessPoolExecutor
from datetime import datetime

from PIL import Image, ImageOps

BASIS = os.path.dirname(os.path.abspath(__file__))
QUELLE = os.path.join(BASIS, "Bilder")
SEITE = os.path.join(BASIS, "seite")
ZIEL = os.path.join(SEITE, "alben")
INDEX = os.path.join(SEITE, "alben.json")
AUSGESCHLOSSEN = {"images", "assets"}
GROESSEN = {"gross": (2000, 82), "klein": (640, 74)}
MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August",
          "September", "Oktober", "November", "Dezember"]


def kennung(text):
    text = text.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
    text = text.replace("Ä", "Ae").replace("Ö", "Oe").replace("Ü", "Ue")
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-") or "x"


def titel(ordner):
    """'2026 11' → ('November', 2026), '2025 Anja' → ('Anja', 2025), 'sonst' → ('Sonstiges', None)."""
    m = re.match(r"^(\d{4})\s*(.*)$", ordner)
    if not m:
        return ("Sonstiges" if ordner.lower() == "sonst" else ordner), None
    jahr, rest = int(m.group(1)), m.group(2).strip()
    if rest.isdigit() and 1 <= int(rest) <= 12:
        rest = MONATE[int(rest) - 1]
    return rest or str(jahr), jahr


def fotos_im_album(ordner):
    pfade = []
    for wurzel, dirs, dateien in os.walk(ordner):
        dirs[:] = sorted(d for d in dirs if d.lower() not in AUSGESCHLOSSEN and not d.startswith("."))
        for f in sorted(dateien):
            if f.lower().endswith((".jpg", ".jpeg")) and not f.startswith("."):
                pfade.append(os.path.join(wurzel, f))
    return pfade


def aufnahmezeit(bild):
    exif = bild.getexif()
    wert = exif.get_ifd(0x8769).get(36867) or exif.get(306)
    try:
        return datetime.strptime(str(wert).strip("\x00 ")[:19], "%Y:%m:%d %H:%M:%S").isoformat()
    except (ValueError, TypeError):
        return None


def verarbeiten(auftrag):
    quelle, ziele = auftrag
    with Image.open(quelle) as bild:
        zeit = aufnahmezeit(bild)
        bild = ImageOps.exif_transpose(bild).convert("RGB")
        breite, hoehe = bild.size
        for art, (kante, qualitaet) in GROESSEN.items():
            kopie = bild.copy()
            kopie.thumbnail((kante, kante), Image.LANCZOS)
            os.makedirs(os.path.dirname(ziele[art]), exist_ok=True)
            # Ohne exif=… speichert Pillow keine Metadaten → GPS und Kameradaten sind weg.
            kopie.save(ziele[art], "JPEG", quality=qualitaet, optimize=True, progressive=True)
            if art == "gross":
                breite, hoehe = kopie.size
    return {"zeit": zeit, "b": breite, "h": hoehe}


def main():
    alles = "--alles" in sys.argv
    alt = {}
    if os.path.exists(INDEX) and not alles:
        for a in json.load(open(INDEX, encoding="utf-8"))["alben"]:
            for f in a["fotos"]:
                alt[(a["id"], f["datei"])] = f

    alben, auftraege, behalten = [], [], set()
    for ordner in sorted(os.listdir(QUELLE)):
        pfad = os.path.join(QUELLE, ordner)
        if not os.path.isdir(pfad) or ordner.startswith("."):
            continue
        aid = kennung(ordner)
        name, jahr = titel(ordner)
        fotos, vergeben = [], set()
        for q in fotos_im_album(pfad):
            datei = kennung(os.path.splitext(os.path.basename(q))[0])
            n, basis = 2, datei
            while datei in vergeben:
                datei, n = f"{basis}-{n}", n + 1
            vergeben.add(datei)
            ziele = {art: os.path.join(ZIEL, aid, art, datei + ".jpg") for art in GROESSEN}
            behalten.update(ziele.values())
            frisch = all(os.path.exists(z) and os.path.getmtime(z) >= os.path.getmtime(q) for z in ziele.values())
            eintrag = {"datei": datei}
            if frisch and (aid, datei) in alt:
                eintrag.update({k: alt[(aid, datei)][k] for k in ("zeit", "b", "h")})
            else:
                auftraege.append((eintrag, (q, ziele)))
            fotos.append(eintrag)
        if fotos:
            alben.append({"id": aid, "ordner": ordner, "titel": name, "jahr": jahr, "fotos": fotos})

    print(f"{len(alben)} Alben, {sum(len(a['fotos']) for a in alben)} Fotos, {len(auftraege)} zu verarbeiten")
    with ProcessPoolExecutor() as pool:
        for i, (eintrag, ergebnis) in enumerate(zip([e for e, _ in auftraege],
                                                     pool.map(verarbeiten, [a for _, a in auftraege])), 1):
            eintrag.update(ergebnis)
            if i % 20 == 0 or i == len(auftraege):
                print(f"  {i}/{len(auftraege)}")

    for a in alben:  # nach Dateiname (natürlich sortiert) – Kamerauhren sind oft falsch gestellt
        a["fotos"].sort(key=lambda f: [int(t) if t.isdigit() else t for t in re.split(r"(\d+)", f["datei"])])
    # Neueste Alben zuerst, Alben ohne Jahr (z. B. "sonst") am Ende
    alben.sort(key=lambda a: (a["jahr"] is None, -(a["jahr"] or 0), a["ordner"]))

    # Veraltete Webfassungen entfernen (nur im erzeugten Ordner seite/alben/)
    if os.path.isdir(ZIEL):
        for wurzel, _, dateien in os.walk(ZIEL, topdown=False):
            for f in dateien:
                p = os.path.join(wurzel, f)
                if p not in behalten:
                    os.remove(p)
            if wurzel != ZIEL and not os.listdir(wurzel):
                os.rmdir(wurzel)

    with open(INDEX, "w", encoding="utf-8") as f:
        json.dump({"alben": alben}, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print("fertig:", os.path.relpath(INDEX, BASIS))


if __name__ == "__main__":
    main()
