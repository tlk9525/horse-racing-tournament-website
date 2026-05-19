import {
  TrendingUp,
  Award,
  Activity,
  User,
  Plus,
} from 'lucide-react';

interface HorseManagementProps {
  onNavigate: (page: string) => void;
}

export default function HorseManagement({
  onNavigate,
}: HorseManagementProps) {

  const horses = [
    {
      id: 1,
      name: 'Midnight Storm',
      breed: 'Thoroughbred',
      age: 4,
      owner: 'Sterling Stables',
      jockey: 'Marcus Sterling',
      wins: 18,
      races: 24,
      winRate: 75,
      speed: 95,
      stamina: 88,
      power: 92,
      experience: 85,
      image:
        'https://images.unsplash.com/photo-1507514604110-ba3347c457f6?w=1200',
    },
    {
      id: 2,
      name: 'Silver Bullet',
      breed: 'Arabian',
      age: 5,
      owner: 'Phoenix Racing',
      jockey: 'Sarah Chen',
      wins: 22,
      races: 30,
      winRate: 73,
      speed: 92,
      stamina: 90,
      power: 89,
      experience: 91,
      image:
        'https://images.unsplash.com/photo-1526094633853-031707a44819?w=1200',
    },
    {
      id: 3,
      name: 'Racing Thunder',
      breed: 'Quarter Horse',
      age: 3,
      owner: 'Thunder Valley Ranch',
      jockey: 'Diego Martinez',
      wins: 15,
      races: 20,
      winRate: 75,
      speed: 94,
      stamina: 85,
      power: 95,
      experience: 78,
      image:
        'https://images.unsplash.com/flagged/photo-1569319388901-605a6d2d1299?w=1200',
    },
    {
      id: 4,
      name: 'Golden Spirit',
      breed: 'Thoroughbred',
      age: 4,
      owner: 'Elite Equestrian',
      jockey: 'Emily Johnson',
      wins: 20,
      races: 28,
      winRate: 71,
      speed: 90,
      stamina: 93,
      power: 87,
      experience: 88,
      image:
        'https://images.unsplash.com/photo-1495543377553-b2aba1f925d7?w=1200',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12">

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-10">

          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Horse Management
            </h1>

            <p className="text-gray-400">
              Manage and track your racing horses
            </p>
          </div>

          {/* REGISTER BUTTON */}
          <button
            onClick={() =>
              onNavigate('register-horse')
            }
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#e10600] text-white rounded-lg hover:bg-[#c00500] transition-all font-semibold shadow-lg shadow-[#e10600]/20"
          >

            <Plus className="w-5 h-5" />

            Register Horse

          </button>
        </div>

        {/* GRID */}
        <div className="grid xl:grid-cols-2 gap-8">

          {horses.map((horse) => (
            <div
              key={horse.id}
              className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden hover:border-[#e10600]/40 transition-all duration-300 group"
            >

              <div className="grid md:grid-cols-2">

                {/* IMAGE */}
                <div className="relative h-[320px] overflow-hidden">

                  <img
                    src={horse.image}
                    alt={horse.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#141414]/80" />

                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#e10600] text-white text-xs font-bold uppercase tracking-wider">
                    Elite Horse
                  </div>

                </div>

                {/* INFO */}
                <div className="p-6 flex flex-col justify-between">

                  <div>

                    <h2 className="text-3xl font-bold text-white mb-2 group-hover:text-[#e10600] transition-colors">
                      {horse.name}
                    </h2>

                    <p className="text-gray-400 mb-6">
                      {horse.breed} • {horse.age} years old
                    </p>

                    {/* OWNER */}
                    <div className="space-y-3 mb-6 border-b border-white/10 pb-5">

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400">
                          <User className="w-4 h-4" />
                          Owner
                        </div>

                        <span className="text-white font-semibold">
                          {horse.owner}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Award className="w-4 h-4" />
                          Jockey
                        </div>

                        <span className="text-white font-semibold">
                          {horse.jockey}
                        </span>
                      </div>

                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-3 gap-3 mb-6">

                      <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 text-center">
                        <div className="text-[#e10600] text-2xl font-bold">
                          {horse.wins}
                        </div>

                        <div className="text-gray-400 text-xs uppercase tracking-wide">
                          Wins
                        </div>
                      </div>

                      <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 text-center">
                        <div className="text-white text-2xl font-bold">
                          {horse.races}
                        </div>

                        <div className="text-gray-400 text-xs uppercase tracking-wide">
                          Races
                        </div>
                      </div>

                      <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 text-center">
                        <div className="text-[#e10600] text-2xl font-bold">
                          {horse.winRate}%
                        </div>

                        <div className="text-gray-400 text-xs uppercase tracking-wide">
                          Win Rate
                        </div>
                      </div>

                    </div>

                    {/* PERFORMANCE */}
                    <div className="space-y-4">

                      {[
                        {
                          label: 'Speed',
                          value: horse.speed,
                          icon: <TrendingUp className="w-4 h-4" />,
                        },
                        {
                          label: 'Stamina',
                          value: horse.stamina,
                          icon: <Activity className="w-4 h-4" />,
                        },
                        {
                          label: 'Power',
                          value: horse.power,
                          icon: <Award className="w-4 h-4" />,
                        },
                        {
                          label: 'Experience',
                          value: horse.experience,
                          icon: <User className="w-4 h-4" />,
                        },
                      ].map((stat, index) => (
                        <div key={index}>

                          <div className="flex items-center justify-between mb-2">

                            <div className="flex items-center gap-2 text-gray-300 text-sm">
                              {stat.icon}
                              {stat.label}
                            </div>

                            <span className="text-white font-bold text-sm">
                              {stat.value}
                            </span>

                          </div>

                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">

                            <div
                              className="h-full bg-gradient-to-r from-[#e10600] to-[#ff4500] rounded-full"
                              style={{
                                width: `${stat.value}%`,
                              }}
                            />

                          </div>

                        </div>
                      ))}

                    </div>

                  </div>

                  {/* DETAILS BUTTON */}
                  <button
                    onClick={() =>
                      onNavigate('horse-details')
                    }
                    className="w-full mt-8 py-3 rounded-xl bg-[#e10600]/10 border border-[#e10600]/30 text-[#e10600] font-semibold hover:bg-[#e10600] hover:text-white transition-all duration-300"
                  >
                    View Details
                  </button>

                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}