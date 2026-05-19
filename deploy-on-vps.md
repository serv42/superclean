# Deploy SuperClean auf VPS (Deutsche Anleitung)

Diese Anleitung erklärt, wie du SuperClean Pro auf einem VPS (z.B. Hetzner, DigitalOcean, Contabo) produktiv betreibst.

## 1. Voraussetzungen

- Ubuntu 22.04 / 24.04
- Domain (optional, aber empfohlen)
- SSH-Zugang

## 2. Server vorbereiten

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nginx php8.2-fpm php8.2-mbstring php8.2-xml php8.2-curl git -y
```

## 3. Projekt hochladen

```bash
git clone https://github.com/serv42/superclean.git
cd superclean
```

## 4. Frontend (GitHub Pages)

Das Frontend läuft bereits auf GitHub Pages:
https://serv42.github.io/superclean/

## 5. Backend (optional)

```bash
cd backend
cp config/.env.example config/.env
# .env anpassen (SMTP, API_KEY, etc.)

docker-compose up -d
```

## 6. Nginx Konfiguration (Frontend + Backend)

Erstelle `/etc/nginx/sites-available/superclean`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/superclean;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location /api {
        alias /var/www/superclean/backend/api;
        try_files $uri $uri/ /index.php?$args;
    }
}
```

Dann:

```bash
sudo ln -s /etc/nginx/sites-available/superclean /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 7. SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

## 8. Fertig!

Deine App ist jetzt unter `https://yourdomain.com` erreichbar.

---

**Tipp:** Für Produktion empfehlen wir einen Reverse Proxy + Docker für das Backend.