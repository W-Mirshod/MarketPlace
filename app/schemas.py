from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from .models import UserRole, OrderStatus

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.CLIENT

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class ServiceBase(BaseModel):
    name: str
    description: str
    price: float
    category: str

class ServiceCreate(ServiceBase):
    pass

class Service(ServiceBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    service_id: int

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    worker_id: Optional[int] = None
    status: Optional[OrderStatus] = None
    payment_intent_id: Optional[str] = None

class Order(OrderBase):
    id: int
    client_id: int
    worker_id: Optional[int]
    status: OrderStatus
    total_amount: float
    payment_intent_id: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class OrderWithDetails(Order):
    client: User
    worker: Optional[User]
    service: Service

class PaymentIntent(BaseModel):
    amount: int
    currency: str = "usd"
    payment_method_types: List[str] = ["card"]
