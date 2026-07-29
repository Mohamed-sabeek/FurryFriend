import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchDashboardData } from '../../redux/slices/dashboardSlice';
import Sidebar from '../../components/dashboard/Sidebar/Sidebar';
import TopNavbar from '../../components/dashboard/TopNavbar/TopNavbar';

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isVetPage = location.pathname.includes('/dashboard/ai');

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  return (
    <div className="h-screen bg-background font-inter flex overflow-hidden">
      <Sidebar />
      {/* Right column: exactly viewport height, never taller */}
      <div className="flex-1 ml-[280px] flex flex-col h-screen overflow-hidden">
        {!isVetPage && <TopNavbar />}

        {/* Main content — overflow-hidden on vet page so VetConnectPage owns its height */}
        <main className={`flex-1 overflow-hidden ${isVetPage ? 'p-0 flex flex-col' : 'p-8 overflow-y-auto'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
