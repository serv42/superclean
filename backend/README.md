# SuperClean Backend API

> REST-API für SuperClean Pro (PHP 8.2+)

## 🚀 Features

- Protokoll speichern & abrufen
- E-Mail-Versand (PHPMailer)
- Admin-Authentifizierung (PIN)
- Zukunftssicher & Docker-ready

## 📁 Struktur

```
backend/
├── api/v1/
│   ├── send-email.php
│   ├── save-protocol.php
│   ├── get-protocols.php
│   └── auth.php
├── config/
│   └── .env.example
├── docker-compose.yml
└── README.md
```

## 🚀 Schnellstart (Docker)

```bash
cd backend
cp config/.env.example config/.env
# .env anpassen

docker-compose up -d
```

API läuft dann auf: `http://localhost:8080`

## 🔐 Authentifizierung

Alle sensiblen Endpoints benötigen einen `X-API-Key` Header mit dem in `.env` definierten `API_KEY`.