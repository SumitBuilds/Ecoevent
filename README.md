# 🌱 EcoEvent — Smart Event Waste Management Platform

A data-driven platform that predicts, tracks, and optimizes waste generation during events — connecting event organizers with BMC for smarter, cleaner cities.

---

## 🧠 Problem

Large-scale events like weddings, college fests, and corporate gatherings generate huge amounts of unmanaged waste.

- No prior waste estimation  
- Poor segregation practices  
- No coordination with municipal authorities (BMC)  
- Leads to overflow, complaints, and environmental damage  

---

## 💡 Solution

EcoEvent provides a shared platform connecting:

Event Organizers • Vendors (Caterers, Decorators) • Municipal Authorities (BMC)

It enables smarter planning and real-time waste tracking for efficient waste management.

---

## 🔥 Features

---

✅ Pre-event waste prediction  
✅ Real-time waste tracking (no sensors required)  
✅ Smart pickup planning for BMC  
✅ Post-event sustainability reporting  
✅ Sustainability scoring system  

---

## ⚙️ How It Works

---

### 1. Pre-Event Waste Prediction

- Uses inputs like guest count, catering type, and event details  
- Predicts:
  - Wet waste  
  - Dry waste  
  - Recyclable waste  
- Suggests number of bins required  

---

### 2. Real-Time Waste Tracking

- Staff logs:
  - Number of bins  
  - Fill levels (25%, 50%, 75%, 100%)  

- Converts volume → weight using:
Waste (kg) = Bins × Fill Level × Bin Volume × Density


---

### 3. Sustainability Score

Evaluates event performance based on:

- Segregation efficiency  
- Use of reusable vs disposable items  
- Non-recyclable material usage  
- Prediction accuracy  

---

## 🧪 Methodology

---

### Stage 1 — Prediction (Before Event)

- Uses research-backed estimates:
  - Buffet → ~0.5 kg per guest  
  - Plated → ~0.3 kg per guest  
  - Snacks → ~0.15 kg per guest  

- Converts waste into bins using standard capacities  

---

### Stage 2 — Validation (During Event)

- Uses observable signals:
  - Bin fill levels  
  - Item counts (bottles, plates)  
  - Segregation quality  

- Converts fill level → kg using density-based estimation  

---

## 🛠️ Tech Stack

---

Frontend: React.js / Next.js • Tailwind CSS  
Backend: Node.js • Express.js  
Database: MongoDB  
APIs: REST APIs  
Deployment: Vercel / Render  

---

## 🚀 Future Scope

---

- AI-based waste prediction using historical data  
- Image-based waste detection  
- IoT smart bin integration  
- Live BMC pickup tracking  

---

## 👨‍💻 Author

Sumit Pathak  
📍 Mumbai, India  

🔗 LinkedIn: https://www.linkedin.com/in/sumit-pathak-a57893375/  
🔗 GitHub: https://github.com/SumitBuilds  
