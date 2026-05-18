import { Users, Shield, Calendar, CheckCircle, XCircle, Settings, BarChart3, FileText } from 'lucide-react';

export default function AdminPanel() {
  const pendingApprovals = [
    { id: 1, type: 'Horse Registration', name: 'Storm Rider', owner: 'Blue Ridge Stables', date: 'May 18, 2026' },
    { id: 2, type: 'Jockey Application', name: 'Alex Thompson', experience: '5 years', date: 'May 17, 2026' },
    { id: 3, type: 'Tournament Entry', name: 'Swift Lightning', tournament: 'Summer Derby', date: 'May 16, 2026' },
  ];

  const scheduledRaces = [
    { id: 1, name: 'Elite Cup Qualifier', date: 'May 22, 2026', time: '16:30', status: 'scheduled', participants: 12 },
    { id: 2, name: 'Spring Derby Finals', date: 'May 25, 2026', time: '15:00', status: 'scheduled', participants: 16 },
    { id: 3, name: 'Regional Championship', date: 'May 28, 2026', time: '14:00', status: 'pending', participants: 8 },
  ];

  const systemStats = [
    { label: 'Total Users', value: '2,450', change: '+12%', icon: Users },
    { label: 'Active Tournaments', value: '12', change: '+3', icon: Calendar },
    { label: 'Pending Approvals', value: '8', change: '-2', icon: Shield },
    { label: 'System Health', value: '98%', change: '+1%', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Control Center</h1>
          <p className="text-gray-400">System management and administrative controls</p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#e10600]/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#e10600]" />
                  </div>
                  <span className="text-green-500 text-sm font-semibold">{stat.change}</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pending Approvals */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Pending Approvals</h2>
                <span className="px-3 py-1 bg-[#e10600]/20 border border-[#e10600] rounded text-[#e10600] text-sm font-bold">
                  {pendingApprovals.length} Pending
                </span>
              </div>

              <div className="space-y-4">
                {pendingApprovals.map((item) => (
                  <div key={item.id} className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-1 bg-blue-600/20 border border-blue-600/30 rounded text-blue-500 text-xs font-semibold">
                            {item.type}
                          </span>
                          <span className="text-gray-400 text-sm">{item.date}</span>
                        </div>
                        <h3 className="text-white font-bold text-lg">{item.name}</h3>
                        <p className="text-gray-400 text-sm">
                          {'owner' in item && `Owner: ${item.owner}`}
                          {'experience' in item && `Experience: ${item.experience}`}
                          {'tournament' in item && `Tournament: ${item.tournament}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Race Schedule Management */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Race Schedule</h2>
                <button className="px-4 py-2 bg-[#e10600] text-white rounded hover:bg-[#c00500] transition-colors text-sm font-semibold">
                  + Create Race
                </button>
              </div>

              <div className="space-y-4">
                {scheduledRaces.map((race) => (
                  <div key={race.id} className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-bold text-lg">{race.name}</h3>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              race.status === 'scheduled'
                                ? 'bg-green-600/20 border border-green-600/30 text-green-500'
                                : 'bg-yellow-600/20 border border-yellow-600/30 text-yellow-500'
                            }`}
                          >
                            {race.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-400 text-sm">
                          <span>{race.date}</span>
                          <span>•</span>
                          <span>{race.time}</span>
                          <span>•</span>
                          <span>{race.participants} participants</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-[#e10600]/10 text-[#e10600] rounded hover:bg-[#e10600] hover:text-white transition-all border border-[#e10600]/30 text-sm">
                          Edit
                        </button>
                        <button className="px-4 py-2 bg-white/5 text-white rounded hover:bg-white/10 transition-colors text-sm">
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] text-white rounded hover:bg-[#e10600]/10 hover:border-[#e10600]/50 transition-all border border-white/10">
                  <Users className="w-5 h-5 text-[#e10600]" />
                  <span>Manage Users</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] text-white rounded hover:bg-[#e10600]/10 hover:border-[#e10600]/50 transition-all border border-white/10">
                  <Shield className="w-5 h-5 text-[#e10600]" />
                  <span>Role Permissions</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] text-white rounded hover:bg-[#e10600]/10 hover:border-[#e10600]/50 transition-all border border-white/10">
                  <Calendar className="w-5 h-5 text-[#e10600]" />
                  <span>Tournament Manager</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] text-white rounded hover:bg-[#e10600]/10 hover:border-[#e10600]/50 transition-all border border-white/10">
                  <FileText className="w-5 h-5 text-[#e10600]" />
                  <span>Publish Results</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] text-white rounded hover:bg-[#e10600]/10 hover:border-[#e10600]/50 transition-all border border-white/10">
                  <Settings className="w-5 h-5 text-[#e10600]" />
                  <span>System Settings</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
              <div className="space-y-4">
                <div className="border-l-2 border-[#e10600] pl-4">
                  <div className="text-gray-400 text-xs mb-1">2 hours ago</div>
                  <div className="text-white text-sm">New horse registration approved</div>
                </div>
                <div className="border-l-2 border-white/20 pl-4">
                  <div className="text-gray-400 text-xs mb-1">5 hours ago</div>
                  <div className="text-white text-sm">Race results published for Thunder Valley Sprint</div>
                </div>
                <div className="border-l-2 border-white/20 pl-4">
                  <div className="text-gray-400 text-xs mb-1">8 hours ago</div>
                  <div className="text-white text-sm">Tournament schedule updated</div>
                </div>
                <div className="border-l-2 border-white/20 pl-4">
                  <div className="text-gray-400 text-xs mb-1">1 day ago</div>
                  <div className="text-white text-sm">3 new jockey applications received</div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">System Status</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Server Uptime</span>
                    <span className="text-green-500 text-sm font-semibold">99.9%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[99.9%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Database Load</span>
                    <span className="text-green-500 text-sm font-semibold">45%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[45%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">API Response</span>
                    <span className="text-green-500 text-sm font-semibold">120ms</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[85%]"></div>
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
