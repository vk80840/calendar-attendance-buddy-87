import React, { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import Predictor from '@/components/Predictor';
import BottomNavigation from '@/components/BottomNavigation';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'predictor'>('dashboard');

  return (
    <div className="min-h-screen bg-background pb-20">
      {activeTab === 'dashboard' ? <Dashboard /> : <Predictor />}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
