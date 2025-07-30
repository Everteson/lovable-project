from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Commission Request Schemas
class CommissionRequestBase(BaseModel):
    full_name: str
    discord_id: str
    email: EmailStr
    project_description: str
    file_reference: Optional[str] = None

class CommissionRequestCreate(CommissionRequestBase):
    pass

class CommissionRequestUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None
    progress_status: Optional[str] = None
    notes: Optional[str] = None

class CommissionRequestRead(CommissionRequestBase):
    id: str
    status: str
    payment_status: str
    progress_status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Portfolio Item Schemas
class PortfolioItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str

class PortfolioItemCreate(PortfolioItemBase):
    # the image will be handled via file upload so image_url is not provided here
    pass

class PortfolioItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_featured: Optional[bool] = None

class PortfolioItemRead(PortfolioItemBase):
    id: str
    image_url: str
    is_featured: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Site Setting Schemas
class SiteSettingBase(BaseModel):
    key: str
    value: str
    description: Optional[str] = None

class SiteSettingCreate(SiteSettingBase):
    pass

class SiteSettingUpdate(BaseModel):
    value: str
    description: Optional[str] = None

class SiteSettingRead(SiteSettingBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True

# User/Auth Schemas
class UserBase(BaseModel):
    email: EmailStr
    display_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserRead(UserBase):
    id: str
    role: str
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Portfolio Category Schemas
class PortfolioCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class PortfolioCategoryCreate(PortfolioCategoryBase):
    pass

class PortfolioCategoryRead(PortfolioCategoryBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Response Models
class MessageResponse(BaseModel):
    message: str

class CommissionsStatusResponse(BaseModel):
    commissions_open: bool
    total_requests: int
    pending_requests: int

class DashboardStatsResponse(BaseModel):
    commissions_open: bool
    total_requests: int
    pending_requests: int
    portfolio_items: int
    categories: int
