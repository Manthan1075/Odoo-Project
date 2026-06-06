# VendorBridge ERP - Setup & Deployment Guide

## Quick Start (5 Minutes)

### Windows
```batch
# 1. Create virtual environment
python -m venv venv
venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run application
python main.py
```

### macOS / Linux
```bash
# 1. Create virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run application
python main.py
```

Access the application:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

## First Login

1. Open http://localhost:8000/docs
2. Login endpoint: POST `/auth/login`
3. Use credentials:
   - Email: `admin@vendorbridge.com`
   - Password: `admin123`
4. Copy the `access_token` from response
5. Click "Authorize" button in Swagger UI
6. Paste token as: `Bearer <token>`

## Configuration

### Email Setup (For Invoice Delivery)

1. Go to `utils/email_sender.py`
2. Update lines 7-8:
   ```python
   SENDER_EMAIL = "your-gmail@gmail.com"
   SENDER_PASSWORD = "your-app-password"
   ```

3. To get Gmail app password:
   - Enable 2FA on Google Account
   - Go to myaccount.google.com/apppasswords
   - Select Mail and Windows Computer
   - Copy the generated 16-character password

4. Test email sending:
   ```python
   from utils.email_sender import send_invoice_email
   send_invoice_email("test@example.com", "INV-2024-0001", 50000, "2024-01-30", b"PDF_DATA")
   ```

### Database Configuration

The system uses SQLite by default. No configuration needed - database is auto-created.

To migrate to PostgreSQL (production):
1. Install: `pip install psycopg2-binary`
2. Modify `database.py` to use psycopg2
3. Update connection string

## Project Structure Explanation

### Core Files
- **main.py**: FastAPI application entry point, route registration, startup logic
- **database.py**: SQLite connection, table creation, initialization
- **auth_utils.py**: JWT tokens, password hashing, role-based access control

### Routes (API Endpoints)
- **auth.py**: User registration, login, profile
- **vendors.py**: Vendor CRUD, categorization
- **rfq.py**: RFQ creation and management
- **quotations.py**: Vendor quotation submission, comparison, selection
- **approvals.py**: Multi-level approval workflow, PO generation
- **purchase_orders.py**: PO management and status tracking
- **invoices.py**: Invoice creation, PDF generation, email delivery
- **dashboard.py**: Statistics, trends, quick stats
- **activity.py**: Audit logs, activity history
- **reports.py**: Spending analysis, CSV exports

### Utilities
- **pdf_generator.py**: ReportLab-based invoice PDF generation
- **email_sender.py**: smtplib-based email delivery with PDF attachment
- **auto_number.py**: Unique PO and invoice number generation

## Database Schema Overview

### Core Tables
1. **users**: System users (admin, procurement_officer, manager, vendor)
2. **vendors**: Vendor company information
3. **vendor_categories**: Vendor categorization (IT, Logistics, etc.)

### RFQ & Quotation Flow
4. **rfqs**: Request for Quotations
5. **rfq_line_items**: Items in each RFQ
6. **rfq_vendors**: Vendors invited to specific RFQs
7. **quotations**: Vendor quotation submissions
8. **quotation_items**: Line items in each quotation

### Approval & Order Flow
9. **approvals**: Multi-level approval records
10. **purchase_orders**: Generated POs from approved quotations
11. **invoices**: Invoices for payment

### Audit
12. **activity_logs**: Complete audit trail (write-once)

## Role-Based Access Control

### Admin
- All operations
- Create/manage vendors and categories
- Create RFQs
- Approve quotations (L2)
- View all reports

### Procurement Officer
- Create/manage RFQs
- View quotations
- Compare and select quotations
- Create invoices
- Send invoices via email
- View reports

### Manager
- View RFQs and quotations
- Approve quotations (L1)
- View purchase orders
- View reports

### Vendor
- View assigned RFQs
- Submit quotations
- View own quotations
- View own profile

## Common Operations

### Create a Full Procurement Cycle

```bash
# 1. As Admin - Create vendor
POST /vendors/
{
  "company_name": "Supplier Inc",
  "contact_person": "John",
  "email": "john@supplier.com",
  "phone": "9876543210",
  "gst_number": "123456789012345",
  "category_id": 1,
  "country": "India",
  "address": "Delhi"
}

# 2. As Procurement Officer - Create RFQ
POST /rfqs/
{
  "title": "Office Supplies",
  "category": "Stationery",
  "deadline": "2024-01-15",
  "line_items": [
    {"item_name": "Paper", "quantity": 100, "unit": "reams"}
  ],
  "vendor_ids": [1]
}

# 3. As Vendor - Submit quotation
POST /rfqs/1/quotations
{
  "items": [
    {"item_name": "Paper", "quantity": 100, "unit_price": 300}
  ],
  "delivery_days": 5,
  "payment_terms": "Net 30"
}

# 4. As Procurement Officer - Select quotation
POST /quotations/1/select

# 5. As Manager - Approve quotation
POST /approvals/1/approve
{"remarks": "Approved"}

# 6. System - Auto-generates PO

# 7. As Procurement Officer - Create invoice
POST /invoices/
{"po_id": 1}

# 8. Send invoice via email
POST /invoices/1/send-email
{"recipient_email": "john@supplier.com"}
```

## Testing the API

### Using cURL

```bash
# Get auth token
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@vendorbridge.com", "password": "admin123"}'

# Use token in subsequent requests
curl -X GET http://localhost:8000/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Swagger UI
1. Go to http://localhost:8000/docs
2. Click "Authorize" button
3. Enter token: `Bearer YOUR_TOKEN`
4. Try out any endpoint

### Using Python
```python
import requests

BASE_URL = "http://localhost:8000"

# Login
response = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "admin@vendorbridge.com",
    "password": "admin123"
})
token = response.json()["access_token"]

# Get dashboard stats
headers = {"Authorization": f"Bearer {token}"}
response = requests.get(f"{BASE_URL}/dashboard/stats", headers=headers)
print(response.json())
```

## Production Deployment

### Environment Variables
Create `.env` file:
```
DATABASE_URL=sqlite:///vendorbridge.db
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-app-password
SECRET_KEY=vendorbridge_secret_key_2026
```

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t vendorbridge .
docker run -p 8000:8000 vendorbridge
```

### Server Deployment (Ubuntu)

```bash
# 1. Install Python and pip
sudo apt-get update
sudo apt-get install python3 python3-pip python3-venv

# 2. Clone repository
git clone <repo-url>
cd vendorbridge

# 3. Create virtual environment
python3 -m venv venv
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt
pip install gunicorn

# 5. Run with Gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000

# 6. Setup systemd service (optional)
sudo nano /etc/systemd/system/vendorbridge.service
```

Systemd service file:
```ini
[Unit]
Description=VendorBridge ERP Service
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/vendorbridge
ExecStart=/var/www/vendorbridge/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable vendorbridge
sudo systemctl start vendorbridge
sudo systemctl status vendorbridge
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name vendorbridge.example.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Performance Optimization

### Database
- Add indexes on frequently queried columns
- Archive old activity logs periodically
- Use connection pooling for large deployments

### API
- Enable response caching for read operations
- Use pagination for list endpoints
- Compress responses with gzip

### Code
```python
# Add to main.py for compression
from fastapi.middleware.gzip import GZIPMiddleware
app.add_middleware(GZIPMiddleware, minimum_size=1000)
```

## Monitoring & Logging

Add logging to `main.py`:
```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"{request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Status: {response.status_code}")
    return response
```

## Troubleshooting

### Port 8000 Already in Use
```bash
# Find process using port
lsof -i :8000

# Kill process
kill -9 <PID>
```

### Database Locked
```bash
# Remove lock file
rm vendorbridge.db-journal
```

### Import Errors
```bash
# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

### Email Authentication Failed
- Verify Gmail credentials
- Check if 2FA is enabled
- Use app-specific password (16 chars)
- Allow less secure apps (if needed)

## Scaling Considerations

### For 10-100 Users
- Current SQLite setup is fine
- Single server deployment
- No special optimization needed

### For 100-1000 Users
- Migrate to PostgreSQL
- Add read replicas if needed
- Implement caching layer (Redis)
- Load balancing not needed yet

### For 1000+ Users
- PostgreSQL with clustering
- Redis for caching
- Kubernetes deployment
- Separate API and database servers
- CDN for static assets

## Backup & Recovery

### SQLite Backup
```bash
cp vendorbridge.db vendorbridge.db.backup
```

### Automated Backup (cron)
```bash
0 2 * * * cp /path/to/vendorbridge.db /backups/vendorbridge.db.$(date +\%Y\%m\%d)
```

### Database Integrity Check
```python
from database import get_db_connection
conn = get_db_connection()
cursor = conn.cursor()
cursor.execute("PRAGMA integrity_check")
print(cursor.fetchone())
```

## Security Hardening

1. Change default admin password immediately
2. Use HTTPS in production
3. Implement rate limiting
4. Add input sanitization
5. Regular security audits
6. Keep dependencies updated
7. Use environment variables for secrets
8. Enable CSRF protection if needed

## Next Steps

1. Test all endpoints via Swagger UI
2. Configure email for invoice delivery
3. Set up database backups
4. Deploy to production server
5. Configure SSL/HTTPS
6. Set up monitoring and logging
7. Train users on the system

For detailed API documentation, visit http://localhost:8000/docs
