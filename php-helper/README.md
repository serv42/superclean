# PHP E-Mail Sender für SuperClean

Dieses Skript ermöglicht echten E-Mail-Versand aus der SuperClean WebApp heraus.

## Voraussetzungen
- Shared Hosting mit PHP (z.B. all-inkl.com, HostEurope, Strato, 1&1 etc.)
- Die Domain muss E-Mails versenden können (meist standardmäßig aktiviert)

## Installation (all-inkl.com Beispiel)

1. Logge dich in dein all-inkl Kundenmenü ein
2. Gehe zu **Dateimanager** oder **FTP**
3. Erstelle im Hauptverzeichnis deiner Domain einen neuen Ordner namens `php-helper`
4. Lade die Datei `sender.php` in diesen Ordner hoch
5. Setze die Dateirechte auf **644** (meist Standard)
6. Öffne die Datei im Browser:
   `https://deine-domain.de/php-helper/sender.php`

   Du solltest eine JSON-Fehlermeldung sehen (das ist normal).

## In der SuperClean App eintragen

1. Öffne die SuperClean WebApp
2. Gehe auf **Einstellungen** (Zahnrad-Symbol)
3. Klicke auf **Admin-PIN** und gib `12351235` ein
4. Trage unter **"Live E-Mail Versand URL"** die volle URL ein:
   `https://deine-domain.de/php-helper/sender.php`
5. Speichern

Ab sofort funktioniert der Button **"Per E-Mail senden"** mit echtem Versand!

## Wichtige Hinweise
- Ersetze `deine-domain.de` durch deine echte Domain
- Auf manchen Hostern muss man die Absender-Adresse noch freischalten (z.B. bei all-inkl im Webmail)
- Das Skript verwendet die PHP `mail()`-Funktion (funktioniert auf fast allen Shared Hostern)

## Erweiterung (optional)
Später kann man hier noch echte SMTP-Authentifizierung (z.B. mit PHPMailer) einbauen.

Viel Erfolg! 🚀