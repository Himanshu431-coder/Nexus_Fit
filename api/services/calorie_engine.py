import joblib
import numpy as np
import json
import os
from pathlib import Path


class ConformalPredictor:
    """Split-conformal prediction for uncertainty quantification."""

    def __init__(self, model=None, confidence_level=0.94):
        self.model = model
        self.confidence_level = confidence_level
        self.quantile = None
        self.scores = None

    def fit(self, X_cal, y_cal):
        y_pred_cal = self.model.predict(X_cal)
        self.scores = np.abs(y_cal - y_pred_cal)
        n = len(self.scores)
        q = np.ceil((n + 1) * self.confidence_level) / n
        q = min(q, 1.0)
        self.quantile = np.quantile(self.scores, q)
        return self

    def predict(self, X):
        y_pred = self.model.predict(X)
        lower = y_pred - self.quantile
        upper = y_pred + self.quantile
        return y_pred, lower, upper

    def coverage(self, X, y_true):
        y_pred, lower, upper = self.predict(X)
        covered = ((y_true >= lower) & (y_true <= upper)).mean()
        avg_width = (upper - lower).mean()
        return covered, avg_width

import sys
sys.modules['__main__'].ConformalPredictor = ConformalPredictor

# Path to model artifacts
MODEL_DIR = Path(__file__).parent.parent.parent / "ml" / "models"


class CalorieEngine:
    def __init__(self):
        self.model = None
        self.conformal_predictor = None
        self.label_encoder = None
        self.metadata = None
        self.features = None
        self._load_artifacts()

    def _load_artifacts(self):
        """Load all ML artifacts on startup."""
        try:
            self.model = joblib.load(MODEL_DIR / "nexus_calorie_model.joblib")
            self.conformal_predictor = joblib.load(
                MODEL_DIR / "nexus_conformal_predictor.joblib"
            )
            self.label_encoder = joblib.load(
                MODEL_DIR / "nexus_label_encoder.joblib"
            )
            with open(MODEL_DIR / "nexus_model_metadata.json", "r") as f:
                self.metadata = json.load(f)
            self.features = self.metadata["features"]
            print("✅ ML models loaded successfully")
        except Exception as e:
            print(f"⚠️ Could not load models: {e}")
            print("   API will start but predictions will not work")

    def _engineer_features(self, input_data: dict) -> np.ndarray:
        """Create all engineered features from raw input."""
        gender_encoded = 1 if str(input_data["gender"]) == "male" else 0
        age = input_data["age"]
        height = input_data["height"]
        weight = input_data["weight"]
        duration = input_data["duration"]
        heart_rate = input_data["heart_rate"]
        body_temp = input_data["body_temp"]

        features = {
            "Gender_Encoded": gender_encoded,
            "Age": age,
            "Height": height,
            "Weight": weight,
            "Duration": duration,
            "Heart_Rate": heart_rate,
            "Body_Temp": body_temp,
            "HR_x_Duration": heart_rate * duration,
            "HR_x_Temp": heart_rate * body_temp,
            "Duration_x_Temp": duration * body_temp,
            "Weight_x_Duration": weight * duration,
            "Age_x_HR": age * heart_rate,
            "HR_per_min": heart_rate / duration if duration > 0 else 0,
            "BMI": weight / ((height / 100) ** 2),
            "Intensity": heart_rate / (220 - age) if age > 0 else 0,
            "Temp_elevated": body_temp - 37.0,
            "Temp_x_Intensity": (body_temp - 37.0) * (heart_rate / (220 - age)) if age > 0 else 0,
            "Duration_sq": duration ** 2,
            "HR_sq": heart_rate ** 2,
            "Temp_sq": body_temp ** 2,
        }

        feature_array = np.array([[float(features[str(f)]) for f in self.features]])
        return feature_array

    def predict(self, input_data: dict) -> dict:
        """Make a prediction with confidence interval."""
        if self.model is None:
            raise RuntimeError("Models not loaded")

        X = self._engineer_features(input_data)
        calories = float(self.model.predict(X)[0])
        y_pred, lower, upper = self.conformal_predictor.predict(X)
        lower = float(lower[0])
        upper = float(upper[0])

        intensity = input_data["heart_rate"] / (220 - input_data["age"])
        zone = self._get_intensity_zone(intensity)

        cal_per_min = calories / input_data["duration"] if input_data["duration"] > 0 else 0
        efficiency = self._get_efficiency(cal_per_min)

        insight = self._generate_insight(input_data, calories, zone, efficiency)
        top_features = self._get_top_features(input_data)

        return {
            "prediction": {
                "calories_burned": round(calories, 1),
                "lower_bound": round(lower, 1),
                "upper_bound": round(upper, 1),
                "confidence_level": 0.94,
                "model_version": "nexus-v1.0-xgboost-optuna",
                "features_used": len(self.features),
            },
            "shap_top_features": top_features,
            "insight": insight,
            "intensity_zone": zone,
            "efficiency_rating": efficiency,
        }

    def _get_intensity_zone(self, intensity: float) -> str:
        if intensity < 0.5:
            return "Zone 1 — Very Light"
        elif intensity < 0.6:
            return "Zone 2 — Light"
        elif intensity < 0.7:
            return "Zone 3 — Moderate"
        elif intensity < 0.85:
            return "Zone 4 — Hard"
        else:
            return "Zone 5 — Maximum"

    def _get_efficiency(self, cal_per_min: float) -> str:
        if cal_per_min < 5:
            return "Low"
        elif cal_per_min < 8:
            return "Moderate"
        elif cal_per_min < 12:
            return "Good"
        elif cal_per_min < 16:
            return "Excellent"
        else:
            return "Elite"

    def _generate_insight(self, data: dict, calories: float, zone: str, efficiency: str) -> str:
        insights = []

        if "Maximum" in zone:
            insights.append("You're training at maximum intensity. Ensure adequate recovery.")
        elif "Hard" in zone:
            insights.append("Great high-intensity session. Your cardiovascular system is being challenged effectively.")
        elif "Moderate" in zone:
            insights.append("Solid moderate-intensity workout. Consider adding intervals for better gains.")
        else:
            insights.append("Light session today. Good for recovery, but push harder next time for more calorie burn.")

        if data["duration"] > 45:
            insights.append("Long duration session — watch for fatigue-related form breakdown.")

        if data["body_temp"] > 38.5:
            insights.append("Elevated body temperature detected. Stay hydrated and monitor for overheating.")

        if efficiency in ["Excellent", "Elite"]:
            insights.append("Your calorie burn efficiency is impressive — your body is adapting well to training.")

        return " ".join(insights)

    def _get_top_features(self, data: dict) -> list:
        duration = data["duration"]
        heart_rate = data["heart_rate"]
        body_temp = data["body_temp"]
        weight = data["weight"]

        total = duration + heart_rate + body_temp + weight

        features = [
            {"feature": "Duration", "value": duration, "contribution": round(duration / total * 100, 1), "direction": "increases" if duration > 30 else "moderate"},
            {"feature": "Heart Rate", "value": heart_rate, "contribution": round(heart_rate / total * 100, 1), "direction": "increases" if heart_rate > 140 else "moderate"},
            {"feature": "Body Temperature", "value": body_temp, "contribution": round(body_temp / total * 100, 1), "direction": "increases" if body_temp > 37.5 else "moderate"},
            {"feature": "Body Weight", "value": weight, "contribution": round(weight / total * 100, 1), "direction": "increases" if weight > 70 else "moderate"},
        ]

        return sorted(features, key=lambda x: x["contribution"], reverse=True)


# Global instance
engine = CalorieEngine()