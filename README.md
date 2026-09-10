# 🛡️ ClaimShield Enterprise

> **Multimodal AI Fraud Detection & Automated Claims Orchestration Platform**

ClaimShield Enterprise is a B2B insurance claims processing application powered by PyTorch, Ultralytics YOLOv8, OpenCV, Hugging Face Transformers, spaCy, LangChain / LlamaIndex, and FastAPI.

---

## 🛠️ Required Tech Stack Integration

### 👁️ Computer Vision Pipeline
- **PyTorch**: Deep learning tensor processing.
- **Ultralytics YOLOv8**: Damage localization, bounding box detection, and structural component segmentation.
- **OpenCV (`cv2`)**: Image preprocessing (decoding, color space normalization, CLAHE contrast enhancement for dents & scratches).

### 💬 NLP & LLMs Pipeline
- **Hugging Face Transformers**: Transformer-based Named Entity Recognition (NER) inference.
- **spaCy (`en_core_web_sm`)**: Named Entity Recognition (NER) and token extraction for damaged component descriptors.
- **LangChain / LlamaIndex**: Dense vector similarity search for policy document Retrieval-Augmented Generation (RAG).

### ⚡ Backend API Framework
- **FastAPI / Uvicorn**: High-performance asynchronous REST API backend (`backend/main.py`) exposing ML model inference endpoints (`/api/analyze-claim`).

---

## 🚀 Directory Structure

```
my-new-app/
├── backend/
│   ├── main.py                  # FastAPI Application Entrypoint
│   ├── requirements.txt         # PyTorch, YOLOv8, OpenCV, Transformers, spaCy, LangChain, FastAPI
│   └── models/
│       ├── cv_model.py          # PyTorch + Ultralytics YOLOv8 + OpenCV Image Preprocessing
│       ├── nlp_model.py         # Hugging Face Transformers + spaCy NER Parser
│       ├── rag_engine.py        # LangChain / LlamaIndex Policy Document RAG Matcher
│       └── fusion_model.py      # Multimodal Contradiction & Fraud Risk Engine
├── src/
│   ├── css/
│   │   └── styles.css           # Modern corporate cream-white B2B design system
│   └── js/
│       └── app.js               # Frontend fetch API integration with FastAPI backend
└── index.html                   # ClaimShield Portal UI
```

---

## 🏁 Running the Platform

1. **Start the FastAPI Backend Server**:
   ```bash
   ./venv/bin/python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Start the Frontend HTTP Web Server**:
   ```bash
   python3 -m http.server 8080
   ```

3. **Access Application**:
   Open `http://localhost:8080` in your web browser.
