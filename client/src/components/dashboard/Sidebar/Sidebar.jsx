import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../../redux/slices/authSlice';
import { 
  LayoutDashboard, 
  Dog, 
  CalendarCheck, 
  FileHeart, 
  Apple, 
  ShoppingBag, 
  Scissors, 
  Home, 
  Bot, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  Package,
  AlertTriangle
} from 'lucide-react';
import logo from '../../../assets/furryfriend.png';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'My Pets', path: '/dashboard/pets', icon: Dog },
  { name: 'My Appointments', path: '/dashboard/appointments', icon: CalendarCheck },
  { name: 'VetConnect AI', path: '/dashboard/ai', icon: Bot },
  { name: 'PetHealth AI', path: '/dashboard/health-records', icon: FileHeart },
  { name: 'NutriPaws AI', path: '/dashboard/nutrition', icon: Apple },
  { name: 'PetCommerce AI', path: '/commerce', icon: ShoppingBag },
  { name: 'My Orders', path: '/commerce/orders', icon: Package },
  { name: 'GroomSense AI', path: '/dashboard/groomsense', icon: Scissors },
  { name: 'TravelPaws AI', path: '/dashboard/boarding', icon: Home },
  { name: 'PetEmergency AI', path: '/dashboard/emergency', icon: AlertTriangle },
  { name: 'Profile', path: '/dashboard/profile', icon: User },
  { name: 'Settings', path: '/dashboard/settings', icon: Settings },
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  return (
    <motion.aside 
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="w-[280px] bg-white h-screen border-r border-gray-100 flex flex-col fixed left-0 top-0 z-40 shadow-sm"
    >
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-gray-50/50">
        <img src={logo} alt="FurryFriend" className="w-14 h-14 object-contain" />
        <span className="font-poppins text-xl font-bold text-primary ml-2 tracking-tight">FurryFriend</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6 overflow-y-auto hide-scrollbar">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  end={item.path === '/dashboard' || item.path === '/commerce'}
                  className={({ isActive }) => 
                    `flex items-center px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                      isActive 
                        ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-glow' 
                        : 'text-text-body hover:bg-gray-50 hover:text-primary'
                    }`
                  }
                >
                  <Icon size={20} className="mr-3 flex-shrink-0" />
                  <span className="font-inter text-sm">{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-50/50">
        <button 
          onClick={() => dispatch(logoutUser())}
          className="flex items-center w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium font-inter text-sm"
        >
          <LogOut size={20} className="mr-3 flex-shrink-0" />
          Logout
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
