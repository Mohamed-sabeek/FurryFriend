import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/Auth/AuthPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import DashboardLayout from './pages/Dashboard/DashboardLayout';
import MyPets from './pages/Dashboard/MyPets/MyPets';
import ViewPet from './pages/Dashboard/MyPets/ViewPet';
import VetConnectPage from './pages/Dashboard/VetConnect/VetConnectPage';
import AppointmentsPage from './pages/Dashboard/Appointments/AppointmentsPage';
import HealthRecordsPage from './pages/Dashboard/HealthRecords/HealthRecordsPage';
import NutritionPlansPage from './pages/Dashboard/NutritionPlans/NutritionPlansPage';
import MarketplacePage from './pages/Dashboard/Marketplace/MarketplacePage';
import GroomingPage from './pages/Dashboard/Grooming/GroomingPage';
import GroomEaseAIPage from './pages/Dashboard/GroomEaseAI/GroomEaseAIPage';
import BoardingPage from './pages/Dashboard/Boarding/BoardingPage';
import ProfilePage from './pages/Dashboard/Profile/ProfilePage';
import SettingsPage from './pages/Dashboard/Settings/SettingsPage';
import PetCommerceHome from './pages/PetCommerceHome';
import ProductDetails from './pages/ProductDetails';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import MyOrders from './pages/MyOrders';
import OrderTracking from './pages/OrderTracking';
import ProtectedRoute from './components/routing/ProtectedRoute';
import ClinicLayout from './pages/Clinic/ClinicLayout';
import ClinicDashboard from './pages/Clinic/ClinicDashboard';
import ClinicAppointments from './pages/Clinic/ClinicAppointments';
import ClinicProfile from './pages/Clinic/ClinicProfile';
import ConsultationForm from './pages/Clinic/ConsultationForm';
import GroomingLayout from './pages/Grooming/GroomingLayout';
import GroomingDashboard from './pages/Grooming/GroomingDashboard';
import GroomingAppointments from './pages/Grooming/GroomingAppointments';
import GroomingProfile from './pages/Grooming/GroomingProfile';
import BoardingLayout from './pages/Boarding/BoardingLayout';
import BoardingDashboard from './pages/Boarding/BoardingDashboard';
import BoardingAppointments from './pages/Boarding/BoardingAppointments';
import BoardingProfile from './pages/Boarding/BoardingProfile';
import TravelPawsPage from './pages/Dashboard/TravelPaws/TravelPawsPage';
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
            <Route path="groomsense" element={<GroomEaseAIPage />} />
            <Route path="boarding" element={<TravelPawsPage />} />
            <Route path="store" element={<div className="p-8">Store Feature Coming Soon</div>} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="/commerce" element={<DashboardLayout />}>
            <Route index element={<PetCommerceHome />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="track/:id" element={<OrderTracking />} />
          </Route>
        </Route>

        {/* Clinic Routes */}
        <Route element={<ProtectedRoute allowedRoles={['vet', 'admin']} />}>
          <Route path="/clinic" element={<ClinicLayout />}>
            <Route path="dashboard" element={<ClinicDashboard />} />
            <Route path="appointments" element={<ClinicAppointments />} />
            <Route path="appointments/:id/consultation" element={<ConsultationForm />} />
            <Route path="profile" element={<ClinicProfile />} />
          </Route>
        </Route>

        {/* Grooming Routes */}
        <Route element={<ProtectedRoute allowedRoles={['grooming', 'admin']} />}>
          <Route path="/grooming" element={<GroomingLayout />}>
            <Route path="dashboard" element={<GroomingDashboard />} />
            <Route path="appointments" element={<GroomingAppointments />} />
            <Route path="profile" element={<GroomingProfile />} />
          </Route>
        </Route>

        {/* Boarding Routes */}
        <Route element={<ProtectedRoute allowedRoles={['boarding', 'admin']} />}>
          <Route path="/boarding" element={<BoardingLayout />}>
            <Route path="dashboard" element={<BoardingDashboard />} />
            <Route path="appointments" element={<BoardingAppointments />} />
            <Route path="profile" element={<BoardingProfile />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
