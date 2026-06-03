from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.document import UserDocument, DocumentType, DocumentStatus
from app.models.user import User
from app.utils.dependencies import get_current_user, require_admin
from app.services.upload_service import upload_image

router = APIRouter()


@router.post('/upload', status_code=201)
async def upload_document(
    document_type: DocumentType = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    allowed_types = ['image/jpeg', 'image/png', 'application/pdf']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail='Only JPEG, PNG, or PDF files allowed')

    url = await upload_image(file, folder=f'documents/{current_user.id}')

    # Remove any old document of the same type for this user
    old = db.query(UserDocument).filter(
        UserDocument.user_id == current_user.id,
        UserDocument.document_type == document_type
    ).first()
    if old:
        db.delete(old)

    doc = UserDocument(
        user_id=current_user.id,
        document_type=document_type,
        document_url=url,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.get('/my')
def my_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(UserDocument).filter(UserDocument.user_id == current_user.id).all()


# Admin-only: approve or reject a document
@router.patch('/{doc_id}/approve')
def approve_document(
    doc_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    doc = db.query(UserDocument).filter(UserDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail='Document not found')
    doc.status = DocumentStatus.APPROVED
    doc.reviewed_by = admin.id
    from datetime import datetime
    doc.reviewed_at = datetime.utcnow()
    db.commit()
    return {'message': 'Document approved'}


@router.patch('/{doc_id}/reject')
def reject_document(
    doc_id: int,
    reason: str = 'Document not clear',
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    doc = db.query(UserDocument).filter(UserDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail='Document not found')
    doc.status = DocumentStatus.REJECTED
    doc.rejection_reason = reason
    doc.reviewed_by = admin.id
    from datetime import datetime
    doc.reviewed_at = datetime.utcnow()
    db.commit()
    return {'message': 'Document rejected'}