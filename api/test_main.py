"""
NEXUS FIT API Test Suite — 20 Tests
Tests all endpoints, models, and engines.
"""

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


# ============================================================
# HEALTH ENDPOINT TESTS (3 tests)
# ============================================================

def test_health_returns_200():
    """Test health endpoint returns 200 status."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200


def test_health_returns_status_healthy():
    """Test health endpoint returns status healthy."""
    response = client.get("/api/v1/health")
    data = response.json()
    assert data["status"] == "healthy"


def test_health_has_version():
    """Test health endpoint includes version."""
    response = client.get("/api/v1/health")
    data = response.json()
    assert "version" in data


# ============================================================
# CALORIE PREDICTION TESTS (6 tests)
# ============================================================

def test_predict_returns_200():
    """Test calorie prediction returns 200 for valid input."""
    response = client.post("/api/v1/predict", json={
        "gender": "male", "age": 25, "height": 175.0,
        "weight": 75.0, "duration": 30.0,
        "heart_rate": 150.0, "body_temp": 37.5,
    })
    assert response.status_code == 200


def test_predict_has_calories_burned():
    """Test prediction includes calories_burned."""
    response = client.post("/api/v1/predict", json={
        "gender": "male", "age": 25, "height": 175.0,
        "weight": 75.0, "duration": 30.0,
        "heart_rate": 150.0, "body_temp": 37.5,
    })
    data = response.json()
    assert "prediction" in data
    assert "calories_burned" in data["prediction"]
    assert data["prediction"]["calories_burned"] > 0


def test_predict_has_confidence_interval():
    """Test prediction includes confidence interval."""
    response = client.post("/api/v1/predict", json={
        "gender": "female", "age": 30, "height": 165.0,
        "weight": 60.0, "duration": 45.0,
        "heart_rate": 140.0, "body_temp": 37.8,
    })
    data = response.json()
    assert data["prediction"]["lower_bound"] > 0
    assert data["prediction"]["upper_bound"] > data["prediction"]["lower_bound"]
    assert 0 < data["prediction"]["confidence_level"] <= 1


def test_predict_has_shap_features():
    """Test prediction includes SHAP feature contributions."""
    response = client.post("/api/v1/predict", json={
        "gender": "male", "age": 25, "height": 175.0,
        "weight": 75.0, "duration": 30.0,
        "heart_rate": 150.0, "body_temp": 37.5,
    })
    data = response.json()
    assert "shap_top_features" in data
    assert len(data["shap_top_features"]) > 0


def test_predict_has_insight():
    """Test prediction includes AI insight."""
    response = client.post("/api/v1/predict", json={
        "gender": "male", "age": 25, "height": 175.0,
        "weight": 75.0, "duration": 30.0,
        "heart_rate": 150.0, "body_temp": 37.5,
    })
    data = response.json()
    assert "insight" in data
    assert len(data["insight"]) > 0


def test_predict_rejects_invalid_age():
    """Test prediction rejects age outside valid range."""
    response = client.post("/api/v1/predict", json={
        "gender": "male", "age": -5, "height": 175.0,
        "weight": 75.0, "duration": 30.0,
        "heart_rate": 150.0, "body_temp": 37.5,
    })
    assert response.status_code == 422


# ============================================================
# ZONE PREDICTION TESTS (5 tests)
# ============================================================

def test_zone_returns_200():
    """Test zone prediction returns 200 for valid input."""
    response = client.post("/api/v1/predict-zone", json={
        "age": 25, "heart_rate": 155.0, "duration": 30.0, "weight": 75.0,
    })
    assert response.status_code == 200


def test_zone_has_valid_zone_number():
    """Test zone prediction returns zone 1-5."""
    response = client.post("/api/v1/predict-zone", json={
        "age": 25, "heart_rate": 155.0, "duration": 30.0, "weight": 75.0,
    })
    data = response.json()
    assert 1 <= data["zone"] <= 5


def test_zone_has_zone_name():
    """Test zone prediction includes zone name."""
    response = client.post("/api/v1/predict-zone", json={
        "age": 25, "heart_rate": 155.0, "duration": 30.0, "weight": 75.0,
    })
    data = response.json()
    assert "zone_name" in data
    assert data["zone_name"] in ["Recovery", "Fat Burn", "Cardio", "Threshold", "Max Performance"]


def test_zone_has_fat_carb_split():
    """Test zone prediction includes fat/carb burn percentages."""
    response = client.post("/api/v1/predict-zone", json={
        "age": 25, "heart_rate": 155.0, "duration": 30.0, "weight": 75.0,
    })
    data = response.json()
    assert data["fat_burn_pct"] + data["carb_burn_pct"] == 100


def test_zone_rejects_invalid_heart_rate():
    """Test zone prediction rejects invalid heart rate."""
    response = client.post("/api/v1/predict-zone", json={
        "age": 25, "heart_rate": 300.0, "duration": 30.0, "weight": 75.0,
    })
    assert response.status_code == 422


# ============================================================
# COACH ENDPOINT TESTS (4 tests)
# ============================================================

def test_coach_returns_200():
    """Test coach chat returns 200 for valid message."""
    response = client.post("/api/v1/coach/chat", json={
        "message": "Tell me about HIIT"
    })
    assert response.status_code == 200


def test_coach_returns_response():
    """Test coach chat returns a response."""
    response = client.post("/api/v1/coach/chat", json={
        "message": "What is HIIT?"
    })
    data = response.json()
    assert "response" in data
    assert len(data["response"]) > 0


def test_coach_returns_sources():
    """Test coach chat returns source documents."""
    response = client.post("/api/v1/coach/chat", json={
        "message": "How to recover after running?"
    })
    data = response.json()
    assert "sources" in data
    assert isinstance(data["sources"], list)


def test_coach_handles_empty_message():
    """Test coach chat handles empty message."""
    response = client.post("/api/v1/coach/chat", json={
        "message": ""
    })
    # Should still return a response (not crash)
    assert response.status_code == 200


# ============================================================
# INSIGHTS ENDPOINT TESTS (2 tests)
# ============================================================

def test_insights_model_info_returns_200():
    """Test metadata endpoint returns 200."""
    response = client.get("/api/v1/metadata")
    assert response.status_code == 200


def test_insights_drift_returns_200():
    """Test drift-report endpoint returns 200."""
    response = client.get("/api/v1/drift-report")
    assert response.status_code == 200