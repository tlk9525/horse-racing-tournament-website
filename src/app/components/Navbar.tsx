import { useState, useEffect } from 'react';
import { Menu, X, TrendingUp, Circle } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Next race countdown (example: 7 days from now)
    const nextRaceDate = new Date();
    nextRaceDate.setDate(nextRaceDate.getDate() + 7);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = nextRaceDate.getTime() - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { name: 'Dashboard', page: 'dashboard' },
    { name: 'Tournaments', page: 'tournaments' },
    { name: 'Horses', page: 'horses' },
    { name: 'Jockeys', page: 'jockeys' },
    { name: 'Live Race', page: 'live-race' },
    { name: 'Rankings', page: 'rankings' },
    { name: 'Predictions', page: 'predictions' },
    { name: 'Results', page: 'results' },
    { name: 'Admin', page: 'admin' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#e10600] to-[#b00500] rounded-md flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div className="hidden lg:block">
              <div className="text-white font-bold text-xl tracking-tight">HORSE RACING</div>
              <div className="text-[#8a8a8a] text-xs tracking-widest">TOURNAMENT SYSTEM</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`px-4 py-2 rounded transition-all ${
                  currentPage === item.page
                    ? 'bg-[#e10600] text-white'
                    : 'text-[#8a8a8a] hover:text-white hover:bg-white/5'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Live Status & Countdown */}
          <div className="hidden lg:flex items-center gap-6">
            {/* Live Status */}
            <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] rounded border border-[#e10600]/30">
              <Circle className="w-2 h-2 fill-[#e10600] text-[#e10600] animate-pulse" />
              <span className="text-white text-sm font-semibold">LIVE</span>
            </div>

            {/* Race Countdown */}
            <div className="flex items-center gap-4 px-4 py-2 bg-[#1a1a1a] rounded border border-white/10">
              <span className="text-[#8a8a8a] text-xs uppercase tracking-wider">Next Race</span>
              <div className="flex gap-2">
                <div className="flex flex-col items-center">
                  <span className="text-white font-bold text-sm">{countdown.days.toString().padStart(2, '0')}</span>
                  <span className="text-[#8a8a8a] text-xs">D</span>
                </div>
                <span className="text-[#8a8a8a]">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-white font-bold text-sm">{countdown.hours.toString().padStart(2, '0')}</span>
                  <span className="text-[#8a8a8a] text-xs">H</span>
                </div>
                <span className="text-[#8a8a8a]">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-white font-bold text-sm">{countdown.minutes.toString().padStart(2, '0')}</span>
                  <span className="text-[#8a8a8a] text-xs">M</span>
                </div>
                <span className="text-[#8a8a8a]">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-white font-bold text-sm">{countdown.seconds.toString().padStart(2, '0')}</span>
                  <span className="text-[#8a8a8a] text-xs">S</span>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <button className="px-6 py-2 bg-[#e10600] text-white rounded hover:bg-[#c00500] transition-colors">
              Login
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="xl:hidden text-white hover:text-[#e10600] transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="xl:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => {
                    onNavigate(item.page);
                    setIsMenuOpen(false);
                  }}
                  className={`px-4 py-3 rounded text-left transition-all ${
                    currentPage === item.page
                      ? 'bg-[#e10600] text-white'
                      : 'text-[#8a8a8a] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              <button className="mt-2 px-4 py-3 bg-[#e10600] text-white rounded hover:bg-[#c00500] transition-colors">
                Login / Register
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
