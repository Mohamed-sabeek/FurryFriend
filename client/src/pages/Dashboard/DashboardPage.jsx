import React from 'react';
import HeroCard from '../../components/dashboard/HeroCard/HeroCard';
import StatsCards from '../../components/dashboard/StatsCards/StatsCards';
import AIAgentGrid from '../../components/dashboard/AIAgents/AIAgentGrid';
import NextAppointmentCard from './VetConnect/components/NextAppointmentCard';
import { useSelector } from 'react-redux';

const DashboardPage = () => {
  const { isLoading } = useSelector(state => state.dashboard);

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col gap-6">
        <div className="h-64 bg-gray-200 rounded-3xl animate-pulse"></div>
        <div className="grid grid-cols-4 gap-6">
          <div className="h-32 bg-gray-200 rounded-3xl animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded-3xl animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded-3xl animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded-3xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 max-w-[1400px] mx-auto">
      <NextAppointmentCard />
      <HeroCard />
      <StatsCards />
      <AIAgentGrid />
      
      {/* We will add Recent Activity and Quick Actions widgets below in subsequent phases if requested */}
    </div>
  );
};

export default DashboardPage;
