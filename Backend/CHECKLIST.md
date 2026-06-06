# VendorBridge ERP - Getting Started Checklist

## Pre-Installation ✓
- [ ] Python 3.8+ installed (`python --version`)
- [ ] pip installed (`pip --version`)
- [ ] Git installed (optional, for version control)
- [ ] At least 2GB free disk space
- [ ] Internet connection for downloading dependencies

## Installation (5 minutes)

### Step 1: Extract Files
- [ ] Extract the VendorBridge ZIP file to your desired location
- [ ] Navigate to the project directory: `cd vendorbridge`

### Step 2: Create Virtual Environment
**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

- [ ] Virtual environment activated (you should see `(venv)` in terminal)

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```
- [ ] All dependencies installed successfully (no error messages)

### Step 4: Start the Server
```bash
python main.py
```
**OR**
```bash
uvicorn main:app --reload --port 8000
```

- [ ] Server started successfully (should see "Uvicorn running on http://0.0.0.0:8000")
- [ ] Database created automatically
- [ ] Default admin user created

### Step 5: Access the Application
- [ ] Open http://localhost:8000/docs in your browser
- [ ] You should see the Swagger UI with all API endpoints
- [ ] Alternative docs: http://localhost:8000/redoc

## Initial Configuration

### Step 1: Login with Default Admin
- [ ] Email: `admin@vendorbridge.com`
- [ ] Password: `admin123`
- [ ] Click "Authorize" in Swagger UI
- [ ] Enter: `Bearer YOUR_TOKEN` (with token from login response)

### Step 2: Change Default Admin Password (Recommended)
- [ ] Create a new admin user with secure password
- [ ] Or directly modify database (not recommended)

### Step 3: Configure Email (For Invoice Delivery)
- [ ] Go to `utils/email_sender.py`
- [ ] Update `SENDER_EMAIL` with your Gmail address
- [ ] Update `SENDER_PASSWORD` with Gmail app password:
  - [ ] Go to myaccount.google.com
  - [ ] Enable 2-Factor Authentication if not enabled
  - [ ] Go to myaccount.google.com/apppasswords
  - [ ] Select Mail and Windows Computer
  - [ ] Copy the 16-character password

### Step 4: (Optional) Environment File
- [ ] Copy `.env.example` to `.env`
- [ ] Update configuration values as needed
- [ ] Modify `main.py` to load from `.env` if using it

## Testing Setup

### Quick Test
Run the test suite to verify everything is working:

```bash
python test_setup.py
```

- [ ] All tests pass (green checkmarks)
- [ ] Database connection successful
- [ ] PDF generation working
- [ ] Email configuration verified

### Manual Testing
- [ ] Test login endpoint (POST /auth/login)
- [ ] Test creating a vendor (POST /vendors)
- [ ] Test getting dashboard stats (GET /dashboard/stats)
- [ ] Test health check (GET /health)

## Create Test Data

### Test Data Creation Workflow
1. **Login as Admin**
   - [ ] Get JWT token from login

2. **Create Vendor Categories** (if needed)
   - [ ] POST /vendors/categories/create
   - [ ] Create: IT, Logistics, Furniture, etc.

3. **Create Test Vendor**
   - [ ] POST /vendors/
   - [ ] Company Name: "Test Supplier Inc"
   - [ ] Email: unique email
   - [ ] Phone: 10-digit number
   - [ ] GST: 15-character string

4. **Create Test RFQ**
   - [ ] POST /rfqs/
   - [ ] Add line items
   - [ ] Set deadline (future date)
   - [ ] Invite vendors

5. **View Dashboard**
   - [ ] GET /dashboard/stats
   - [ ] Should show RFQs created

## Production Deployment

### Before Going Live
- [ ] Change all default passwords
- [ ] Configure custom email settings
- [ ] Test email functionality
- [ ] Backup database setup
- [ ] SSL/HTTPS configured
- [ ] Database backups scheduled
- [ ] Monitoring/logging configured
- [ ] Performance testing completed

### Docker Deployment
- [ ] Docker installed (`docker --version`)
- [ ] Docker Compose installed (`docker-compose --version`)
- [ ] Run: `docker-compose up -d`
- [ ] Check: `docker logs vendorbridge-api`
- [ ] Access: http://localhost:8000

### Linux Server Deployment
- [ ] Ubuntu 20.04+ LTS
- [ ] Python 3.11 installed
- [ ] Create dedicated user account
- [ ] Set up systemd service
- [ ] Configure Nginx reverse proxy
- [ ] Enable firewall rules
- [ ] Set up SSL certificates

## API Integration Checklist

### If Integrating with Frontend
- [ ] CORS enabled in main.py (already done)
- [ ] Frontend URL in CORS origins
- [ ] Token storage strategy decided
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Authentication flow tested

### If Integrating with External Systems
- [ ] API documentation reviewed
- [ ] Webhook endpoints tested (if any)
- [ ] Rate limiting considered
- [ ] Error retry logic implemented
- [ ] Logging for API calls configured

## User Management

### Setup User Accounts
- [ ] Create Admin users (minimum 2)
- [ ] Create Procurement Officers
- [ ] Create Managers
- [ ] Create Vendors
- [ ] Send credentials to users
- [ ] Document password reset process

### Access Control Verification
- [ ] Admin can access all features
- [ ] Procurement Officers can create RFQs
- [ ] Managers can approve quotations
- [ ] Vendors can submit quotations
- [ ] Non-admins cannot access vendor management

## Data Integrity

### Verification Steps
- [ ] Activity logs are being recorded
- [ ] Activity logs cannot be updated/deleted
- [ ] Tax calculations are correct (9% CGST + 9% SGST)
- [ ] Auto-numbering works (PO, Invoice)
- [ ] Soft deletes working (vendors blocked, not deleted)
- [ ] Foreign keys enforced

## Documentation & Training

### Prepare Documentation
- [ ] User guide created
- [ ] API documentation shared
- [ ] Workflow diagrams created
- [ ] Role responsibilities documented
- [ ] Troubleshooting guide prepared

### Training Materials
- [ ] Video tutorials recorded (optional)
- [ ] Step-by-step guides created
- [ ] FAQ document prepared
- [ ] Common issues documented
- [ ] Support contact information provided

## Performance & Monitoring

### Setup Monitoring
- [ ] Application logging configured
- [ ] Error tracking setup (optional)
- [ ] Performance monitoring enabled (optional)
- [ ] Database backups automated
- [ ] System resource monitoring

### Performance Baseline
- [ ] Load test completed
- [ ] Response times documented
- [ ] Database query optimization reviewed
- [ ] Caching strategy implemented (if needed)

## Go-Live Checklist

### 48 Hours Before Launch
- [ ] All testing completed
- [ ] User training completed
- [ ] Support team ready
- [ ] Backup systems tested
- [ ] Disaster recovery plan prepared
- [ ] Final security audit done

### Launch Day
- [ ] Production deployment verified
- [ ] All endpoints tested
- [ ] Users can login successfully
- [ ] Sample RFQ-to-Invoice workflow tested
- [ ] Email delivery tested
- [ ] Monitoring active

### Post-Launch
- [ ] Monitor error logs
- [ ] User feedback collected
- [ ] Database backups verified
- [ ] Performance metrics reviewed
- [ ] Issues logged and prioritized
- [ ] Team available for support

## Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| "Port 8000 in use" | `lsof -i :8000` then `kill -9 PID` |
| "Database locked" | Delete `.db-journal` file |
| "Module not found" | Run `pip install -r requirements.txt` again |
| "Token invalid" | Login again, token expires after 24 hours |
| "Email not sending" | Update credentials in `utils/email_sender.py` |
| "CORS error" | Update CORS origins in `main.py` |

## Useful Commands

```bash
# Start server
uvicorn main:app --reload --port 8000

# Run tests
python test_setup.py

# Database backup (SQLite)
cp vendorbridge.db vendorbridge.db.backup

# Check database integrity
sqlite3 vendorbridge.db "PRAGMA integrity_check;"

# View recent activity logs
sqlite3 vendorbridge.db "SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10;"

# Count records
sqlite3 vendorbridge.db "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM vendors;"

# Docker deployment
docker-compose up -d
docker-compose down
docker-compose logs -f

# Virtual environment management
python -m venv venv              # Create
source venv/bin/activate         # Activate (Linux/macOS)
venv\Scripts\activate            # Activate (Windows)
deactivate                       # Deactivate
```

## Next Steps

1. **Explore the API**
   - [ ] Open http://localhost:8000/docs
   - [ ] Read endpoint descriptions
   - [ ] Try "Try it out" feature in Swagger UI
   - [ ] Test each endpoint with sample data

2. **Understand the Workflow**
   - [ ] Create RFQ → Invite Vendors → Get Quotations → Select → Approve → Generate PO → Create Invoice

3. **Integrate with Your System**
   - [ ] Document API endpoints needed
   - [ ] Plan frontend/integration
   - [ ] Develop & test integration
   - [ ] Deploy to production

4. **Customize as Needed**
   - [ ] Add custom fields
   - [ ] Modify tax rates
   - [ ] Update email templates
   - [ ] Customize PDF formats
   - [ ] Add additional workflows

## Support Resources

- **API Documentation**: http://localhost:8000/docs
- **README**: See README.md for comprehensive guide
- **Setup Guide**: See SETUP.md for detailed instructions
- **Code Comments**: All files well-commented for understanding
- **Database Schema**: See database.py for table definitions

## Success Criteria

You have successfully set up VendorBridge when:
- [ ] Server starts without errors
- [ ] Can login with admin credentials
- [ ] Can view all API endpoints in Swagger UI
- [ ] Can create a vendor
- [ ] Can create an RFQ
- [ ] Dashboard shows statistics
- [ ] Activity logs are being recorded
- [ ] Test suite passes all tests
- [ ] Email configuration works (if configured)
- [ ] PDF generation works

---

**Congratulations!** Your VendorBridge ERP system is ready to use! 🎉

If you encounter any issues, refer to SETUP.md or check the detailed README.md file.
