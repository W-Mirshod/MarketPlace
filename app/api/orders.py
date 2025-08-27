from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..auth import get_current_active_user, require_role
from ..crud import OrderCRUD, ServiceCRUD
from ..schemas import Order, OrderCreate, OrderUpdate, OrderWithDetails
from ..models import User, UserRole, OrderStatus
from ..websocket_manager import manager
from ..payment import PaymentService

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=Order)
async def create_order(
    order: OrderCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.CLIENT:
        raise HTTPException(status_code=403, detail="Only clients can create orders")
    
    service = ServiceCRUD.get_service(db, service_id=order.service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    if not service.is_active:
        raise HTTPException(status_code=400, detail="Service is not available")
    
    db_order = OrderCRUD.create_order(
        db=db, 
        order=order, 
        client_id=current_user.id, 
        service_price=service.price
    )
    
    await manager.notify_new_order({
        "id": db_order.id,
        "service_name": service.name,
        "category": service.category,
        "total_amount": db_order.total_amount
    })
    
    return db_order

@router.get("/", response_model=List[OrderWithDetails])
def get_orders(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if current_user.role == UserRole.CLIENT:
        orders = OrderCRUD.get_orders_by_client(db, client_id=current_user.id)
    elif current_user.role == UserRole.WORKER:
        orders = OrderCRUD.get_orders_by_worker(db, worker_id=current_user.id)
    elif current_user.role == UserRole.ADMIN:
        orders = OrderCRUD.get_all_orders(db, skip=skip, limit=limit)
    else:
        raise HTTPException(status_code=403, detail="Invalid user role")
    
    return orders

@router.get("/{order_id}", response_model=OrderWithDetails)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    order = OrderCRUD.get_order(db, order_id=order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if current_user.role == UserRole.CLIENT and order.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    
    if current_user.role == UserRole.WORKER and order.worker_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    
    return order

@router.put("/{order_id}/accept")
async def accept_order(
    order_id: int,
    current_user: User = Depends(require_role("worker")),
    db: Session = Depends(get_db)
):
    order = OrderCRUD.get_order(db, order_id=order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.worker_id is not None:
        raise HTTPException(status_code=400, detail="Order already assigned")
    
    order.worker_id = current_user.id
    db.commit()
    
    await manager.notify_order_accepted({
        "id": order.id,
        "worker_username": current_user.username
    }, order.client_id)
    
    return {"message": "Order accepted successfully"}

@router.put("/{order_id}/complete")
def complete_order(
    order_id: int,
    current_user: User = Depends(require_role("worker")),
    db: Session = Depends(get_db)
):
    order = OrderCRUD.get_order(db, order_id=order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.worker_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to complete this order")
    
    if order.status != OrderStatus.PAID:
        raise HTTPException(status_code=400, detail="Order must be paid before completion")
    
    order.status = OrderStatus.COMPLETED
    db.commit()
    
    return {"message": "Order completed successfully"}

@router.post("/{order_id}/payment")
async def create_payment(
    order_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    order = OrderCRUD.get_order(db, order_id=order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to pay for this order")
    
    if order.status != OrderStatus.PENDING:
        raise HTTPException(status_code=400, detail="Order is not in pending status")
    
    payment_data = PaymentService.create_payment_intent(order, db)
    
    await manager.notify_payment_status({
        "id": order.id,
        "status": "payment_created"
    }, order.client_id)
    
    return payment_data

@router.post("/{order_id}/payment/confirm")
async def confirm_payment(
    order_id: int,
    payment_intent_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    order = OrderCRUD.get_order(db, order_id=order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to confirm payment for this order")
    
    result = PaymentService.confirm_payment(payment_intent_id, db)
    
    await manager.notify_payment_status({
        "id": order.id,
        "status": "paid"
    }, order.client_id)
    
    return result

@router.post("/{order_id}/payment/cancel")
async def cancel_payment(
    order_id: int,
    payment_intent_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    order = OrderCRUD.get_order(db, order_id=order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel payment for this order")
    
    result = PaymentService.cancel_payment(payment_intent_id, db)
    
    await manager.notify_payment_status({
        "id": order.id,
        "status": "canceled"
    }, order.client_id)
    
    return result
