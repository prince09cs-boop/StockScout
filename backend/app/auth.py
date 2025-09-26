from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime, timedelta
import os, jwt

router = APIRouter()
SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret')
ALGO = os.getenv('JWT_ALGO', 'HS256')
EXPIRE_MIN = int(os.getenv('ACCESS_TOKEN_EXPIRES_MIN', '1440'))

class RequestOTP(BaseModel):
    identifier: str

class VerifyOTP(BaseModel):
    identifier: str
    otp: str

_OTP_STORE = {}

@router.post('/request-otp')
async def request_otp(payload: RequestOTP):
    identifier = payload.identifier
    otp = '123456' if os.getenv('DEV_MODE', 'true').lower() == 'true' else '000000'
    _OTP_STORE[identifier] = otp
    return {"status": "ok", "dev_otp": otp}

@router.post('/verify-otp')
async def verify_otp(payload: VerifyOTP):
    identifier = payload.identifier
    otp = payload.otp
    expected = _OTP_STORE.get(identifier)
    if expected != otp:
        raise HTTPException(status_code=401, detail='Invalid OTP')
    token = jwt.encode({"sub": identifier, "exp": datetime.utcnow() + timedelta(minutes=EXPIRE_MIN)}, SECRET_KEY, algorithm=ALGO)
    return {"access_token": token, "token_type": "bearer"}

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
security = HTTPBearer()

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    token = creds.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGO])
        return payload['sub']
    except Exception:
        raise HTTPException(status_code=401, detail='Invalid auth')
