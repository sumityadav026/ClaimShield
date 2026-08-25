import os
import sys
import logging
from typing import Optional, List

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from models.cv_model import DamageLocalizationYOLO
from models.nlp_model import ClaimNLPParser
from models.rag_engine import PolicyRAGMatcher
from models.fusion_model import MultimodalFusionEngine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ClaimShield.API")

app = FastAPI(
    title="ClaimShield Enterprise AI Backend API",
    description="Multimodal Insurance AI Fraud Detection Platform powered by PyTorch, YOLOv8, OpenCV, Hugging Face Transformers, spaCy, LangChain, and FastAPI.",
    version="2.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI Tech Stack Engines
cv_engine = DamageLocalizationYOLO()
nlp_engine = ClaimNLPParser()
rag_engine = PolicyRAGMatcher()
fusion_engine = MultimodalFusionEngine()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "ClaimShield Enterprise AI Platform",
        "tech_stack": {
            "computer_vision": "PyTorch + Ultralytics YOLOv8 + OpenCV",
            "nlp_llms": "Hugging Face Transformers + spaCy NER + LangChain / LlamaIndex RAG",
            "backend_framework": "FastAPI + Uvicorn"
        }
    }

class ClaimAnalysisRequest(BaseModel):
    narrative: str
    company_code: str
    policy_no: str
    claimant_name: str

@app.post("/api/analyze-claim")
async def analyze_claim(
    narrative: str = Form(...),
    company_code: str = Form(...),
    policy_no: str = Form(...),
    claimant_name: str = Form(...),
    photo: Optional[UploadFile] = File(None)
):
    """
    Multimodal Pipeline Endpoint:
    1. OpenCV + PyTorch YOLOv8 damage localization
    2. Hugging Face + spaCy NER narrative extraction
    3. LangChain RAG policy matcher
    4. Multimodal Fusion Contradiction Scoring
    """
    logger.info(f"Processing claim for company_code={company_code}, policy={policy_no}")
    
    # 1. Computer Vision Damage Segmentation
    image_bytes = b""
    if photo:
        image_bytes = await photo.read()
    else:
        # Default placeholder image bytes if no photo attached
        sample_path = os.path.join(os.path.dirname(__file__), "../assets/car_front_damage.jpg")
        if os.path.exists(sample_path):
            with open(sample_path, "rb") as f:
                image_bytes = f.read()

    cv_results = cv_engine.detect_damage(image_bytes) if image_bytes else {"detections": []}

    # 2. NLP & Transformers Narrative Parsing
    nlp_results = nlp_engine.parse_narrative(narrative)

    # 3. Multimodal Fusion Contradiction Analysis
    fusion_results = fusion_engine.analyze_alignment(cv_results, nlp_results)

    # 4. LangChain / LlamaIndex Vector Policy Retrieval
    rag_results = rag_engine.query_policy(narrative, fusion_results["risk_score"])

    return {
        "status": "success",
        "claimant": claimant_name,
        "policy_no": policy_no,
        "company_code": company_code.upper(),
        "computer_vision": cv_results,
        "nlp_analysis": nlp_results,
        "fusion_analysis": fusion_results,
        "rag_policy_match": rag_results
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
