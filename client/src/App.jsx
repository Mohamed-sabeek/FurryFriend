import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/Auth/AuthPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import DashboardLayout from './pages/Dashboard/DashboardLayout';
import MyPets from './pages/Dashboard/MyPets/MyPets';
import ViewPet from './pages/Dashboard/MyPets/ViewPet';
import VetConnectPage from './pages/Dashboard/VetConnect/VetConnectPage';
import AppointmentsPage from './pages/Dashboard/AppointmentsPage';
import HealthRecordsPage from './pages/Dashboard/HealthRecords/HealthRecordsPage';
import NutritionPlansPage from './pages/Dashboard/NutritionPlans/NutritionPlansPage';
import MarketplacePage from './pages/Dashboard/Marketplace/MarketplacePage';
import GroomingPage from './pages/Dashboard/Grooming/GroomingPage';
import BoardingPage from './pages/Dashboard/Boarding/BoardingPage';
import ProfilePage from './pages/Dashboard/Profile/ProfilePage';
import SettingsPage from './pages/Dashboard/Settings/SettingsPage';
import ProtectedRoute from './components/routing/ProtectedRoute';
import './index.css';

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="pets" element={<MyPets />} />
            <Route path="pets/:id" element={<ViewPet />} />
            <Route path="health-records" element={<HealthRecordsPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="ai" element={<VetConnectPage />} />
            <Route path="nutrition" element={<NutritionPlansPage />} />
            <Route path="marketplace" element={<MarketplacePage />} />
            <Route path="grooming" element={<GroomingPage />} />
            <Route path="boarding" element={<BoardingPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
