from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/auth/login')


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Could not validate credentials',
        headers={'WWW-Authenticate': 'Bearer'},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id: int = payload.get('sub')
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail='Admin access required')
    return current_user


async def require_owner(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ['owner', 'admin', 'both']:
        raise HTTPException(status_code=403, detail='Owner access required')
    return current_user