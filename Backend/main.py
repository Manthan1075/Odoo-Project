from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from contextlib import asynccontextmanager
from routes import activity, approvals, auth, dashboard, invoices, purchase_orders, quotations, reports, rfq
from database import create_tables, init_default_data
from routes import vendors

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_tables()
    init_default_data()
    yield
    # Shutdown
    pass

app = FastAPI(
    title="VendorBridge ERP",
    description="Complete Procurement & Vendor Management System",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(vendors.router)
app.include_router(rfq.router)
app.include_router(quotations.router)
app.include_router(approvals.router)
app.include_router(purchase_orders.router)
app.include_router(invoices.router)
app.include_router(dashboard.router)
app.include_router(activity.router)
app.include_router(reports.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to VendorBridge ERP",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }

@app.get("/health")
def health_check():
    try:
        from database import get_db_connection
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        conn.close()
        
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
