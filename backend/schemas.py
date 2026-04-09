from pydantic import BaseModel, EmailStr
from enum import Enum
from datetime import datetime
from typing import Optional

class UserRole(str, Enum):
    admin = "admin"
    student = "student"

class AllocationStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class RoomStatus(str, Enum):
    available = "available"
    occupied = "occupied"
    maintenance = "maintenance"

# User schema
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.student

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole

    class Config:
        from_attributes = True

# Auth schema
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Room schema
class RoomCreate(BaseModel):
    room_number: str
    floor: int
    capacity: int
    status: RoomStatus = RoomStatus.available

class RoomUpdate(BaseModel):
    room_number: Optional[str] = None
    floor: Optional[int] = None
    capacity: Optional[int] = None
    status: Optional[RoomStatus] = None

class RoomResponse(BaseModel):
    id: int
    room_number: str
    floor: int
    capacity: int
    status: RoomStatus

    class Config:
        from_attributes = True

# Allocation schema
class AllocationCreate(BaseModel):
    room_id: int

class RoomNested(BaseModel):
    id:          int
    room_number: str
    floor:       int
    capacity:    int
    status:      RoomStatus

    class Config:
        from_attributes = True

class UserNested(BaseModel):
    id:   int
    name: str
    email: str

    class Config:
        from_attributes = True

class AllocationStatusUpdate(BaseModel):
    status: AllocationStatus

class AllocationResponse(BaseModel):
    id: int
    room_id: int
    student_id: int
    status: AllocationStatus
    created_at: datetime
    room: RoomNested | None = None
    student: UserNested | None = None

    class Config:
        from_attributes = True