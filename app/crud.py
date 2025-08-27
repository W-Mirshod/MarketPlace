from sqlalchemy.orm import Session
from sqlalchemy import and_
from . import models, schemas
from .auth import get_password_hash
from typing import List, Optional

class UserCRUD:
    @staticmethod
    def get_user(db: Session, user_id: int):
        return db.query(models.User).filter(models.User.id == user_id).first()
    
    @staticmethod
    def get_user_by_email(db: Session, email: str):
        return db.query(models.User).filter(models.User.email == email).first()
    
    @staticmethod
    def get_user_by_username(db: Session, username: str):
        return db.query(models.User).filter(models.User.username == username).first()
    
    @staticmethod
    def get_users(db: Session, skip: int = 0, limit: int = 100):
        return db.query(models.User).offset(skip).limit(limit).all()
    
    @staticmethod
    def create_user(db: Session, user: schemas.UserCreate):
        hashed_password = get_password_hash(user.password)
        db_user = models.User(
            email=user.email,
            username=user.username,
            hashed_password=hashed_password,
            role=user.role
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
        db_user = db.query(models.User).filter(models.User.id == user_id).first()
        if db_user:
            update_data = user_update.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_user, field, value)
            db.commit()
            db.refresh(db_user)
        return db_user

class ServiceCRUD:
    @staticmethod
    def get_service(db: Session, service_id: int):
        return db.query(models.Service).filter(models.Service.id == service_id).first()
    
    @staticmethod
    def get_services(db: Session, skip: int = 0, limit: int = 100):
        return db.query(models.Service).filter(models.Service.is_active == True).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_services_by_category(db: Session, category: str):
        return db.query(models.Service).filter(
            and_(models.Service.category == category, models.Service.is_active == True)
        ).all()
    
    @staticmethod
    def create_service(db: Session, service: schemas.ServiceCreate):
        db_service = models.Service(**service.dict())
        db.add(db_service)
        db.commit()
        db.refresh(db_service)
        return db_service

class OrderCRUD:
    @staticmethod
    def get_order(db: Session, order_id: int):
        return db.query(models.Order).filter(models.Order.id == order_id).first()
    
    @staticmethod
    def get_orders_by_client(db: Session, client_id: int):
        return db.query(models.Order).filter(models.Order.client_id == client_id).all()
    
    @staticmethod
    def get_orders_by_worker(db: Session, worker_id: int):
        return db.query(models.Order).filter(models.Order.worker_id == worker_id).all()
    
    @staticmethod
    def get_orders_by_category(db: Session, category: str):
        return db.query(models.Order).join(models.Service).filter(
            models.Service.category == category
        ).all()
    
    @staticmethod
    def get_all_orders(db: Session, skip: int = 0, limit: int = 100):
        return db.query(models.Order).offset(skip).limit(limit).all()
    
    @staticmethod
    def create_order(db: Session, order: schemas.OrderCreate, client_id: int, service_price: float):
        db_order = models.Order(
            **order.dict(),
            client_id=client_id,
            total_amount=service_price
        )
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        return db_order
    
    @staticmethod
    def update_order(db: Session, order_id: int, order_update: schemas.OrderUpdate):
        db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
        if db_order:
            update_data = order_update.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_order, field, value)
            db.commit()
            db.refresh(db_order)
        return db_order
