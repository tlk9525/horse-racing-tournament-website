import { TrendingUp, Trophy, Target, Award } from 'lucide-react';

export default function PredictionPage() {
  const upcomingRaces = [
    {
      id: 1,
      name: 'Elite Cup Qualifier',
      date: 'May 22, 2026',
      time: '16:30',
      horses: ['Midnight Storm', 'Silver Bullet', 'Racing Thunder', 'Golden Spirit'],
      odds: [2.5, 3.2, 4.1, 5.8],
    },
    {
      id: 2,
      name: 'Spring Derby Finals',
      date: 'May 25, 2026',
      time: '15:00',
      horses: ['Thunder Bolt', 'Swift Arrow', 'Lightning Strike', 'Storm Chaser'],
      odds: [3.0, 2.8, 4.5, 6.2],
    },
  ];

  const myPredictions = [
    { race: 'Thunder Valley Sprint', prediction: 'Midnight Storm', result: 'Won', points: 100, status: 'correct' },
    { race: 'Golden Gate Classic', prediction: 'Silver Bullet', result: 'Won', points: 85, status: 'correct' },
    { race: 'Coastal Championship', prediction: 'Thunder Bolt', result: '2nd Place', points: 50, status: 'partial' },
    { race: 'Metropolitan Stakes', prediction: 'Golden Spirit', result: '4th Place', points: 0, status: 'incorrect' },
  ];

  const leaderboard = [
    { rank: 1, user: 'RacingPro2026', points: 2450, predictions: 45, accuracy: 82 },
    { rank: 2, user: 'HorseWhisperer', points: 2380, predictions: 48, accuracy: 79 },
    { rank: 3, user: 'SpeedDemon', points: 2290, predictions: 42, accuracy: 81 },
    { rank: 4, user: 'TrackMaster', points: 2150, predictions: 50, accuracy: 75 },
    { rank: 5, user: 'You', points: 1850, predictions: 38, accuracy: 73 },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Race Predictions</h1>
          <p className="text-gray-400">Predict race winners and climb the leaderboard</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#e10600]/10 rounded flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[#e10600]" />
              </div>
              <div className="text-gray-400 text-sm">Total Points</div>
            </div>
            <div className="text-3xl font-bold text-white">1,850</div>
          </div>

          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#e10600]/10 rounded flex items-center justify-center">
                <Target className="w-5 h-5 text-[#e10600]" />
              </div>
              <div className="text-gray-400 text-sm">Accuracy</div>
            </div>
            <div className="text-3xl font-bold text-[#e10600]">73%</div>
          </div>

          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#e10600]/10 rounded flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#e10600]" />
              </div>
              <div className="text-gray-400 text-sm">Win Streak</div>
            </div>
            <div className="text-3xl font-bold text-white">5</div>
          </div>

          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#e10600]/10 rounded flex items-center justify-center">
                <Award className="w-5 h-5 text-[#e10600]" />
              </div>
              <div className="text-gray-400 text-sm">Leaderboard</div>
            </div>
            <div className="text-3xl font-bold text-white">#5</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Make Predictions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Races */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Make Your Predictions</h2>

              <div className="space-y-6">
                {upcomingRaces.map((race) => (
                  <div key={race.id} className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{race.name}</h3>
                        <div className="text-gray-400 text-sm">
                          {race.date} • {race.time}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#e10600] font-bold text-lg">100 pts</div>
                        <div className="text-gray-400 text-xs">Potential Reward</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {race.horses.map((horse, index) => (
                        <button
                          key={index}
                          className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4 hover:border-[#e10600]/50 hover:bg-[#e10600]/5 transition-all group text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-white font-semibold group-hover:text-[#e10600] transition-colors">
                                {horse}
                              </div>
                              <div className="text-gray-400 text-sm mt-1">Odds: {race.odds[index].toFixed(1)}x</div>
                            </div>
                            <div className="w-8 h-8 border-2 border-white/20 rounded-full group-hover:border-[#e10600] transition-colors"></div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <button className="w-full mt-4 py-3 bg-[#e10600] text-white rounded hover:bg-[#c00500] transition-colors font-semibold">
                      Submit Prediction
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* My Predictions History */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">My Prediction History</h2>

              <div className="space-y-3">
                {myPredictions.map((pred, index) => (
                  <div
                    key={index}
                    className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="text-white font-semibold mb-1">{pred.race}</div>
                      <div className="text-gray-400 text-sm">Predicted: {pred.prediction}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-white font-semibold">{pred.result}</div>
                        <div className="text-gray-400 text-sm">Result</div>
                      </div>
                      <div
                        className={`px-4 py-2 rounded font-bold ${
                          pred.status === 'correct'
                            ? 'bg-green-600/20 text-green-500 border border-green-600/30'
                            : pred.status === 'partial'
                            ? 'bg-yellow-600/20 text-yellow-500 border border-yellow-600/30'
                            : 'bg-red-600/20 text-red-500 border border-red-600/30'
                        }`}
                      >
                        {pred.points > 0 ? `+${pred.points}` : pred.points} pts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Leaderboard */}
          <div className="space-y-8">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-6 h-6 text-[#e10600]" />
                <h2 className="text-2xl font-bold text-white">Global Leaderboard</h2>
              </div>

              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`rounded-lg p-4 ${
                      entry.user === 'You'
                        ? 'bg-[#e10600]/10 border-2 border-[#e10600]'
                        : 'bg-[#0a0a0a] border border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded flex items-center justify-center font-bold ${
                          entry.rank === 1
                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black'
                            : entry.rank === 2
                            ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black'
                            : entry.rank === 3
                            ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-black'
                            : 'bg-[#2a2a2a] text-white'
                        }`}
                      >
                        {entry.rank}
                      </div>

                      <div className="flex-1">
                        <div className="text-white font-semibold">{entry.user}</div>
                        <div className="text-gray-400 text-sm">
                          {entry.predictions} predictions • {entry.accuracy}% accuracy
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[#e10600] font-bold text-lg">{entry.points}</div>
                        <div className="text-gray-400 text-xs">points</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Rewards</h3>
              <div className="space-y-3">
                <div className="bg-[#0a0a0a] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Bronze Badge</span>
                    <span className="text-green-500 text-sm">Unlocked</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#e10600] w-full"></div>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Silver Badge</span>
                    <span className="text-yellow-500 text-sm">850/2000</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#e10600] w-[42.5%]"></div>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Gold Badge</span>
                    <span className="text-gray-500 text-sm">Locked</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-white/10 w-0"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
