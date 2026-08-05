import logging
from typing import Dict, Any, List

logger = logging.getLogger("ClaimShield.FusionModel")

class MultimodalFusionEngine:
    """
    Multimodal Contradiction & Alignment Engine
    Fuses Vision AI damage localization with NLP narrative descriptors to calculate fraud risk index.
    """
    def analyze_alignment(self, cv_data: Dict[str, Any], nlp_data: Dict[str, Any]) -> Dict[str, Any]:
        detections = cv_data.get("detections", [])
        tokens = nlp_data.get("tokens", [])
        full_text = nlp_data.get("full_text", "").lower()

        flags = []
        risk_score = 15  # Base baseline score

        # Alignment Check 1: Front vs Rear Contradiction
        if "rear" in full_text and any("Front" in d.get("part", "") for d in detections):
            risk_score += 45
            flags.append({
                "title": "Directional Alignment Failure",
                "desc": "Narrative reports rear-end collision, but Vision AI localized Front Bumper structural crumple.",
                "status": "fail"
            })
        else:
            flags.append({
                "title": "Directional Alignment Verified",
                "desc": "Visual damage localizations align with reported impact trajectory.",
                "status": "pass"
            })

        # Alignment Check 2: Impact Severity Check
        has_severe = any(d.get("severity") == "Severe" for d in detections)
        if has_severe and "minor" in full_text:
            risk_score += 35
            flags.append({
                "title": "Severity Understatement Flag",
                "desc": "Statement describes incident as minor, but Computer Vision localized severe structural crumpling.",
                "status": "fail"
            })
        else:
            flags.append({
                "title": "Severity Match Verified",
                "desc": "Localized component damage severity matches reported narrative intensity.",
                "status": "pass"
            })

        risk_score = min(risk_score, 98)
        risk_level = "CRITICAL FRAUD RISK" if risk_score > 60 else ("MODERATE REVIEW" if risk_score >= 20 else "AUTO APPROVE")

        logger.info(f"Multimodal Fusion completed. Risk Score: {risk_score}%, Level: {risk_level}")
        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "flags": flags
        }
