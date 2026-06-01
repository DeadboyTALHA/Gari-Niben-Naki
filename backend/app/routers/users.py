#test file for users router
from fastapi import APIRouter

router = APIRouter()

@router.get("/test")
def test_auth():
    return {"message": "Auth router works!"}