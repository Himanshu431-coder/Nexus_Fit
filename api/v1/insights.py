from fastapi import APIRouter
import json
from pathlib import Path

router = APIRouter()

MODEL_DIR = Path(__file__).parent.parent.parent / "ml" / "models"


@router.get("/drift-report")
def get_drift_report():
    try:
        with open(MODEL_DIR / "nexus_drift_report.json", "r") as f:
            report = json.load(f)
        return report
    except FileNotFoundError:
        return {"error": "Drift report not found."}


@router.get("/model-comparison")
def get_model_comparison():
    try:
        import pandas as pd
        df = pd.read_csv(MODEL_DIR / "nexus_model_comparison.csv")
        return df.to_dict(orient="records")
    except FileNotFoundError:
        return {"error": "Model comparison not found."}


@router.get("/metadata")
def get_metadata():
    try:
        with open(MODEL_DIR / "nexus_model_metadata.json", "r") as f:
            metadata = json.load(f)
        return metadata
    except FileNotFoundError:
        return {"error": "Metadata not found."}