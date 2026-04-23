# Deploying Secure EMR on Ubuntu Linux VMs in OpenStack

This project is designed to follow the course architecture: users reach the system through a public entry layer, the Flask application runs on a separate application tier, and the database stays on a private-only host. The PDF for your activity also calls for HTTPS, MFA, RBAC, audit logs, public/private network separation, and a load balancer in front of the application.

## Recommended instance layout

- **Instance 1: Load Balancer / Reverse Proxy**
  - Ubuntu VM
  - public floating IP
  - Nginx
  - receives HTTPS from the internet
  - proxies traffic to frontend and backend private IPs
- **Instance 2: Frontend**
  - Ubuntu VM on private subnet
  - serves built React files using Nginx
- **Instance 3: Backend**
  - Ubuntu VM on private subnet
  - Flask + Gunicorn
- **Instance 4: Database**
  - Ubuntu VM on private subnet
  - MySQL or MariaDB
  - no floating IP
  - allow port 3306 only from backend security group

## Zero Trust controls to enforce

- Use **security groups** so only the load balancer accepts public traffic on 443.
- Keep the **database private-only** and reachable only from the backend VM.
- Require **MFA** on accounts that have elevated access.
- Enforce **RBAC** in the backend, not only in the frontend.
- Keep **audit logs** enabled for sign-in, registration, record access, and administrative actions.
- Store secrets in environment files with strict file permissions.

## Ubuntu setup basics

Run on each VM:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-venv python3-pip nginx git ufw
```

## Backend VM deployment

```bash
cd /opt
sudo git clone <your-repo-url> secure-emr
cd secure-emr/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=mysql+pymysql://secure_emr:<strong_password>@<private_db_ip>/secure_emr
JWT_SECRET_KEY=<long_random_secret>
FRONTEND_ORIGIN=https://<your-domain>
ADDITIONAL_CORS_ORIGINS=https://<your-domain>
```

Run once to initialize:

```bash
python run.py
```

Then stop it and use Gunicorn:

```bash
pip install gunicorn
gunicorn -w 3 -b 0.0.0.0:5000 run:app
```

Create a systemd service later for persistence.

## Database VM deployment

Install MariaDB:

```bash
sudo apt install -y mariadb-server
sudo mysql_secure_installation
```

Create database and user:

```sql
CREATE DATABASE secure_emr;
CREATE USER 'secure_emr'@'<backend_private_ip>' IDENTIFIED BY '<strong_password>';
GRANT ALL PRIVILEGES ON secure_emr.* TO 'secure_emr'@'<backend_private_ip>';
FLUSH PRIVILEGES;
```

Update the database bind and firewall so it only listens on the private network.

## Frontend VM deployment

Install Node.js LTS first, then:

```bash
cd /opt/secure-emr/frontend
cp .env.example .env
```

Set:

```env
VITE_API_BASE_URL=https://<your-domain>/api
```

Build the frontend:

```bash
npm install
npm run build
```

Serve the generated `dist/` folder with Nginx on the frontend VM.

## Load Balancer / Reverse Proxy VM

Use Nginx as the public HTTPS entry point. Only this VM gets a floating IP. This matches the architecture where the load balancer is the controlled public entry point and the other servers stay in the private segment.

Example Nginx idea:

```nginx
server {
    listen 80;
    server_name <your-domain>;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name <your-domain>;

    ssl_certificate /etc/letsencrypt/live/<your-domain>/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/<your-domain>/privkey.pem;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy same-origin always;

    location /api/ {
        proxy_pass http://<backend_private_ip>:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location / {
        proxy_pass http://<frontend_private_ip>:80/;
        proxy_set_header Host $host;
    }
}
```

## OpenStack security groups

- **lb-sg**
  - inbound: 80, 443 from internet
  - outbound: 80 to frontend private IP, 5000 to backend private IP
- **frontend-sg**
  - inbound: 80 from lb-sg only
- **backend-sg**
  - inbound: 5000 from lb-sg only
  - outbound: 3306 to db-sg only
- **db-sg**
  - inbound: 3306 from backend-sg only
  - no public inbound

## What to say in your defense

- The system follows the course design: **public entry through load balancer, then separate web/app/data tiers, with the database kept private**.
- Zero Trust is enforced through **MFA, RBAC, least-privilege network rules, and audit logging**.
- OpenStack instances represent the cloud infrastructure: separate VMs for reverse proxy, frontend, backend, and database.
