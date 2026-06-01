#test file for payments router
from fastapi import APIRouter

router = APIRouter()

@router.get("/test")
def test_payments():
    return {"message": "Payments router is working!"}

@router.post("/create-payment")
def create_payment():
    return {"message": "Payment creation - coming soon"}