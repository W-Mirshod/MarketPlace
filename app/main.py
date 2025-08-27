from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .api import auth, users, services, orders, websocket
from .database import engine
from .models import Base

app = FastAPI(
    title="Marketplace API",
    description="A comprehensive marketplace platform with authentication, payments, and real-time communication",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Marketplace API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/api/")
async def api_root():
    return {
        "message": "Welcome to Marketplace API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": {
            "auth": "/api/auth/",
            "users": "/api/users/",
            "services": "/api/services/",
            "orders": "/api/orders/",
            "websocket": "/api/ws/"
        }
    }

# Mount all API routes with /api prefix to match frontend expectations
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(services.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(websocket.router, prefix="/api")
