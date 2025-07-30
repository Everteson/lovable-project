from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from schemas import (
    CommissionRequestCreate, 
    CommissionRequestRead, 
    CommissionRequestUpdate,
    MessageResponse
)
from models import CommissionRequest
from database import get_db
import uuid

router = APIRouter(prefix="/commissions", tags=["Commissions"])

@router.get("/", response_model=List[CommissionRequestRead])
def read_commissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db)
):
    """
    Retrieve all commission requests with optional filtering and pagination.
    """
    query = db.query(CommissionRequest)
    
    if status_filter:
        query = query.filter(CommissionRequest.status == status_filter)
    
    commissions = query.offset(skip).limit(limit).all()
    return commissions

@router.get("/{commission_id}", response_model=CommissionRequestRead)
def read_commission(commission_id: str, db: Session = Depends(get_db)):
    """
    Retrieve a specific commission request by ID.
    """
    commission = db.query(CommissionRequest).filter(CommissionRequest.id == commission_id).first()
    if not commission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Commission request not found"
        )
    return commission

@router.post("/", response_model=CommissionRequestRead, status_code=status.HTTP_201_CREATED)
def create_commission(request: CommissionRequestCreate, db: Session = Depends(get_db)):
    """
    Create a new commission request.
    """
    try:
        new_commission = CommissionRequest(
            id=str(uuid.uuid4()),
            full_name=request.full_name,
            discord_id=request.discord_id,
            email=request.email,
            project_description=request.project_description,
            file_reference=request.file_reference
        )
        db.add(new_commission)
        db.commit()
        db.refresh(new_commission)
        return new_commission
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error creating commission request: {str(e)}"
        )

@router.put("/{commission_id}", response_model=CommissionRequestRead)
def update_commission(
    commission_id: str, 
    update_data: CommissionRequestUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update a commission request (status, payment status, progress status, notes).
    """
    commission = db.query(CommissionRequest).filter(CommissionRequest.id == commission_id).first()
    if not commission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Commission request not found"
        )
    
    try:
        # Update only provided fields
        update_dict = update_data.dict(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(commission, field, value)
        
        db.commit()
        db.refresh(commission)
        return commission
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error updating commission request: {str(e)}"
        )

@router.delete("/{commission_id}", response_model=MessageResponse)
def delete_commission(commission_id: str, db: Session = Depends(get_db)):
    """
    Delete a commission request.
    """
    commission = db.query(CommissionRequest).filter(CommissionRequest.id == commission_id).first()
    if not commission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Commission request not found"
        )
    
    try:
        db.delete(commission)
        db.commit()
        return MessageResponse(message="Commission request deleted successfully")
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error deleting commission request: {str(e)}"
        )

@router.get("/stats/summary")
def get_commission_stats(db: Session = Depends(get_db)):
    """
    Get commission statistics summary.
    """
    total_requests = db.query(CommissionRequest).count()
    pending_requests = db.query(CommissionRequest).filter(CommissionRequest.status == "pending").count()
    in_progress_requests = db.query(CommissionRequest).filter(CommissionRequest.progress_status == "in_progress").count()
    completed_requests = db.query(CommissionRequest).filter(CommissionRequest.status == "completed").count()
    
    return {
        "total_requests": total_requests,
        "pending_requests": pending_requests,
        "in_progress_requests": in_progress_requests,
        "completed_requests": completed_requests
    }
