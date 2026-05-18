import Navbar from './app/components/Navbar';
import Footer from './app/components/Footer';
import LandingPage from './app/components/LandingPage';
import Dashboard from './app/components/Dashboard';
import TournamentPage from './app/components/TournamentPage';
import TournamentDetails from './app/components/TournamentDetails';
import HorseManagement from './app/components/HorseManagement';
import JockeyPage from './app/components/JockeyPage';
import LiveRace from './app/components/LiveRace';
import PredictionPage from './app/components/PredictionPage';
import ResultsPage from './app/components/ResultsPage';
import AdminPanel from './app/components/AdminPanel';
import RankingsPage from './app/components/RankingsPage';
import HorseDetails from './app/components/HorseDetails';

import { useState } from 'react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <LandingPage onNavigate={setCurrentPage} />;

      case 'dashboard':
        return <Dashboard />;

      case 'tournaments':
        return (
          <TournamentPage onNavigate={setCurrentPage} />
        );

      case 'tournament-details':
        return <TournamentDetails />;

      case 'horses':
        return (
          <HorseManagement onNavigate={setCurrentPage} />
        );

      case 'jockeys':
        return <JockeyPage />;

      case 'live-race':
        return <LiveRace />;

      case 'predictions':
        return <PredictionPage />;

      case 'results':
        return <ResultsPage />;

      case 'rankings':
        return <RankingsPage />;

      case 'admin':
        return <AdminPanel />;

      case 'horse-details':
        return <HorseDetails />;

      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] dark">
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      {renderPage()}

      <Footer />
    </div>
  );
}