import { Trophy, TrendingUp, Award, Calendar } from 'lucide-react';

export default function JockeyPage() {
  const jockeys = [
    {
      id: 1,
      name: 'Marcus Sterling',
      nationality: 'USA',
      age: 32,
      experience: '12 years',
      totalRaces: 450,
      wins: 308,
      podiums: 385,
      winRate: 68.5,
      currentHorse: 'Midnight Storm',
      championships: 8,
      earnings: '$4.2M',
      image: 'https://images.unsplash.com/photo-1507514604110-ba3347c457f6?w=400',
    },
    {
      id: 2,
      name: 'Sarah Chen',
      nationality: 'China',
      age: 28,
      experience: '9 years',
      totalRaces: 380,
      wins: 248,
      podiums: 310,
      winRate: 65.2,
      currentHorse: 'Silver Bullet',
      championships: 6,
      earnings: '$3.8M',
      image: 'https://images.unsplash.com/photo-1526094633853-031707a44819?w=400',
    },
    {
      id: 3,
      name: 'Diego Martinez',
      nationality: 'Spain',
      age: 35,
      experience: '15 years',
      totalRaces: 520,
      wins: 326,
      podiums: 425,
      winRate: 62.8,
      currentHorse: 'Racing Thunder',
      championships: 10,
      earnings: '$5.1M',
      image: 'https://images.unsplash.com/flagged/photo-1569319388901-605a6d2d1299?w=400',
    },
    {
      id: 4,
      name: 'Emily Johnson',
      nationality: 'UK',
      age: 30,
      experience: '10 years',
      totalRaces: 410,
      wins: 244,
      podiums: 335,
      winRate: 59.4,
      currentHorse: 'Golden Spirit',
      championships: 5,
      earnings: '$3.5M',
      image: 'https://images.unsplash.com/photo-1495543377553-b2aba1f925d7?w=400',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Professional Jockeys</h1>
          <p className="text-gray-400">Top-ranked professional racing jockeys</p>
        </div>

        {/* Jockey Grid */}
        <div className="space-y-6">
          {jockeys.map((jockey, index) => (
            <div
              key={jockey.id}
              className="bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden hover:border-[#e10600]/50 transition-all group"
            >
              <div className="grid md:grid-cols-[300px,1fr]">
                {/* Jockey Image & Rank */}
                <div className="relative h-64 md:h-auto overflow-hidden">
                  <img
                    src={jockey.image}
                    alt={jockey.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1a1a1a]/80"></div>

                  {/* Rank Badge */}
                  <div className="absolute top-4 left-4">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl ${
                        index === 0
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black'
                          : index === 1
                          ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black'
                          : index === 2
                          ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-black'
                          : 'bg-[#2a2a2a] text-white'
                      }`}
                    >
                      #{index + 1}
                    </div>
                  </div>
                </div>

                {/* Jockey Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-[#e10600] transition-colors">
                        {jockey.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{jockey.nationality}</span>
                        <span>•</span>
                        <span>{jockey.age} years</span>
                        <span>•</span>
                        <span>{jockey.experience}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#e10600]/10 border border-[#e10600]/30 rounded">
                      <Trophy className="w-4 h-4 text-[#e10600]" />
                      <span className="text-[#e10600] font-bold">{jockey.championships}x Champion</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                    <div className="bg-[#0a0a0a] rounded-lg p-4 text-center">
                      <div className="text-[#e10600] font-bold text-2xl">{jockey.wins}</div>
                      <div className="text-gray-400 text-xs uppercase">Total Wins</div>
                    </div>

                    <div className="bg-[#0a0a0a] rounded-lg p-4 text-center">
                      <div className="text-white font-bold text-2xl">{jockey.totalRaces}</div>
                      <div className="text-gray-400 text-xs uppercase">Total Races</div>
                    </div>

                    <div className="bg-[#0a0a0a] rounded-lg p-4 text-center">
                      <div className="text-white font-bold text-2xl">{jockey.podiums}</div>
                      <div className="text-gray-400 text-xs uppercase">Podiums</div>
                    </div>

                    <div className="bg-[#0a0a0a] rounded-lg p-4 text-center">
                      <div className="text-[#e10600] font-bold text-2xl">{jockey.winRate}%</div>
                      <div className="text-gray-400 text-xs uppercase">Win Rate</div>
                    </div>

                    <div className="bg-[#0a0a0a] rounded-lg p-4 text-center">
                      <div className="text-white font-bold text-2xl">{jockey.earnings}</div>
                      <div className="text-gray-400 text-xs uppercase">Earnings</div>
                    </div>
                  </div>

                  {/* Current Assignment */}
                  <div className="bg-[#0a0a0a] rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Currently Riding</div>
                        <div className="text-white font-bold text-lg">{jockey.currentHorse}</div>
                      </div>
                      <button className="px-4 py-2 bg-[#e10600] text-white rounded hover:bg-[#c00500] transition-colors text-sm font-semibold">
                        View Profile
                      </button>
                    </div>
                  </div>

                  {/* Performance Indicators */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-xs uppercase">Consistency</span>
                        <span className="text-white text-xs font-bold">94%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#e10600] to-[#ff4500] w-[94%]"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-xs uppercase">Performance</span>
                        <span className="text-white text-xs font-bold">91%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#e10600] to-[#ff4500] w-[91%]"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-xs uppercase">Strategy</span>
                        <span className="text-white text-xs font-bold">88%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#e10600] to-[#ff4500] w-[88%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
