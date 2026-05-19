# PHP E-Mail Sender mit SMTP (PHPMailer)

Diese Version unterstützt **echten SMTP-Versand** mit Authentifizierung (z. B. Gmail, Office365, Web.de, GMX, all-inkl Mail etc.).

## Zwei Modi

1. **Einfacher Modus** (`mail()`) – funktioniert ohne weitere Dateien
2. **Professioneller Modus** (PHPMailer + SMTP) – deutlich zuverlässiger

---

## Installation (all-inkl & andere Shared Hoster)

### Schritt 1: Ordner anlegen
- Erstelle im Hauptverzeichnis deiner Domain den Ordner `php-helper`

### Schritt 2: Dateien hochladen
Lade folgende Dateien hoch:
- `sender.php` (bereits aktualisiert)
- `PHPMailer/` Ordner (siehe unten)

### Schritt 3: PHPMailer installieren (einmalig)

**Empfohlene Methode (einfachste):**

1. Gehe auf https://github.com/PHPMailer/PHPMailer/releases
2. Lade die neueste Version herunter (z. B. `PHPMailer-6.9.1.zip`)
3. Entpacke die ZIP-Datei
4. Lade den gesamten Ordner `src` hoch in `php-helper/PHPMailer/src/`

   Deine Struktur sollte so aussehen:
   ```
   php-helper/
   ├── sender.php
   └── PHPMailer/
       └── src/
           ├── PHPMailer.php
           ├── SMTP.php
           └── Exception.php
   ```

### Schritt 4: In der App konfigurieren

1. Öffne SuperClean
2. Gehe zu **Einstellungen** (Zahnrad)
3. PIN: `12351235`
4. Fülle folgende Felder aus:
   - **Live E-Mail Versand URL** → `https://deine-domain.de/php-helper/sender.php`
   - **SMTP Host** → z. B. `smtp.gmail.com` oder `mail.deine-domain.de`
   - **SMTP Port** → `587` (TLS) oder `465` (SSL)
   - **SMTP Benutzername** → deine E-Mail-Adresse
   - **SMTP Passwort** → App-Passwort (bei Gmail) oder normales Passwort
   - **Verschlüsselung** → `tls` oder `ssl`

5. Speichern

Ab sofort wird beim Button "Per E-Mail senden" **echter SMTP-Versand** verwendet!

---

## Wichtige Hinweise

- Bei Gmail brauchst du ein **App-Passwort** (nicht dein normales Passwort!)
- Bei all-inkl kannst du meist den Mailserver deines Hosting-Pakets verwenden
- Das Skript fällt automatisch auf `mail()` zurück, falls PHPMailer nicht gefunden wird

Viel Erfolg! 🚀