🌱 EcoEvent — Smart Event Waste Management Platform
A data-driven platform that predicts, tracks, and optimizes waste generation during events — connecting event organizers with BMC for smarter, cleaner cities.

🧠 Problem
Large-scale events like weddings, college fests, and corporate gatherings generate huge amounts of unmanaged waste.

No prior waste estimation
Poor segregation practices
No coordination with municipal authorities (BMC)
Leads to overflow, complaints, and environmental damage
💡 Solution
EcoEvent provides a shared platform connecting:

Event Organizers
Vendors (Caterers, Decorators)
Municipal Authorities (BMC)
It enables:

Pre-event waste prediction
Real-time waste tracking
Smart pickup planning
Post-event sustainability reporting
🔥 Features
📊 Pre-Event Waste Prediction
Uses guest count, catering type, and event details
Predicts:
Wet waste
Dry waste
Recyclable waste
Suggests number of bins required
♻️ Real-Time Waste Tracking (No Sensors)
Staff logs:

Number of bins
Fill levels (25%, 50%, 75%, 100%)
Converts volume → weight using:

🔥 Features
📊 Pre-Event Waste Prediction
Uses guest count, catering type, and event details
Predicts:
Wet waste
Dry waste
Recyclable waste
Suggests number of bins required
♻️ Real-Time Waste Tracking (No Sensors)
Staff logs:

Number of bins
Fill levels (25%, 50%, 75%, 100%)
Converts volume → weight using:Waste (kg) = Bins × Fill Level × Bin Volume × Density

📈 Sustainability Score
Evaluates:

Segregation efficiency
Use of reusable vs disposable items
Non-recyclable material usage
Prediction accuracy
🧪 Methodology
Stage 1 — Pre-Event Prediction
Uses research-backed multipliers:

Buffet: ~0.5 kg per guest
Plated: ~0.3 kg per guest
Snacks: ~0.15 kg per guest
Converts waste into bins using:

Wet bin (120L ≈ 40–45 kg)
Dry bin (120L ≈ 20–22 kg)
Recyclable bin (60L ≈ 12–15 kg)
Stage 2 — Event-Day Confirmation
No weighing machines required

Uses observable signals:

Bin fill levels
Item counts (bottles, plates)
Segregation quality
Converts fill level → kg:

🛠️ Tech Stack
Frontend:

React.js / Next.js
Tailwind CSS
Backend:

Node.js
Express.js
Database:

MongoDB
Other:

REST APIs
Vercel / Render deployment
🧩 System Architecture
User (Organizer) → Frontend → Backend API → Database
↓
BMC Dashboard

Frontend collects event data
Backend calculates waste predictions
Database stores logs and reports
BMC dashboard shows upcoming waste forecasts
🚀 Future Improvements
AI-based waste prediction using historical data
Image-based bin detection
IoT smart bins integration
Live BMC truck tracking
👨‍💻 Author
Sumit Pathak
📍 Mumbai, India

🔗 LinkedIn
🔗 GitHub
