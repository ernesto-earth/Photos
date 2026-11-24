# Projektstatus – Photos

Alleinige aktuelle Statusquelle dieses registrierten Projekts.

| Feld | Wert |
|---|---|
| Projekt | Photos |
| Arbeitsstatus | aktiv; Vorprod (heger.earth/vorprod/photos/) und Prod (heger.earth/photos/) live. |
| Letzte Statusaktualisierung | 2026-11-24T21:14:31+01:00 |
| Zuletzt erledigt | 24.11.2026: d14bf4c (COS-Stil) auf Anweisung Ernestos nach prod freigegeben, Prod-Deploy 45478164145 erfolgreich; Photos auch im Live-Cockpit (COS cafd8ea). |
| Nächster Schritt | Kein offener Schritt – alles Beauftragte ist erledigt. |
| Offene Entscheidung | keine |
| Inhaltsstand | geprüft: 10 Alben mit 226 Fotos aus Bilder/, Webfassungen ohne Metadaten (seite-pruefen.mjs bestanden). |
| Prüfstand | geprüft: Prod-Deploy 45478164145 erfolgreich; Prod HTTP 200, version.json bestätigt d14bf4c. |
| Site-Stand | veröffentlicht: https://www.heger.earth/photos/ aus d14bf4c (Branch prod); Vorprod https://www.heger.earth/vorprod/photos/. |
| Site-Projekt-ID | GitHub ernesto-earth/photos |
| Site-Version | Commit d14bf4c / 2026-11-24T20:11:42.633Z (Prod) |
| Site-URL | http://heger.earth/photos/ |
| Zuletzt aktualisiert durch | Claude Code |

## Belege

- 24.11.2026: Entscheidungen Ernesto – Seite und Repo öffentlich ohne Passwort, Adresse /photos/, nur JPG/JPEG, Repo in Git und Steuerung über den Chief of Staff.
- 24.11.2026: Erste Freigabe nach prod. Der Branch prod wurde mit `git push origin d14bf4c:prod` angelegt (das Skript setzt einen vorhandenen prod voraus); der Deploy lief per workflow_dispatch, weil der Pfadfilter beim Anlegen des Branches keinen Lauf auslöste.
