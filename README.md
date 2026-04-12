🌱 EcoEvent — Smart Event Waste Management Platform

🚀 A data-driven platform to predict, track, and optimize waste generation during events, connecting event organizers with municipal authorities (BMC) for smarter urban waste management.

🧠 Problem Statement

Large-scale events like weddings, college fests, and corporate gatherings generate significant amounts of unmanaged waste.

No prior waste estimation
Poor segregation practices
No coordination with municipal authorities
Leads to overflow, complaints, and environmental damage
💡 Solution

EcoEvent solves this by creating a shared data platform between:

Event Organizers
Vendors (Caterers, Decorators)
Municipal Authorities (BMC)

It enables:

📊 Pre-event waste prediction
♻️ Real-time waste tracking
🚛 Advance pickup planning for BMC
📈 Post-event sustainability reporting
⚙️ Core Features
🔹 1. Pre-Event Waste Prediction
Uses inputs like:
Guest count
Catering type
Event details
Predicts:
Wet waste
Dry waste
Recyclable waste
Calculates required number of bins
🔹 2. Real-Time Waste Estimation (No Sensors Required)
Staff logs:
Number of bins used
Average fill level (25%, 50%, 75%, 100%)
Converts volume → weight using density-based model
Waste (kg) = Bins × Fill Level × Bin Volume × Density
🔹 3. Sustainability Score

Evaluates event performance based on:

Segregation efficiency
Use of reusable materials
Waste reduction practices
Prediction accuracy
🔹 4. BMC Dashboard
Ward-level waste insights
Event-based waste forecasting
Pickup scheduling assistance
Data for municipal planning
🏗️ System Architecture
Frontend (React)
        ↓
Backend API (Node.js + Express)
        ↓
Database (MongoDB)
        ↓
Analytics Engine (Waste Prediction + Scoring)
🧮 Methodology
Stage 1 — Prediction (Before Event)
Food Waste = Guests × Waste per guest
Catering Type	Waste per Guest
Buffet	0.5 kg
Plated	0.3 kg
Snacks	0.15 kg

Additional factors:

Plates, bottles, décor, packaging
Stage 2 — Event Day Estimation
Actual Waste = Bins × Fill × Volume × Density
Waste Type	Density
Wet	0.35 kg/L
Dry	0.17 kg/L
Recyclable	0.12 kg/L
Stage 3 — Evaluation
Accuracy = 1 - |Predicted - Actual| / Predicted

Generates final sustainability score and report.

🛠️ Tech Stack
Frontend
React.js
Bootstrap / Tailwind
Backend
Node.js
Express.js
Database
MongoDB
Tools
REST APIs
JWT Authentication
Chart.js (Analytics)
🏆 Achievement
🥇 Winner — Hack-AI-Thon 4.0 (VESIT, 2026)
Built and presented EcoEvent as a real-world solution for event waste management in a 24-hour AI hackathon.
🌍 SDG Alignment
SDG 12 — Responsible Consumption & Production
SDG 11 — Sustainable Cities & Communities
SDG 13 — Climate Action
🚀 Future Improvements
IoT-based smart bin integration
AI-based waste prediction models
Real-time BMC truck tracking
Vendor compliance scoring
📌 Key Insight

"Waste cannot be measured before an event — it must be predicted.
EcoEvent bridges this gap by combining prediction + real-time estimation."

👨‍💻 Author
Sumit Pathak  
📍 Mumbai, India  
🔗 [LinkedIn](https://www.linkedin.com/in/sumit-pathak-a57893375/)  
🔗 [GitHub](https://github.com/SumitBuilds)
