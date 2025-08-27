#!/usr/bin/env python3
"""
Database initialization script for the marketplace project
Creates sample users, services, and initial data
"""

import asyncio
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, User, Service, UserRole
from app.auth import get_password_hash

def init_db():
    """Initialize database with sample data"""
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            # Create admin user
            admin_user = User(
                email="admin@marketplace.com",
                username="admin",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin_user)
            print("👑 Admin user created: admin/admin123")
        
        # Check if sample worker exists
        worker_user = db.query(User).filter(User.username == "worker1").first()
        if not worker_user:
            # Create sample worker
            worker_user = User(
                email="worker1@marketplace.com",
                username="worker1",
                hashed_password=get_password_hash("worker123"),
                role=UserRole.WORKER,
                is_active=True
            )
            db.add(worker_user)
            print("👷 Worker user created: worker1/worker123")
        
        # Check if sample client exists
        client_user = db.query(User).filter(User.username == "client1").first()
        if not client_user:
            # Create sample client
            client_user = User(
                email="client1@marketplace.com",
                username="client1",
                hashed_password=get_password_hash("client123"),
                role=UserRole.CLIENT,
                is_active=True
            )
            db.add(client_user)
            print("👤 Client user created: client1/client123")
        
        # Check if sample services exist
        services = db.query(Service).all()
        if not services:
            # Create sample services
            sample_services = [
                Service(
                    name="Web Development",
                    description="Professional web development services",
                    price=500.0,
                    category="Technology",
                    is_active=True
                ),
                Service(
                    name="Graphic Design",
                    description="Creative graphic design solutions",
                    price=300.0,
                    category="Design",
                    is_active=True
                ),
                Service(
                    name="Content Writing",
                    description="High-quality content creation",
                    price=150.0,
                    category="Marketing",
                    is_active=True
                ),
                Service(
                    name="Consulting",
                    description="Business strategy consulting",
                    price=200.0,
                    category="Business",
                    is_active=True
                )
            ]
            
            for service in sample_services:
                db.add(service)
            
            print("🛍️ Sample services created")
        
        db.commit()
        print("\n✅ Database initialized successfully!")
        print("\n📋 Sample Users:")
        print("   Admin: admin/admin123")
        print("   Worker: worker1/worker123")
        print("   Client: client1/client123")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🗄️ Initializing Marketplace Database...\n")
    init_db()
