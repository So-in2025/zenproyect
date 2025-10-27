
import React, { useState } from 'react';
import LandingPage from './components/landing/LandingPage';
import DashboardPage from './components/dashboard/DashboardPage';

type View = 'landing' | 'dashboard';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('landing');

    const handleContinueToDashboard = () => {
        setCurrentView('dashboard');
    };
    
    return (
        <div className="min-h-screen bg-slate-900">
            {currentView === 'landing' && <LandingPage onContinueToDashboard={handleContinueToDashboard} />}
            {currentView === 'dashboard' && <DashboardPage />}
        </div>
    );
};

export default App;
