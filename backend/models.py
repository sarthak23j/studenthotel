from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
import enum

class UserRole(enum.Enum):
    admin = "admin"
    student = "student"

class AllocationStatus(enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class RoomStatus(enum.Enum):
    available = "available"
    occupied = "occupied"
    maintenance = "maintenance"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.student)

    requests = relationship("AllocationRequest", back_populates="student")

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    room_number = Column(String, unique=True, nullable=False)
    floor = Column(Integer, nullable=False)
    capacity = Column(Integer, nullable=False)
    occupancy = Column(Integer, default=0, nullable=False)
    status = Column(Enum(RoomStatus), default=RoomStatus.available)

    requests = relationship("AllocationRequest", back_populates="room")

class AllocationRequest(Base):
    __tablename__ = "allocation_requests"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    status = Column(Enum(AllocationStatus), default=AllocationStatus.pending)
    created_at = Column(DateTime, default=datetime.now)

    student = relationship("User", back_populates="requests")
    room = relationship("Room", back_populates="requests")