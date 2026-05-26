// App.tsx

import { useState } from 'react';

import Navbar from './app/components/Navbar';
import Footer from './app/components/Footer';

import LandingPage from './app/components/LandingPage';
import Dashboard from './app/components/Dashboard';
import RaceDetails from './app/components/RaceDetails';

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
import RegisterPage from './app/components/RegisterPage';

export default function App() {

  const [currentPage, setCurrentPage] =
    useState('dashboard');

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
        return (
          <TournamentDetails />
        );

      case 'race-details':
        return (
          <RaceDetails />
        );

      case 'horses':
        return (
          <HorseManagement
            onNavigate={setCurrentPage}
          />
        );

      case 'horse-details':
        return (
          <HorseDetails />
        );

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
        return (
          <LiveRace />
        );

      case 'predictions':
        return (
          <PredictionPage />
        );

      case 'results':
        return (
          <ResultsPage />
        );

      case 'rankings':
        return (
          <RankingsPage />
        );

      case 'admin':
        return (
          <AdminPanel />
        );

      case 'login':
        return (
          <LoginPage
            onNavigate={setCurrentPage}
          />
        );

      case 'register':
        return (
          <RegisterPage
            onNavigate={setCurrentPage}
          />
        );

      default:
        return (
          <Dashboard
            onNavigate={setCurrentPage}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] dark overflow-x-hidden">

      {/* NAVBAR */}
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      {/* PAGE CONTENT */}
      <main className="pt-16 min-h-screen">

        {renderPage()}

      </main>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}