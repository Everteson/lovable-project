from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException, status, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from schemas import PortfolioItemRead, PortfolioItemUpdate, MessageResponse
from models import PortfolioItem, PortfolioCategory
from database import get_db
import uuid
import os
import aiofiles
from pathlib import Path

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])
UPLOAD_DIR = "uploads/portfolio"

# Ensure the upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Allowed image extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

def validate_image_file(filename: str) -> bool:
    """Validate if the uploaded file is an allowed image format."""
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS

@router.get("/", response_model=List[PortfolioItemRead])
def read_portfolio_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[str] = Query(None, description="Filter by category"),
    featured_only: bool = Query(False, description="Show only featured items"),
    db: Session = Depends(get_db)
):
    """
    Retrieve portfolio items with optional filtering and pagination.
    """
    query = db.query(PortfolioItem)
    
    if category:
        query = query.filter(PortfolioItem.category == category)
    
    if featured_only:
        query = query.filter(PortfolioItem.is_featured == True)
    
    # Order by creation date (newest first)
    query = query.order_by(PortfolioItem.created_at.desc())
    
    items = query.offset(skip).limit(limit).all()
    return items

@router.get("/{item_id}", response_model=PortfolioItemRead)
def read_portfolio_item(item_id: str, db: Session = Depends(get_db)):
    """
    Retrieve a specific portfolio item by ID.
    """
    item = db.query(PortfolioItem).filter(PortfolioItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Portfolio item not found"
        )
    return item

@router.post("/", response_model=PortfolioItemRead, status_code=status.HTTP_201_CREATED)
async def create_portfolio_item(
    title: str = Form(..., description="Title of the portfolio item"),
    description: Optional[str] = Form(None, description="Description of the portfolio item"),
    category: str = Form(..., description="Category of the portfolio item"),
    is_featured: bool = Form(False, description="Whether this item is featured"),
    image: UploadFile = File(..., description="Image file for the portfolio item"),
    db: Session = Depends(get_db)
):
    """
    Create a new portfolio item with image upload.
    """
    # Validate file type
    if not validate_image_file(image.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Invalid image format. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Validate file size (max 10MB)
    max_size = 10 * 1024 * 1024  # 10MB
    content = await image.read()
    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="File size too large. Maximum size is 10MB"
        )
    
    try:
        # Generate unique filename
        file_ext = Path(image.filename).suffix.lower()
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save file asynchronously
        async with aiofiles.open(file_path, "wb") as out_file:
            await out_file.write(content)
        
        # Create database record
        new_item = PortfolioItem(
            id=str(uuid.uuid4()),
            title=title,
            description=description,
            category=category,
            is_featured=is_featured,
            image_url=f"/uploads/portfolio/{unique_filename}"  # Store relative URL
        )
        
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        
        return new_item
        
    except Exception as e:
        db.rollback()
        # Clean up uploaded file if database operation failed
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error creating portfolio item: {str(e)}"
        )

@router.put("/{item_id}", response_model=PortfolioItemRead)
def update_portfolio_item(
    item_id: str, 
    update_data: PortfolioItemUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update a portfolio item (without changing the image).
    """
    item = db.query(PortfolioItem).filter(PortfolioItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Portfolio item not found"
        )
    
    try:
        # Update only provided fields
        update_dict = update_data.dict(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(item, field, value)
        
        db.commit()
        db.refresh(item)
        return item
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error updating portfolio item: {str(e)}"
        )

@router.delete("/{item_id}", response_model=MessageResponse)
def delete_portfolio_item(item_id: str, db: Session = Depends(get_db)):
    """
    Delete a portfolio item and its associated image file.
    """
    item = db.query(PortfolioItem).filter(PortfolioItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Portfolio item not found"
        )
    
    try:
        # Delete the image file from local storage
        if item.image_url.startswith("/uploads/"):
            file_path = item.image_url[1:]  # Remove leading slash
            if os.path.exists(file_path):
                os.remove(file_path)
        
        # Delete from database
        db.delete(item)
        db.commit()
        
        return MessageResponse(message="Portfolio item deleted successfully")
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error deleting portfolio item: {str(e)}"
        )

@router.get("/categories/list")
def get_portfolio_categories(db: Session = Depends(get_db)):
    """
    Get all unique portfolio categories.
    """
    # Get categories from portfolio items
    categories = db.query(PortfolioItem.category).distinct().all()
    category_list = [cat[0] for cat in categories if cat[0]]
    
    # Also get categories from the categories table if it exists
    try:
        db_categories = db.query(PortfolioCategory).all()
        for cat in db_categories:
            if cat.name not in category_list:
                category_list.append(cat.name)
    except:
        pass  # Categories table might not exist yet
    
    return {"categories": sorted(category_list)}

@router.get("/stats/summary")
def get_portfolio_stats(db: Session = Depends(get_db)):
    """
    Get portfolio statistics summary.
    """
    total_items = db.query(PortfolioItem).count()
    featured_items = db.query(PortfolioItem).filter(PortfolioItem.is_featured == True).count()
    categories = db.query(PortfolioItem.category).distinct().count()
    
    return {
        "total_items": total_items,
        "featured_items": featured_items,
        "categories": categories
    }

@router.post("/{item_id}/toggle-featured", response_model=PortfolioItemRead)
def toggle_featured_status(item_id: str, db: Session = Depends(get_db)):
    """
    Toggle the featured status of a portfolio item.
    """
    item = db.query(PortfolioItem).filter(PortfolioItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Portfolio item not found"
        )
    
    try:
        item.is_featured = not item.is_featured
        db.commit()
        db.refresh(item)
        return item
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error updating featured status: {str(e)}"
        )
