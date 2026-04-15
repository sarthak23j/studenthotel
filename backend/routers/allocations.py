from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import AllocationRequest, AllocationStatus, Room, RoomStatus
from schemas import AllocationCreate, AllocationResponse, AllocationStatusUpdate, AllocationStatus as SAllocationStatus
from userCheck import require_admin, require_student
from typing import List

router = APIRouter()

@router.post("/", response_model=AllocationResponse)
def apply_for_room(data: AllocationCreate, db: Session = Depends(get_db), current_user=Depends(require_student)):
    room = db.query(Room).filter(Room.id == data.room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    if room.status != RoomStatus.available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room is not available"
        )
    existing_request = db.query(AllocationRequest).filter(
        AllocationRequest.student_id == current_user.id,
        AllocationRequest.status == AllocationStatus.pending
    ).first()
    if existing_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a pending request"
        )
    new_request = AllocationRequest(
        student_id=current_user.id,
        room_id=data.room_id,
        status=AllocationStatus.pending
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request

@router.get("/", response_model=List[AllocationResponse])
def get_all_requests(db: Session = Depends(get_db), current_user=Depends(require_admin)):
    requests = (
        db.query(AllocationRequest)
        .options(joinedload(AllocationRequest.room), joinedload(AllocationRequest.student))
        .all()
    )
    return requests

@router.get("/my", response_model=List[AllocationResponse])
def get_my_requests(db: Session = Depends(get_db), current_user=Depends(require_student)):
    requests = (
        db.query(AllocationRequest)
        .options(joinedload(AllocationRequest.room), joinedload(AllocationRequest.student))
        .filter(AllocationRequest.student_id == current_user.id)
        .all()
    )
    return requests

@router.patch("/{request_id}", response_model=AllocationResponse)
def update_request_status(request_id: int, updates: AllocationStatusUpdate, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    request = db.query(AllocationRequest).filter(AllocationRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if request.status != AllocationStatus.pending:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request has already been processed")

    room = db.query(Room).filter(Room.id == request.room_id).first()

    print(f"DEBUG — room found: {room}")
    print(f"DEBUG — room.id: {room.id}")
    print(f"DEBUG — room.occupancy before: {room.occupancy}")
    print(f"DEBUG — room.capacity: {room.capacity}")
    print(f"DEBUG — updates.status: {updates.status}")
    print(f"DEBUG — AllocationStatus.approved: {AllocationStatus.approved}")
    print(f"DEBUG — match: {updates.status.value == SAllocationStatus.approved}")

    if updates.status.value == SAllocationStatus.approved:
        print("DEBUG — entered approved block")
        if room.occupancy >= room.capacity:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Room is already at full capacity")
        room.occupancy += 1
        print(f"DEBUG — room.occupancy after increment: {room.occupancy}")
        if room.occupancy >= room.capacity:
            room.status = RoomStatus.occupied

    if updates.status.value == SAllocationStatus.rejected:
        if room.occupancy > 0:
            room.occupancy -= 1
        if room.status == RoomStatus.occupied:
            room.status = RoomStatus.available

    request.status = updates.status
    db.add(room)
    db.commit()
    db.refresh(room)
    db.refresh(request)

    print(f"DEBUG — room.occupancy after commit: {room.occupancy}")
    return request

@router.delete("/{request_id}")
def cancel_request(request_id: int, db: Session = Depends(get_db), current_user=Depends(require_student)):
    request = db.query(AllocationRequest).filter(AllocationRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    if request.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only cancel your own requests"
        )
    if request.status != AllocationStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending requests can be cancelled"
        )
    db.delete(request)
    db.commit()
    return {"message": "Request cancelled successfully"}