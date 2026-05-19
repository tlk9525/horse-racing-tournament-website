import { useState } from 'react';

import Navbar from './app/components/Navbar';
import Footer from './app/components/Footer';

import LandingPage from './app/components/LandingPage';
import Dashboard from './app/components/Dashboard';

import TournamentPage from './app/components/TournamentPage';
import TournamentDetails from './app/components/TournamentDetails';

import HorseManagement from './app/components/HorseManagement';
import HorseDetails from './app/components/HorseDetails';
import RegisterHorsePage from './app/components/RegisterHorsePage';

import JockeyPage from './app/components/JockeyPage';
import JockeyProfile from './app/components/JockeyProfile';

import LiveRace from './app/components/LiveRace';
import PredictionPage from './app/components/PredictionPage';
import ResultsPage from './app/components/ResultsPage';
import RankingsPage from './app/components/RankingsPage';
import AdminPanel from './app/components/AdminPanel';

import LoginPage from './app/components/LoginPage';

export default function App() {

  const [currentPage, setCurrentPage] =
    useState('jockeys');

  const renderPage = () => {

    switch (currentPage) {

      case 'home':
        return (
          <LandingPage
            onNavigate={setCurrentPage}
          />
        );

      case 'dashboard':
        return (
          <Dashboard
            onNavigate={setCurrentPage}
          />
        );

      case 'tournaments':
        return (
          <TournamentPage
            onNavigate={setCurrentPage}
          />
        );

      case 'tournament-details':
        return <TournamentDetails />;

      case 'horses':
        return (
          <HorseManagement
            onNavigate={setCurrentPage}
          />
        );

      case 'horse-details':
        return <HorseDetails />;

      case 'register-horse':
        return (
          <RegisterHorsePage
            onNavigate={setCurrentPage}
          />
        );

      case 'jockeys':
        return (
          <JockeyPage
            onNavigate={setCurrentPage}
          />
        );

      case 'jockey-profile':
        return (
          <JockeyProfile
            onNavigate={setCurrentPage}
          />
        );

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

      case 'login':
        return (
          <LoginPage
            onNavigate={setCurrentPage}
          />
        );

      default:
        return (
          <LandingPage
            onNavigate={setCurrentPage}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] dark">

      <div className="fixed top-2 right-2 z-[9999] bg-red-600 text-white px-4 py-2 rounded-xl">
        {currentPage}
      </div>

      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      {renderPage()}

      <Footer />

    </div>
  );
}