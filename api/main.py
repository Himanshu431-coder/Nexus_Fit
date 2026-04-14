from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from v1 import calories, health, insights, coach

app = FastAPI(
    title="NEXUS FIT — AI Fitness Intelligence API",
    description="Production-grade ML API for calorie prediction, uncertainty quantification, and fitness insights.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(calories.router, prefix="/api/v1", tags=["Calories"])
app.include_router(insights.router, prefix="/api/v1", tags=["Insights"])
app.include_router(coach.router, prefix="/api/v1", tags=["Coach"])


@app.get("/")
def root():
    return {
        "app": "NEXUS FIT API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
    }