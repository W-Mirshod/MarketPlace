from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..auth import get_current_active_user, require_role
from ..crud import ServiceCRUD
from ..schemas import Service, ServiceCreate
from ..models import User

router = APIRouter(prefix="/services", tags=["services"])

@router.get("/", response_model=List[Service])
def get_services(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    services = ServiceCRUD.get_services(db, skip=skip, limit=limit)
    return services

@router.get("/category/{category}", response_model=List[Service])
def get_services_by_category(
    category: str,
    db: Session = Depends(get_db)
):
    services = ServiceCRUD.get_services_by_category(db, category=category)
    return services

@router.get("/{service_id}", response_model=Service)
def get_service(
    service_id: int,
    db: Session = Depends(get_db)
):
    service = ServiceCRUD.get_service(db, service_id=service_id)
    if service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@router.post("/", response_model=Service)
def create_service(
    service: ServiceCreate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    return ServiceCRUD.create_service(db=db, service=service)

@router.put("/{service_id}", response_model=Service)
def update_service(
    service_id: int,
    service: ServiceCreate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    db_service = ServiceCRUD.get_service(db, service_id=service_id)
    if db_service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    
    for field, value in service.dict().items():
        setattr(db_service, field, value)
    
    db.commit()
    db.refresh(db_service)
    return db_service

@router.delete("/{service_id}")
def delete_service(
    service_id: int,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    service = ServiceCRUD.get_service(db, service_id=service_id)
    if service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    
    service.is_active = False
    db.commit()
    return {"message": "Service deactivated successfully"}
