from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from schemas import SiteSettingRead, SiteSettingUpdate, SiteSettingCreate, MessageResponse
from models import SiteSetting
from database import get_db
import uuid
import os
import aiofiles
from pathlib import Path

router = APIRouter(prefix="/settings", tags=["Settings"])

# Upload directories for different types of settings
BACKGROUND_UPLOAD_DIR = "uploads/backgrounds"
PROFILE_UPLOAD_DIR = "uploads/profiles"

# Ensure upload directories exist
os.makedirs(BACKGROUND_UPLOAD_DIR, exist_ok=True)
os.makedirs(PROFILE_UPLOAD_DIR, exist_ok=True)

# Allowed image extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

def validate_image_file(filename: str) -> bool:
    """Validate if the uploaded file is an allowed image format."""
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS

@router.get("/", response_model=List[SiteSettingRead])
def read_settings(db: Session = Depends(get_db)):
    """
    Retrieve all site settings.
    """
    settings = db.query(SiteSetting).all()
    return settings

@router.get("/{key}", response_model=SiteSettingRead)
def read_setting(key: str, db: Session = Depends(get_db)):
    """
    Retrieve a specific site setting by key.
    """
    setting = db.query(SiteSetting).filter(SiteSetting.key == key).first()
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Setting with key '{key}' not found"
        )
    return setting

@router.post("/", response_model=SiteSettingRead, status_code=status.HTTP_201_CREATED)
def create_setting(setting_data: SiteSettingCreate, db: Session = Depends(get_db)):
    """
    Create a new site setting.
    """
    # Check if setting with this key already exists
    existing_setting = db.query(SiteSetting).filter(SiteSetting.key == setting_data.key).first()
    if existing_setting:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Setting with key '{setting_data.key}' already exists"
        )
    
    try:
        new_setting = SiteSetting(
            key=setting_data.key,
            value=setting_data.value,
            description=setting_data.description
        )
        db.add(new_setting)
        db.commit()
        db.refresh(new_setting)
        return new_setting
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error creating setting: {str(e)}"
        )

@router.put("/{key}", response_model=SiteSettingRead)
def update_setting(key: str, update_data: SiteSettingUpdate, db: Session = Depends(get_db)):
    """
    Update a site setting by key. Creates the setting if it doesn't exist.
    """
    setting = db.query(SiteSetting).filter(SiteSetting.key == key).first()
    
    try:
        if not setting:
            # Create new setting if it doesn't exist
            setting = SiteSetting(
                key=key, 
                value=update_data.value, 
                description=update_data.description
            )
            db.add(setting)
        else:
            # Update existing setting
            setting.value = update_data.value
            if update_data.description is not None:
                setting.description = update_data.description
        
        db.commit()
        db.refresh(setting)
        return setting
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error updating setting: {str(e)}"
        )

@router.delete("/{key}", response_model=MessageResponse)
def delete_setting(key: str, db: Session = Depends(get_db)):
    """
    Delete a site setting by key.
    """
    setting = db.query(SiteSetting).filter(SiteSetting.key == key).first()
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Setting with key '{key}' not found"
        )
    
    try:
        db.delete(setting)
        db.commit()
        return MessageResponse(message=f"Setting '{key}' deleted successfully")
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error deleting setting: {str(e)}"
        )

@router.post("/background-image", response_model=SiteSettingRead)
async def upload_background_image(
    description: Optional[str] = Form(None, description="Description for the background image"),
    image: UploadFile = File(..., description="Background image file"),
    db: Session = Depends(get_db)
):
    """
    Upload a new background image and update the background_image setting.
    """
    # Validate file type
    if not validate_image_file(image.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Invalid image format. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Validate file size (max 20MB for background images)
    max_size = 20 * 1024 * 1024  # 20MB
    content = await image.read()
    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="File size too large. Maximum size is 20MB"
        )
    
    try:
        # Generate unique filename
        file_ext = Path(image.filename).suffix.lower()
        unique_filename = f"background_{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(BACKGROUND_UPLOAD_DIR, unique_filename)
        
        # Save file asynchronously
        async with aiofiles.open(file_path, "wb") as out_file:
            await out_file.write(content)
        
        # Update or create the background_image setting
        image_url = f"/uploads/backgrounds/{unique_filename}"
        setting = db.query(SiteSetting).filter(SiteSetting.key == "background_image").first()
        
        if not setting:
            setting = SiteSetting(
                key="background_image",
                value=image_url,
                description=description or "Site background image"
            )
            db.add(setting)
        else:
            # Delete old background image if it exists
            if setting.value.startswith("/uploads/backgrounds/"):
                old_file_path = setting.value[1:]  # Remove leading slash
                if os.path.exists(old_file_path):
                    os.remove(old_file_path)
            
            setting.value = image_url
            if description:
                setting.description = description
        
        db.commit()
        db.refresh(setting)
        return setting
        
    except Exception as e:
        db.rollback()
        # Clean up uploaded file if database operation failed
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error uploading background image: {str(e)}"
        )

@router.post("/profile-image", response_model=SiteSettingRead)
async def upload_profile_image(
    description: Optional[str] = Form(None, description="Description for the profile image"),
    image: UploadFile = File(..., description="Profile image file"),
    db: Session = Depends(get_db)
):
    """
    Upload a new profile image and update the admin_profile_image setting.
    """
    # Validate file type
    if not validate_image_file(image.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Invalid image format. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Validate file size (max 5MB for profile images)
    max_size = 5 * 1024 * 1024  # 5MB
    content = await image.read()
    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="File size too large. Maximum size is 5MB"
        )
    
    try:
        # Generate unique filename
        file_ext = Path(image.filename).suffix.lower()
        unique_filename = f"profile_{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(PROFILE_UPLOAD_DIR, unique_filename)
        
        # Save file asynchronously
        async with aiofiles.open(file_path, "wb") as out_file:
            await out_file.write(content)
        
        # Update or create the admin_profile_image setting
        image_url = f"/uploads/profiles/{unique_filename}"
        setting = db.query(SiteSetting).filter(SiteSetting.key == "admin_profile_image").first()
        
        if not setting:
            setting = SiteSetting(
                key="admin_profile_image",
                value=image_url,
                description=description or "Admin profile image"
            )
            db.add(setting)
        else:
            # Delete old profile image if it exists
            if setting.value.startswith("/uploads/profiles/"):
                old_file_path = setting.value[1:]  # Remove leading slash
                if os.path.exists(old_file_path):
                    os.remove(old_file_path)
            
            setting.value = image_url
            if description:
                setting.description = description
        
        db.commit()
        db.refresh(setting)
        return setting
        
    except Exception as e:
        db.rollback()
        # Clean up uploaded file if database operation failed
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error uploading profile image: {str(e)}"
        )

@router.get("/commissions/status")
def get_commissions_status(db: Session = Depends(get_db)):
    """
    Get the current commissions open/closed status.
    """
    setting = db.query(SiteSetting).filter(SiteSetting.key == "commissions_open").first()
    commissions_open = setting.value.lower() == "true" if setting else True
    
    return {"commissions_open": commissions_open}

@router.post("/commissions/status")
def update_commissions_status(
    commissions_open: bool, 
    db: Session = Depends(get_db)
):
    """
    Update the commissions open/closed status.
    """
    try:
        setting = db.query(SiteSetting).filter(SiteSetting.key == "commissions_open").first()
        
        if not setting:
            setting = SiteSetting(
                key="commissions_open",
                value=str(commissions_open).lower(),
                description="Whether commissions are currently open"
            )
            db.add(setting)
        else:
            setting.value = str(commissions_open).lower()
        
        db.commit()
        db.refresh(setting)
        
        return {
            "commissions_open": commissions_open,
            "message": f"Commissions status updated to {'open' if commissions_open else 'closed'}"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error updating commissions status: {str(e)}"
        )

@router.get("/initialize")
def initialize_default_settings(db: Session = Depends(get_db)):
    """
    Initialize default site settings if they don't exist.
    """
    default_settings = [
        {
            "key": "commissions_open",
            "value": "true",
            "description": "Whether commissions are currently open"
        },
        {
            "key": "terms_of_service",
            "value": "# Termos de Serviço\n\nTermos padrão do serviço...",
            "description": "Terms of service content"
        },
        {
            "key": "pricing_info",
            "value": '[]',
            "description": "Pricing information in JSON format"
        },
        {
            "key": "work_hours",
            "value": '{"monday": "09:00-17:00", "tuesday": "09:00-17:00", "wednesday": "09:00-17:00", "thursday": "09:00-17:00", "friday": "09:00-17:00", "saturday": "Fechado", "sunday": "Fechado"}',
            "description": "Work hours in JSON format"
        }
    ]
    
    created_settings = []
    
    try:
        for setting_data in default_settings:
            existing = db.query(SiteSetting).filter(SiteSetting.key == setting_data["key"]).first()
            if not existing:
                new_setting = SiteSetting(**setting_data)
                db.add(new_setting)
                created_settings.append(setting_data["key"])
        
        db.commit()
        
        return {
            "message": "Default settings initialized",
            "created_settings": created_settings
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error initializing settings: {str(e)}"
        )
