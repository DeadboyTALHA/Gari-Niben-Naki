from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.dispute import Dispute, DisputeStatus, DisputeResolution
from app.models.user    import User
from app.utils.dependencies import get_current_user, require_admin
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class DisputeCreate(BaseModel):
    booking_id:  int
    subject:     str
    description: str


class DisputeResolve(BaseModel):
    resolution:      DisputeResolution
    resolution_note: str
    refund_amount:   int = 0


@router.post('/', status_code=201)
def create_dispute(
    data: DisputeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    dispute = Dispute(
        booking_id=data.booking_id,
        raised_by=current_user.id,
        subject=data.subject,
        description=data.description,
    )
    db.add(dispute)
    db.commit()
    db.refresh(dispute)
    return dispute


@router.get('/my')
def my_disputes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Dispute).filter(Dispute.raised_by == current_user.id).all()


@router.get('/')  # Admin only
def all_disputes(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
    status: Optional[str] = None,
):
    query = db.query(Dispute)
    if status:
        query = query.filter(Dispute.status == status)
    return query.order_by(Dispute.created_at.desc()).all()


@router.patch('/{dispute_id}/resolve')  # Admin only
def resolve_dispute(
    dispute_id: int,
    data: DisputeResolve,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=404, detail='Dispute not found')
    from datetime import datetime
    dispute.status = DisputeStatus.RESOLVED
    dispute.resolution = data.resolution
    dispute.resolution_note = data.resolution_note
    dispute.refund_amount = data.refund_amount
    dispute.assigned_to = admin.id
    dispute.resolved_at = datetime.utcnow()
    db.commit()
    return {'message': 'Dispute resolved'}