from pydantic import BaseModel, Field, ConfigDict
from typing import Literal


class WorkoutInput(BaseModel):
    gender: Literal["male", "female"] = Field(..., description="User gender")
    age: int = Field(..., ge=10, le=100, description="Age in years")
    height: float = Field(..., gt=0, description="Height in cm")
    weight: float = Field(..., gt=0, description="Weight in kg")
    duration: float = Field(..., gt=0, description="Workout duration in minutes")
    heart_rate: float = Field(..., gt=0, description="Average heart rate in BPM")
    body_temp: float = Field(..., gt=0, description="Body temperature in °C")


class CaloriePrediction(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    calories_burned: float = Field(..., description="Predicted calories burned")
    lower_bound: float = Field(..., description="Lower bound of confidence interval")
    upper_bound: float = Field(..., description="Upper bound of confidence interval")
    confidence_level: float = Field(..., description="Confidence level (0-1)")
    model_version: str = Field(..., description="Model version used")
    features_used: int = Field(..., description="Number of features used")


class ShapExplanation(BaseModel):
    feature: str
    value: float
    contribution: float
    direction: str


class CalorieResponse(BaseModel):
    prediction: CaloriePrediction
    shap_top_features: list[ShapExplanation]
    insight: str
    intensity_zone: str
    efficiency_rating: str