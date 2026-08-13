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

<!-- doc update 0 -->
<!-- doc update 1 -->
<!-- doc update 2 -->
<!-- doc update 3 -->
<!-- doc update 4 -->
<!-- doc update 5 -->
<!-- doc update 6 -->
<!-- doc update 7 -->
<!-- doc update 8 -->
<!-- doc update 9 -->
<!-- doc update 10 -->
<!-- doc update 11 -->
<!-- doc update 12 -->
<!-- doc update 13 -->
<!-- doc update 14 -->
<!-- doc update 15 -->
<!-- doc update 16 -->
<!-- doc update 17 -->
<!-- doc update 18 -->
<!-- doc update 19 -->
<!-- doc update 20 -->
<!-- doc update 21 -->
<!-- doc update 22 -->
<!-- doc update 23 -->
<!-- doc update 24 -->
<!-- doc update 25 -->
<!-- doc update 26 -->
<!-- doc update 27 -->
<!-- doc update 28 -->
<!-- doc update 29 -->
<!-- doc update 0 -->
<!-- doc update 1 -->
<!-- doc update 2 -->
<!-- doc update 3 -->
<!-- doc update 4 -->
<!-- doc update 5 -->
<!-- doc update 6 -->
<!-- doc update 7 -->
<!-- doc update 8 -->
<!-- doc update 9 -->
<!-- doc update 10 -->
<!-- doc update 11 -->
<!-- doc update 12 -->
<!-- doc update 13 -->
<!-- doc update 14 -->
<!-- doc update 15 -->
<!-- doc update 16 -->
<!-- doc update 17 -->
<!-- doc update 18 -->
<!-- doc update 19 -->
<!-- doc update 20 -->
<!-- doc update 21 -->
<!-- doc update 22 -->
<!-- doc update 23 -->
<!-- doc update 24 -->
<!-- doc update 25 -->
<!-- doc update 26 -->
<!-- doc update 27 -->
<!-- doc update 28 -->
<!-- doc update 29 -->
<!-- doc update 0 -->
<!-- doc update 1 -->
<!-- doc update 2 -->
<!-- doc update 3 -->
<!-- doc update 4 -->
<!-- doc update 5 -->
<!-- doc update 6 -->
<!-- doc update 7 -->
<!-- doc update 8 -->
<!-- doc update 9 -->
<!-- doc update 10 -->
<!-- doc update 11 -->
<!-- doc update 12 -->
<!-- doc update 13 -->
<!-- doc update 14 -->
<!-- doc update 15 -->
<!-- doc update 16 -->
<!-- doc update 17 -->
<!-- doc update 18 -->
<!-- doc update 19 -->
<!-- doc update 20 -->
<!-- doc update 21 -->
<!-- doc update 22 -->
<!-- doc update 23 -->
<!-- doc update 24 -->
<!-- doc update 25 -->
<!-- doc update 26 -->
<!-- doc update 27 -->
<!-- doc update 28 -->
<!-- doc update 29 -->
<!-- doc update 0 -->
<!-- doc update 1 -->
<!-- doc update 2 -->
<!-- doc update 3 -->
<!-- doc update 4 -->
<!-- doc update 5 -->