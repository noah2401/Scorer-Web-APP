# Scorer Battle

Responsive React/TypeScript PWA für zwei Fußballspieler. Dark Dashboard, Spielverwaltung, Zieländerungen mit Protokoll, exakte Verhältniswertung, Saisonkurve, Abschluss und Wiederöffnung, JSON-Export. Ohne Firebase startet ein ausdrücklich gekennzeichneter, lokaler Demomodus mit Beispieldaten. Keine Anmeldung oder Synchronisierung wird dort simuliert.

## Entwicklung

Node.js 22+; `npm ci`, `npm run dev`. `npm run build` prüft TypeScript und baut die App, `npm test` testet die Wettbewerbslogik. `npx playwright test` prüft Spielanlage, Korrektur, Löschung, Persistenz, Zielwechsel, Saisonabschluss/Wiederöffnung und das mobile Layout (Chromium unter `/usr/bin/chromium`; bei Bedarf Pfad in `playwright.config.ts` anpassen). `npm run preview` startet den Produktionsbuild. Service Worker nur im Produktionsbuild. Installierbarkeit setzt HTTPS oder localhost voraus; PNG-Icons in 192 und 512 px sowie ein Apple-Touch-Icon sind enthalten. Statische App wird gecacht; Cloud-Schreibvorgänge benötigen Internet.

## Firebase aktivieren

1. Ein Firebase-Projekt erstellen, Authentication mit E-Mail/Passwort aktivieren und genau zwei Konten in der Firebase-Konsole anlegen. Keine öffentliche Registrierung wird angeboten.
2. Firestore anlegen. In `firestore.rules` beide UID-Platzhalter durch diese Konto-UIDs ersetzen. Die UID-Liste ist keine geheime Information. Regeln vor produktiver Nutzung mit Firebase Emulator testen.
3. `.env.example` nach `.env.local` kopieren und mit den Web-App-Konfigurationswerten und beiden UIDs ausfüllen. Firebase Web-Konfiguration ist öffentlich; niemals Admin-Schlüssel ins Frontend schreiben.
4. In der Firestore-Konsole `battles/main` initialisieren: `label: "2026/27"`, `startsOn: "2026-07-01"`, `endsOn: "2027-06-30"`, `status: "active"`, `archives: []`, `revision: 0`, `entryIds: ["UID1", "UID2"]`.
5. Unter `battles/main/entries/UID1` und `…/UID2` jeweils ein Dokument: `kind: "player"`, `uid: "entsprechende UID"`, `name: "Spielername"`, `team: "Verein"`, `target: 30` (bzw. eigener positiver Zielwert), `initials: "S1"` (bzw. S2), `changes: []`. UID1/UID2 überall durch tatsächliche UIDs ersetzen. Client darf diese Dokumente bewusst nicht selbst erzeugen.
6. Firebase CLI verwenden: `npx firebase-tools login`, `npx firebase-tools use --add`, `npm run build`, `npx firebase-tools deploy --only firestore:rules,hosting`. Hosting veröffentlicht extern; nur mit eigener ausdrücklicher Freigabe ausführen. Kostenlose Kontingente und aktuelle Anbieterbedingungen vorher prüfen.

Cloud: Firestore-Listener synchronisieren Daten; Transaktionen lesen die im Root verzeichneten Einträge und schreiben nur geänderte eigene Dokumente. Regeln verweigern fremde Spiel-/Zieländerungen. Beide Teilnehmer dürfen die Saison verwalten. Abschluss-Snapshots werden im Root gespeichert und die Oberfläche sperrt abgeschlossene Saisons.

## Grenzen vor einem produktiven Release

Cloud-Authentifizierung, zwei Geräte und Security Rules müssen mit einem echten Projekt beziehungsweise Emulator geprüft werden; dies ist ohne Projektkonfiguration nicht möglich. Der Client-basierte Saisonabschluss ist für private vertrauensvolle Teilnehmer gedacht: Root-Metadaten (Eintragsindex, Ergebnis und Historie) sind für beide Teilnehmer schreibbar; gegen manipulierte Clients ist deren Integrität noch nicht serverseitig abgesichert. Für verbindliche manipulationssichere Ergebnisse Abschluss/Öffnung in einer authentifizierten Cloud Function berechnen, Snapshots append-only speichern und Root-Schreibrechte entsprechend einschränken. Aktuell wird eine gemeinsame Saison verwaltet; weitere Saisons und Foto-Uploads sind nicht enthalten. Profilbilder über HTTPS-URL. Kein garantierter Offline-Schreibmodus.

Es wurde kein Firebase-Projekt erstellt und nichts extern veröffentlicht. Beispielnamen, Termine und Ziele lassen sich in der Oberfläche bearbeiten. JSON-Export regelmäßig zur eigenen Sicherung verwenden.
