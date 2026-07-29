# 🐾 FurryFriend

FurryFriend is a comprehensive, production-ready pet health and management platform designed to help pet owners seamlessly track their pets' well-being. It features **VetConnect AI**, an intelligent autonomous veterinary assistant that can book appointments, find nearby hospitals, and analyze medical records in real time.

## ✨ Features

*   **🐶 Pet Profiles**: Add and manage profiles for all your pets, including their basic info, breed, age, and photos.
*   **🏥 Health Records**: A complete digital medical timeline for each pet. Track past checkups, vaccinations, and medications in a unified view.
*   **🤖 VetConnect AI**: An autonomous chatbot powered by Groq (Llama 3.1) that acts as your personal veterinary assistant.
    *   **Book Appointments**: Have a conversational booking experience where the AI asks for the pet, reason, date, and time.
    *   **Find Nearby Clinics**: The AI can retrieve your location and display nearby veterinary clinics on an interactive map.
    *   **Manage Appointments**: Check upcoming appointments or cancel them directly through the chat.
*   **🩺 AI Health Summary**: Generates intelligent, real-time insights based on your pet's entire medical history, vaccinations, and upcoming appointments.

## 🛠️ Technology Stack

**Frontend**
*   React (Vite)
*   Redux Toolkit (State Management)
*   Framer Motion (Animations)
*   Lucide React (Icons)
*   Tailwind CSS (Styling)

**Backend**
*   Node.js & Express
*   MongoDB & Mongoose
*   Groq SDK (LLM Integration)
*   JSON Web Tokens (JWT Authentication)

## 🚀 Getting Started

### Prerequisites
*   Node.js (v16 or higher)
*   MongoDB instance (local or Atlas)
*   Groq API Key

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/FurryFriend.git
cd FurryFriend
\`\`\`

### 2. Setup the Backend
\`\`\`bash
cd server
npm install
\`\`\`
Create a `.env` file in the `server` directory with the following variables:
\`\`\`env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
GEOAPIFY_API_KEY=your_geoapify_api_key
\`\`\`
Start the backend server:
\`\`\`bash
npm run dev
\`\`\`

### 3. Setup the Frontend
\`\`\`bash
cd ../client
npm install
\`\`\`
Create a `.env` file in the `client` directory (if required by your configuration):
\`\`\`env
VITE_API_URL=http://localhost:5000
VITE_GEOAPIFY_API_KEY=your_geoapify_api_key
\`\`\`
Start the frontend development server:
\`\`\`bash
npm run dev
\`\`\`

## 📁 Project Structure

\`\`\`text
FurryFriend/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page views (Dashboard, Health Records, VetConnect AI)
│   │   ├── redux/          # Redux slices and store
│   │   └── utils/          # Axios interceptors and helpers
├── server/                 # Node.js Backend
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth and error middlewares
│   ├── models/             # Mongoose schemas (Pet, User, Appointment, HealthRecord)
│   ├── routes/             # Express API routes
│   └── services/           # AI orchestration, tool execution, and Groq client
└── .gitignore
\`\`\`

## 📝 License

This project is licensed under the MIT License.
