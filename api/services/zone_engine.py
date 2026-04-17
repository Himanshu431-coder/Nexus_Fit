"""
Heart Rate Zone Prediction Engine
Predicts optimal training zone and provides zone-specific recommendations.
"""

import math


def predict_zone(age: int, heart_rate: float, duration: float, weight: float) -> dict:
    """
    Predict heart rate training zone based on user metrics.
    Uses Karvonen formula + individualized thresholds.
    """
    # Max heart rate (Tanaka formula — more accurate than 220-age)
    max_hr = 208 - (0.7 * age)
    
    # Heart rate reserve (using estimated resting HR of 65)
    resting_hr = 65
    hr_reserve = max_hr - resting_hr
    
    # % of HR reserve (Karvonen)
    hr_percent = ((heart_rate - resting_hr) / hr_reserve) * 100 if hr_reserve > 0 else 0
    
    # Raw % of max HR
    hr_max_percent = (heart_rate / max_hr) * 100 if max_hr > 0 else 0
    
    # Zone classification
    if hr_max_percent >= 90:
        zone = 5
        zone_name = "Max Performance"
        zone_color = "#ef4444"
        description = "Maximum effort. Anaerobic. Improves speed and power."
        fat_burn_pct = 10
        carb_burn_pct = 90
    elif hr_max_percent >= 80:
        zone = 4
        zone_name = "Threshold"
        zone_color = "#f59e0b"
        description = "Hard effort. Improves lactate threshold and VO2max."
        fat_burn_pct = 25
        carb_burn_pct = 75
    elif hr_max_percent >= 70:
        zone = 3
        zone_name = "Cardio"
        zone_color = "#22c55e"
        description = "Moderate-high effort. Builds cardiovascular endurance."
        fat_burn_pct = 40
        carb_burn_pct = 60
    elif hr_max_percent >= 60:
        zone = 2
        zone_name = "Fat Burn"
        zone_color = "#22d3ee"
        description = "Moderate effort. Optimal for fat oxidation and endurance base."
        fat_burn_pct = 65
        carb_burn_pct = 35
    else:
        zone = 1
        zone_name = "Recovery"
        zone_color = "#60a5fa"
        description = "Light effort. Promotes recovery and warm-up."
        fat_burn_pct = 80
        carb_burn_pct = 20
    
    # Calories per minute estimate (MET-based)
    met_values = {1: 2.5, 2: 4.5, 3: 6.5, 4: 8.5, 5: 11.0}
    met = met_values.get(zone, 5.0)
    cal_per_min = (met * 3.5 * weight) / 200
    total_est = round(cal_per_min * duration, 1)
    
    # Zone duration recommendations
    zone_durations = {
        1: {"min": 20, "max": 60, "unit": "min", "tip": "Great for warm-up or active recovery days."},
        2: {"min": 30, "max": 90, "unit": "min", "tip": "Ideal for long steady-state cardio sessions."},
        3: {"min": 20, "max": 45, "unit": "min", "tip": "Sweet spot for cardiovascular improvement."},
        4: {"min": 10, "max": 25, "unit": "min", "tip": "High intensity — interval training recommended."},
        5: {"min": 3, "max": 10, "unit": "min", "tip": "Maximum effort — use sparingly in intervals."},
    }
    
    dur_rec = zone_durations.get(zone, zone_durations[3])
    
    # Safety assessment
    safety = "safe"
    safety_note = ""
    if hr_max_percent > 95:
        safety = "danger"
        safety_note = "⚠️ Heart rate dangerously high. Stop immediately and rest."
    elif hr_max_percent > 90:
        safety = "caution"
        safety_note = "⚡ Near maximum. Only sustain for short intervals (30s-2min)."
    elif hr_max_percent < 50:
        safety = "low"
        safety_note = "💡 Heart rate quite low. Consider increasing intensity for training effect."
    else:
        safety_note = f"✅ Heart rate is in a healthy {zone_name.lower()} range."
    
    # Weekly zone distribution recommendation (polarized training)
    weekly_distribution = {
        1: "10%",
        2: "60%",
        3: "15%",
        4: "10%",
        5: "5%",
    }
    
    # Improvement tips
    tips = {
        1: [
            "Use this zone for warm-up before intense sessions.",
            "Great for recovery the day after hard training.",
            "Focus on breathing rhythm and relaxation.",
        ],
        2: [
            "This is your endurance base — spend most time here.",
            "Try 45-60 min sessions for maximum fat adaptation.",
            "Maintain a conversational pace — you should be able to talk.",
        ],
        3: [
            "Perfect for tempo runs and steady-state efforts.",
            "Aim for 20-40 min to build cardiovascular capacity.",
            "Monitor breathing — should be rhythmic but deep.",
        ],
        4: [
            "Use intervals: 3-5 min work, 2-3 min recovery.",
            "Don't exceed 25 min total in this zone per session.",
            "Allow 48 hours recovery between threshold sessions.",
        ],
        5: [
            "Use very short intervals: 15-30 sec all-out.",
            "Rest 2-3 min between intervals.",
            "Maximum 2 sessions per week in this zone.",
            "Ensure adequate warm-up before entering Zone 5.",
        ],
    }
    
    return {
        "zone": zone,
        "zone_name": zone_name,
        "zone_color": zone_color,
        "description": description,
        "max_hr": round(max_hr, 1),
        "hr_max_percent": round(hr_max_percent, 1),
        "hr_reserve_percent": round(hr_percent, 1),
        "fat_burn_pct": fat_burn_pct,
        "carb_burn_pct": carb_burn_pct,
        "estimated_calories": total_est,
        "cal_per_minute": round(cal_per_min, 2),
        "duration_recommendation": dur_rec,
        "safety": safety,
        "safety_note": safety_note,
        "weekly_distribution": weekly_distribution,
        "tips": tips.get(zone, []),
        "model": "nexus-zone-v1.0-karvonen",
    }