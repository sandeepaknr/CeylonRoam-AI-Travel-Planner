# 🌴 CeylonRoam: AI-Based Personalized Smart Travel Planner

CeylonRoam is a cutting-edge, AI-driven travel planning platform designed specifically for Sri Lanka. It leverages Machine Learning and Generative AI to provide personalized itineraries, destination recognition, and real-time travel assistance.

## 🚀 Technology Stack

### 🌐 Frontend (Client-Side)
- **React.js (v19)**: Core UI framework.
- **Leaflet & React-Leaflet**: Interactive maps and route visualization.
- **AOS (Animate On Scroll)**: Modern UI micro-animations.
- **React-Hot-Toast**: Premium global notifications.
- **html2canvas & jsPDF**: Exporting itineraries as PDF documents.
- **React-Markdown**: Formatting AI-generated content.

### ⚙️ Backend (Server-Side)
- **Node.js & Express.js**: Primary API gateway for auth, bookings, and data.
- **Python (Flask)**: Microservice for AI models and itinerary logic.
- **JSON Web Tokens (JWT)**: Secure user authentication.
- **Bcrypt.js**: Password security.
- **Multer**: Image upload handling.

### 🧠 Artificial Intelligence & Machine Learning
- **OpenAI CLIP**: Fine-tuned model for identifying 55+ Sri Lankan landmarks from photos.
- **PyTorch**: Deep learning framework for vision tasks.
- **Google Gemini (2.5/2.0 Flash)**: Large Language Model for the "Roamy" chatbot and narrative generation.
- **Pandas**: High-speed data processing for travel algorithms.

### 🗄️ Database & Storage
- **MongoDB Atlas**: Primary database for users and logs.
- **Mongoose**: MongoDB ODM.
- **CSV Datasets**: Local knowledge base for Sri Lankan places, hotels, and holidays.

### 🔌 Integrated APIs
- **Google Generative AI SDK**: LLM connectivity.
- **Open-Meteo API**: Real-time weather forecasting.
- **PayPal REST SDK**: Secure payment gateway.
- **Google Maps API**: Dynamic routing and navigation.

---

## ✨ Key Features

- **AI Destination Recognition**: Upload a photo of a landmark, and the system identifies it using the CLIP model with a 75% confidence threshold.
- **Smart Itinerary Engine**: Calculates routes using the **Haversine Distance Algorithm**, factoring in transport mode (Tuk-Tuk, Car, etc.) and budget.
- **Weather-Aware Planning**: Automatically prioritizes indoor activities if rain is forecast for your travel dates.
- **"Roamy" AI Chatbot**: A specialized Sri Lankan travel expert that provides advice on culture, food, and logistics.
- **Accessibility Checks**: Warns users about difficult terrain (e.g., hiking) if they have vulnerable group members (kids/seniors).
- **Offline PDF Exports**: Save your full trip plan as a professional PDF for use without data.

---

## 🛠️ System Architecture

The project uses a **Decoupled Microservices Architecture**:
1. **Frontend (React)** communicates with both Node.js and Python servers.
2. **Node.js (Port 5000)** handles user data and business logic.
3. **Python Flask (Port 5001)** handles AI inference and the itinerary generation algorithm.

---

## 📝 Setup & Installation

### Backend (Node.js)
1. `cd backend`
2. `npm install`
3. `node server.js`

### AI Server (Python)
1. `cd backend`
2. `pip install -r requirements.txt` (Ensure `torch`, `flask`, `pandas`, `google-genai` are installed)
3. `python server.py`

### Frontend
1. `cd frontend_user`
2. `npm install`
3. `npm start`
