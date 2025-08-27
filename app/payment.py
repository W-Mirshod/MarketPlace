import stripe
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from .config import settings
from .models import Order, OrderStatus
from .schemas import PaymentIntent

stripe.api_key = settings.stripe_secret_key

class PaymentService:
    @staticmethod
    def create_payment_intent(order: Order, db: Session):
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(order.total_amount * 100),
                currency="usd",
                metadata={"order_id": order.id}
            )
            
            order.payment_intent_id = intent.id
            db.commit()
            
            return {
                "client_secret": intent.client_secret,
                "payment_intent_id": intent.id
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payment creation failed: {str(e)}"
            )
    
    @staticmethod
    def confirm_payment(payment_intent_id: str, db: Session):
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if intent.status == "succeeded":
                order = db.query(Order).filter(Order.payment_intent_id == payment_intent_id).first()
                if order:
                    order.status = OrderStatus.PAID
                    db.commit()
                    return {"status": "success", "message": "Payment confirmed"}
                else:
                    raise HTTPException(status_code=404, detail="Order not found")
            else:
                raise HTTPException(status_code=400, detail="Payment not successful")
                
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payment confirmation failed: {str(e)}"
            )
    
    @staticmethod
    def cancel_payment(payment_intent_id: str, db: Session):
        try:
            intent = stripe.PaymentIntent.cancel(payment_intent_id)
            
            order = db.query(Order).filter(Order.payment_intent_id == payment_intent_id).first()
            if order:
                order.status = OrderStatus.CANCELED
                db.commit()
                return {"status": "success", "message": "Payment canceled"}
            else:
                raise HTTPException(status_code=404, detail="Order not found")
                
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payment cancellation failed: {str(e)}"
            )
