import {
  ArrowLeft,
  Calendar,
  Clock,
  Trophy,
  Users,
  MapPin,
} from 'lucide-react';

interface CreateRacePageProps {
  onNavigate: (page: string) => void;
}

export default function CreateRacePage({
  onNavigate,
}: CreateRacePageProps) {

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12">

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* BACK */}
        <button
          onClick={() => onNavigate('admin')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-all mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Admin Panel
        </button>

        {/* HEADER */}
        <div className="mb-10">

          <h1 className="text-5xl font-black text-white mb-3">
            Create Race
          </h1>

          <p className="text-gray-400 text-lg">
            Schedule and manage a new horse racing event
          </p>

        </div>

        {/* FORM */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-8">

          <div className="grid md:grid-cols-2 gap-6">

            {/* Race Name */}
            <div>
              <label className="text-white font-semibold mb-3 block">
                Race Name
              </label>

              <div className="relative">

                <Trophy className="absolute left-4 top-4 w-5 h-5 text-[#e10600]" />

                <input
                  type="text"
                  placeholder="Elite Cup Qualifier"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#e10600]"
                />

              </div>
            </div>

            {/* Location */}
            <div>
              <label className="text-white font-semibold mb-3 block">
                Location
              </label>

              <div className="relative">

                <MapPin className="absolute left-4 top-4 w-5 h-5 text-[#e10600]" />

                <input
                  type="text"
                  placeholder="Thunder Valley Arena"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#e10600]"
                />

              </div>
            </div>

            {/* Date */}
            <div>
              <label className="text-white font-semibold mb-3 block">
                Race Date
              </label>

              <div className="relative">

                <Calendar className="absolute left-4 top-4 w-5 h-5 text-[#e10600]" />

                <input
                  type="date"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#e10600]"
                />

              </div>
            </div>

            {/* Time */}
            <div>
              <label className="text-white font-semibold mb-3 block">
                Race Time
              </label>

              <div className="relative">

                <Clock className="absolute left-4 top-4 w-5 h-5 text-[#e10600]" />

                <input
                  type="time"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#e10600]"
                />

              </div>
            </div>

            {/* Participants */}
            <div>
              <label className="text-white font-semibold mb-3 block">
                Participants
              </label>

              <div className="relative">

                <Users className="absolute left-4 top-4 w-5 h-5 text-[#e10600]" />

                <input
                  type="number"
                  placeholder="12"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#e10600]"
                />

              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-white font-semibold mb-3 block">
                Status
              </label>

              <select
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#e10600]"
              >
                <option>Scheduled</option>
                <option>Pending</option>
                <option>Live</option>
              </select>
            </div>

          </div>

          {/* DESCRIPTION */}
          <div className="mt-6">

            <label className="text-white font-semibold mb-3 block">
              Description
            </label>

            <textarea
              rows={5}
              placeholder="Enter race details..."
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#e10600]"
            />

          </div>

          {/* BUTTONS */}
          <div className="flex items-center justify-end gap-4 mt-8">

            <button
              onClick={() => onNavigate('admin')}
              className="px-6 py-3 border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition-all"
            >
              Cancel
            </button>

            <button
              className="px-8 py-3 bg-[#e10600] hover:bg-[#c00500] text-white rounded-xl font-bold transition-all"
            >
              Create Race
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}