from fastapi import APIRouter
from pydantic import BaseModel, Field
from services.zone_engine import predict_zone

router = APIRouter()


class ZoneInput(BaseModel):
    age: int = Field(..., ge=10, le=100, description="Age in years")
    heart_rate: float = Field(..., ge=40, le=250, description="Average heart rate (BPM)")
    duration: float = Field(..., gt=0, le=600, description="Duration in minutes")
    weight: float = Field(..., ge=20, le=300, description="Weight in kg")


@router.post("/predict-zone", response_model=dict)
def predict_heart_rate_zone(data: ZoneInput):
    """
    Predict heart rate training zone with recommendations.
    Uses Karvonen formula + individualized thresholds.
    """
    result = predict_zone(
        age=data.age,
        heart_rate=data.heart_rate,
        duration=data.duration,
        weight=data.weight,
    )
    return result