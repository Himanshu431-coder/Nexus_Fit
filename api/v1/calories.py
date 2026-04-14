from fastapi import APIRouter, HTTPException
from models.schemas import WorkoutInput, CalorieResponse
from services.calorie_engine import engine

router = APIRouter()


@router.post("/predict", response_model=CalorieResponse)
def predict_calories(workout: WorkoutInput):
    try:
        result = engine.predict(workout.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.get("/model-info")
def model_info():
    if engine.metadata is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {
        "model_version": "nexus-v1.0-xgboost-optuna",
        "r2_score": engine.metadata.get("r2_score"),
        "features_count": engine.metadata.get("n_features"),
        "confidence_level": engine.metadata.get("confidence_level"),
        "conformal_coverage": engine.metadata.get("conformal_coverage"),
        "avg_interval_kcal": engine.metadata.get("avg_interval_kcal"),
        "features": engine.metadata.get("features"),
    }