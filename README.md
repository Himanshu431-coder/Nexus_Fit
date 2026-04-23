<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-green?logo=fastapi" />
  <img src="https://img.shields.io/badge/XGBoost-Optimized-orange?logo=xgboost" />
  <img src="https://img.shields.io/badge/RAG-TF--IDF-purple" />
  <img src="https://img.shields.io/badge/MediaPipe-Pose-red" />
  <img src="https://img.shields.io/badge/R²-0.9997-brightgreen" />
  <img src="https://img.shields.io/badge/Tests-20%2F20-brightgreen" />
  <img src="https://img.shields.io/badge/Zone-Karvonen-blue" />
  <img src="https://img.shields.io/badge/Auth-JWT%20%2B%20RLS-green" />
  <img src="https://img.shields.io/badge/DB-PostgreSQL-blue?logo=postgresql" />
  <img src="https://img.shields.io/badge/License-All%20Rights%20Reserved-red" />
</p>

<h1 align="center">⚡ NEXUS FIT — AI Fitness Intelligence Platform</h1>

<p align="center">
  <strong>Production-grade ML-powered fitness analytics with uncertainty quantification,</strong><br>
  <strong>RAG-based AI coaching, heart rate zone prediction, and real-time pose estimation.</strong>
</p>

<p align="center">
  <a href="https://nexus-fit.pages.dev"><strong>🌐 Live Demo</strong></a> •
  <a href="https://himanshuml24-nexus-fit-api.hf.space/docs"><strong>📖 API Docs</strong></a>
</p>

---

## 🎯 What It Does

| Feature | Description |
|---------|-------------|
| **ML Calorie Prediction** | XGBoost model (R² = 0.9997) with conformal prediction intervals |
| **Heart Rate Zones** | Karvonen + Tanaka clinical formulas — Zone 1-5 classification |
| **AI Coach (RAG)** | TF-IDF retrieval from 25 fitness knowledge documents |
| **SHAP Explainability** | Feature contribution breakdown for every prediction |
| **Pose Estimation** | MediaPipe real-time body tracking + angle analysis |
| **Auth + Security** | Supabase JWT authentication + Row Level Security |

---

## 🏗️ Architecture

┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ React + TS │────▶│ FastAPI API │────▶│ XGBoost ML │
│ TailwindCSS │ │ Python 3.11 │ │ SHAP + CP │
│ Cloudflare │ │ HuggingFace │ │ R² = 0.9997 │
└──────────────────┘ └──────────────────┘ └──────────────────┘
│ │
▼ ▼
┌──────────────────┐ ┌──────────────────┐
│ Supabase │ │ RAG Engine │
│ PostgreSQL │ │ TF-IDF + 25 │
│ Auth + RLS │ │ Knowledge Docs │
└──────────────────┘ └──────────────────┘


---

## 🧪 ML Pipeline

Raw Data (20K+ samples)
│
▼
Feature Engineering (7 features)
│
▼
XGBoost + LightGBM + CatBoost (ensemble)
│
▼
Ridge Meta-Learner (stacking)
│
▼
Conformal Prediction → 94% confidence intervals
│
▼
SHAP → Feature importance per prediction
│
▼
Optuna → Bayesian hyperparameter optimization
│
▼
MLflow → Experiment tracking


**Result:** R² = 0.9997 | MAE = 1.2 kcal | 94% prediction coverage

---

## 💻 Tech Stack

**Frontend:**
- React 18 + TypeScript + Vite
- TailwindCSS + Custom Design System
- Recharts (data visualization)
- Framer Motion (animations)
- MediaPipe Pose (body tracking)

**Backend:**
- FastAPI (Python 3.11)
- XGBoost + LightGBM + CatBoost (ensemble)
- Ridge meta-learner (stacking)
- Conformal Prediction (uncertainty quantification)
- SHAP (explainability)
- Optuna (Bayesian optimization)
- MLflow (experiment tracking)
- TF-IDF + Cosine Similarity (RAG)

**Database & Auth:**
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- JWT Authentication

**Testing & DevOps:**
- pytest (20 tests, 100% passing)
- GitHub Actions CI/CD
- Cloudflare Pages (frontend)
- HuggingFace Spaces (backend)

---

## 🚀 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [nexus-fit.pages.dev](https://nexus-fit.pages.dev) |
| **API Docs** | [himanshuml24-nexus-fit-api.hf.space/docs](https://himanshuml24-nexus-fit-api.hf.space/docs) |
| **API Health** | [himanshuml24-nexus-fit-api.hf.space/api/v1/health](https://himanshuml24-nexus-fit-api.hf.space/api/v1/health) |

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/predict` | ML calorie prediction with SHAP + confidence intervals |
| `POST` | `/api/v1/predict-zone` | Heart rate zone classification (Karvonen) |
| `POST` | `/api/v1/coach/chat` | RAG-powered AI fitness coach |
| `GET` | `/api/v1/health` | API health check |
| `GET` | `/api/v1/metadata` | Model metadata |
| `GET` | `/api/v1/drift-report` | Data drift analysis |
| `GET` | `/api/v1/model-comparison` | Model comparison metrics |

---

## 📁 Project Structure

Nexus_Fit/
├── api/ # FastAPI Backend
│ ├── main.py # App entry point
│ ├── v1/ # API routes
│ │ ├── calories.py # Calorie prediction endpoint
│ │ ├── zone.py # Heart rate zone endpoint
│ │ ├── coach.py # RAG AI coach endpoint
│ │ ├── health.py # Health check endpoint
│ │ └── insights.py # Model insights endpoints
│ ├── services/ # Business logic
│ │ ├── prediction_engine.py # XGBoost + SHAP + CP
│ │ ├── zone_engine.py # Karvonen zone predictor
│ │ └── rag_engine.py # RAG retrieval engine
│ ├── Dockerfile # Container config
│ ├── requirements.txt # Python dependencies
│ └── test_main.py # 20 pytest tests
│
├── ml/ # ML Pipeline
│ ├── models/ # Trained models + artifacts
│ └── notebooks/ # Training notebooks
│
├── src/ # React Frontend
│ ├── pages/ # App pages
│ │ ├── Dashboard.tsx # Real-time analytics
│ │ ├── Workouts.tsx # ML prediction UI
│ │ ├── Coach.tsx # AI chat interface
│ │ ├── BodyScan.tsx # Pose estimation
│ │ ├── Settings.tsx # User settings
│ │ └── Auth.tsx # Login/Signup
│ ├── components/ # Reusable UI components
│ ├── lib/ # Supabase + utilities
│ └── index.css # TailwindCSS + theme
│
├── .github/workflows/ci.yml # GitHub Actions CI/CD
├── package.json # Node dependencies
├── vite.config.ts # Vite configuration
└── README.md # This file


---

## 🧪 Testing

```bash
cd api
pip install -r requirements.txt
pip install pytest httpx
python -m pytest test_main.py -v

Result: 20/20 tests passing ✅

test_health_returns_200              PASSED
test_health_returns_status_healthy   PASSED
test_health_has_version              PASSED
test_predict_returns_200             PASSED
test_predict_has_calories_burned     PASSED
test_predict_has_confidence_interval PASSED
test_predict_has_shap_features       PASSED
test_predict_has_insight             PASSED
test_predict_rejects_invalid_age     PASSED
test_zone_returns_200                PASSED
test_zone_has_valid_zone_number      PASSED
test_zone_has_zone_name              PASSED
test_zone_has_fat_carb_split         PASSED
test_zone_rejects_invalid_heart_rate PASSED
test_coach_returns_200               PASSED
test_coach_returns_response          PASSED
test_coach_returns_sources           PASSED
test_coach_handles_empty_message     PASSED
test_insights_model_info_returns_200 PASSED
test_insights_drift_returns_200      PASSED

🏃 Run Locally
Prerequisites
Python 3.11+
Node.js 18+

Backend
cd api
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

Frontend
npm install
npm run dev

Open http://localhost:8080

👤 Author
Himanshu

<p align="left"> <a href="https://github.com/Himanshu431-coder"><img src="https://img.shields.io/badge/GitHub-Himanshu431--coder-black?logo=github" /></a> <a href="https://huggingface.co/HimanshuML24"><img src="https://img.shields.io/badge/HuggingFace-HimanshuML24-yellow?logo=huggingface" /></a> </p>


📜 License
All Rights Reserved. This project is for portfolio demonstration purposes.
