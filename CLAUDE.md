# Photos „Familienalbum“ – Hinweise für Claude Code

Fotoalben der Familie, veröffentlicht auf **http://heger.earth/photos/** (Vorprod: http://heger.earth/vorprod/photos/).
Antworten und Commit-Nachrichten auf Deutsch. Stand: `STATUS.md`, Anleitung: `README.md`.
Gesteuert über den Chief of Staff (Register `PROJEKTE.json`, Cockpit https://www.heger.earth/cos/).

**Öffentlich, ohne Passwort** (Entscheidung Ernesto, 24.11.2026). Das Repo `ernesto-earth/photos` ist ebenfalls öffentlich (Ernesto, 24.11.2026).
Deshalb: Webfassungen nie mit Metadaten (GPS) veröffentlichen – `seite-pruefen.mjs` bricht sonst ab.

## Regeln

- **Album = ein Ordner direkt unter `Bilder/`.** Fotos = alle `.jpg`/`.jpeg` darin (auch Unterordner), außer in
  alten Galerie-Exporten (`images/`, `assets/`). Andere Formate werden ignoriert. Reihenfolge im Album nach
  Dateiname, Alben nach Jahr (neueste zuerst), Ordner ohne Jahr am Ende.
- Titel aus dem Ordnernamen: `2025 Anja` → „Anja“, 2025; `2026 11` → „November“, 2026; `sonst` → „Sonstiges“.
- **Originale (`Bilder/`) nie ins Repo** – nur die Webfassungen unter `seite/alben/` (erzeugt, nicht von Hand ändern).
- Oberfläche: `seite/index.html`, `seite/app.js`, `seite/style.css` – statisch, ohne Build, ohne Bibliotheken; Stil wie die
  anderen heger.earth-Seiten (dunkle Kopfleiste mit Cockpit-Knopf, Schriftzug FAMILIEN ALBUM, Barlow Condensed in `seite/fonts/`).

## Git, Vorprod und Prod (E-035, wie im Chief of Staff)

- Einzige Quelle ist das Repo; nur `main` (→ Vorprod) und `prod` (→ live). Keine eigenen Branches, kein Force-Push.
- Vor Beginn Arbeitskopie sauber, `./veroeffentlichen.sh --abgleichen`. Jede Änderung endet mit
  `./veroeffentlichen.sh "Beschreibung"` (erzeugt Webfassungen, prüft, committet, pusht auf main, prüft Vorprod).
- **Freigabe nach Prod nur auf ausdrückliche Anweisung von Ernesto:** `./veroeffentlichen.sh --freigeben <commit>`.
- Git-Verzeichnis liegt außerhalb von iCloud: `~/Library/Application Support/COS/git/photos.git`.
- `.claude/hooks/git-branch-guard.py` blockiert neue Branches, Force-Push und Push auf andere Branches.

## STATUS.md

Format wie in allen COS-Projekten (13 Pflichtfelder, siehe Chief-of-Staff-README). „Nächster Schritt“ nur mit einem
echten offenen Schritt, sonst genau „Kein offener Schritt – alles Beauftragte ist erledigt.“
