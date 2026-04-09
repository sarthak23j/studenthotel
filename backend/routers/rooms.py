from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Room, RoomStatus
from schemas import RoomCreate, RoomUpdate, RoomResponse
from userCheck import require_admin, get_current_user

router = APIRouter()

@router.post("/", response_model=RoomResponse)
def create_room(room: RoomCreate, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    existing = db.query(Room).filter(Room.room_number == room.room_number).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room number already exists"
        )
    new_room = Room(
        room_number=room.room_number,
        floor=room.floor,
        capacity=room.capacity,
        status=room.status
    )
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room

@router.get("/", response_model=List[RoomResponse])
def get_all_rooms(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    rooms = db.query(Room).all()
    return rooms

@router.get("/{room_id}", response_model=RoomResponse)
def get_room(room_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    return room

@router.patch("/{room_id}", response_model=RoomResponse)
def update_room(room_id: int, updates: RoomUpdate, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    if updates.room_number is not None:
        room.room_number = updates.room_number
    if updates.floor is not None:
        room.floor = updates.floor
    if updates.capacity is not None:
        room.capacity = updates.capacity
    if updates.status is not None:
        room.status = updates.status
    db.commit()
    db.refresh(room)
    return room

@router.delete("/{room_id}")
def delete_room(room_id: int, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    db.delete(room)
    db.commit()
    return {"message": f"Room {room.room_number} deleted successfully"}