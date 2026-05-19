# SuperClean Pro 🧹

**Airbnb Reinigungsprotokoll** - Eine moderne, mobile-first WebApp für Reinigungskräfte.

> **Production-Ready** | PWA-Style | Shadcn/UI Design | Vollständig lokal gespeichert

---

## 🚀 Features

### ✅ Implementiert

| Feature | Status | Beschreibung |
|---------|--------|--------------|
| **Reinigungsprotokoll** | ✅ | Vollständige Checkliste für alle Räume |
| **Live Counter** | ✅ | Echtzeit-Zähler für erledigte Aufgaben |
| **State Persistence** | ✅ | Alle Häkchen werden in localStorage gespeichert |
| **Unterschrift** | ✅ | Touch-fähiges Signature Pad (Canvas) |
| **Foto-Dokumentation** | ✅ | Foto-Upload mit Vorschau |
| **Vorräte & Mängel** | ✅ | Checkboxen + Freitextfeld |
| **Historie** | ✅ | Alle gespeicherten Protokolle mit Details |
| **PDF Export** | ✅ | Professionelles PDF mit allen Daten & Notizen |
| **Einstellungen** | ✅ | Reinigungskraft-Name + Standard-Adresse |
| **PWA-Style Navigation** | ✅ | Bottom Navigation mit 4 Tabs |
| **Full-Page Slides** | ✅ | Native App-Style Raum-Ansichten |
| **Swipe Back Gesture** | ✅ | iOS-Style Swipe zum Zurückgehen |
| **Dark Mode entfernt** | ✅ | Nur helle, elegante Version (Airbnb-Style) |
| **Bilingual (DE/EN)** | ⚠️ | Grundstruktur vorhanden, nicht vollständig |

### 🔧 Mock / Teilweise

- **Email-Versand** → Mock (PHP-Helper vorhanden, aber nicht aktiv)
- **Admin-PIN** → UI vorhanden, aber keine echte Authentifizierung
- **Leaflet Map Picker** → Noch nicht implementiert

### ❌ Fehlt / Geplant

- **Echter SMTP-Versand** (PHPMailer)
- **Offline-Modus** (Service Worker)
- **Push-Benachrichtigungen**
- **Mehrsprachigkeit** (vollständig)
- **Export als CSV/Excel**

---

## 📁 Ordnerstruktur

```
superclean/
├── index.html                 # Haupt-HTML (PWA-Style)
├── README.md                  # Diese Datei
├── js/
│   ├── main.js                  # Kern-Logik + alle Tabs
│   ├── components/
│   │   ├── room-checklist.js     # Raum-Logik
│   │   ├── signature.js          # Signature Pad
│   │   ├── history.js            # Historie-Logik
│   │   └── settings.js           # Einstellungen
│   ├── data/
│   │   └── rooms.js              # Raum-Definitionen
│   └── utils/
│       └── storage.js            # localStorage-Helper
├── php-helper/
│   └── sender.php              # (Mock) Email-Versand
└── .github/
    └── workflows/
        └── deploy.yml            # GitHub Pages CI/CD
```

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript + Tailwind CSS (CDN)
- **Design**: Shadcn/UI Style (Cards, Shadows, Rounded-2xl)
- **Storage**: localStorage (vollständig offline-fähig)
- **PDF**: jsPDF
- **Icons**: Font Awesome 6
- **Deployment**: GitHub Pages + GitHub Actions

---

## 🚀 Schnellstart

1. Repository klonen
2. `index.html` im Browser öffnen
3. Fertig! (Keine Installation nötig)

Oder direkt testen:
https://serv42.github.io/superclean/

---

## 📈 Aktueller Status (Mai 2026)

- **Version**: Production-Ready v2.0
- **Design**: Chief Design Officer Level (Airbnb-Style)
- **Mobile**: Vollständig optimiert + Touch-Gestures
- **Daten**: 100% lokal gespeichert (DSGVO-konform)
- **Performance**: Sehr gut (keine externen Abhängigkeiten außer CDNs)

---

## 🙋‍♂️ Mitwirken

Pull Requests sind willkommen! Besonders gewünscht:
- Echter Email-Versand (PHPMailer)
- Leaflet Map Picker für Adressen
- Vollständige Englische Übersetzung
- Offline-Modus (Service Worker)

---

## 📄 Lizenz

MIT License - frei nutzbar für kommerzielle und private Projekte.

---

**Made with ❤️ for cleaning professionals**