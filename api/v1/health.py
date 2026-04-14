from fastapi import APIRouter
import datetime

router = APIRouter()


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.now().isoformat(),
        "service": "nexus-fit-api",
        "version": "1.0.0",
    }