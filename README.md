# Photos – Familienalbum

Statische Fotoseite: http://heger.earth/photos/ · Vorprod: http://heger.earth/vorprod/photos/

## Neues Album

1. Ordner unter `Bilder/` anlegen, z. B. `Bilder/2026 Weihnacht`, und die JPGs hineinlegen.
2. `./veroeffentlichen.sh "Album Weihnacht 2026 ergänzt"` – erzeugt die Webfassungen, prüft, pusht auf `main`
   und prüft Vorprod.
3. Nach Ansicht auf Vorprod live schalten: `./veroeffentlichen.sh --freigeben <commit>`.

Nur ansehen (ohne Veröffentlichen): `python3 bilder-aufbereiten.py`, dann `cd seite && python3 -m http.server 8765`
und http://localhost:8765/ öffnen.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `Bilder/` | Originale, nur lokal (nicht im Repo) |
| `bilder-aufbereiten.py` | erzeugt `seite/alben/<album>/{gross,klein}/*.jpg` (2000/640 px, ohne Metadaten) und `seite/alben.json` |
| `seite/` | die veröffentlichte Seite: `index.html`, `app.js`, `style.css`, `alben.json`, `alben/` |
| `seite-pruefen.mjs` | Prüfung vor jedem Veröffentlichen (lokal und in der Action) |
| `deploy-pruefen.mjs` | prüft nach dem Deploy Erreichbarkeit und `version.json` |
| `veroeffentlichen.sh` | Veröffentlichen wie in allen COS-Projekten (E-035) |
| `.github/workflows/deploy.yml` | Push auf `main` → Vorprod, auf `prod` → live (FTPS) |

Adressen in der Seite: `#/` Übersicht, `#/<album>` Album, `#/<album>/<foto>` Foto im Leuchtkasten.
