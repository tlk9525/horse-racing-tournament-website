import { useParams } from 'react-router-dom';

export default function TournamentDetails() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">

        <div className="bg-[#111111] border border-white/10 rounded-xl p-8">

          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[#e10600] text-sm uppercase tracking-widest">
                Tournament
              </p>

              <h1 className="text-4xl font-bold text-white mt-2">
                Race #{id}
              </h1>
            </div>

            <div className="px-4 py-2 bg-[#e10600]/20 border border-[#e10600] rounded-lg text-[#e10600] font-semibold">
              LIVE
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">

            <div className="bg-[#1a1a1a] rounded-lg p-5 border border-white/10">
              <p className="text-gray-400 text-sm mb-2">Location</p>
              <h3 className="text-white text-xl font-bold">
                Churchill Downs
              </h3>
            </div>

            <div className="bg-[#1a1a1a] rounded-lg p-5 border border-white/10">
              <p className="text-gray-400 text-sm mb-2">Prize Pool</p>
              <h3 className="text-white text-xl font-bold">
                $5,000,000
              </h3>
            </div>

            <div className="bg-[#1a1a1a] rounded-lg p-5 border border-white/10">
              <p className="text-gray-400 text-sm mb-2">Race Time</p>
              <h3 className="text-white text-xl font-bold">
                14:00 PM
              </h3>
            </div>

          </div>

          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">

            <h2 className="text-2xl font-bold text-white mb-6">
              Participants
            </h2>

            <div className="space-y-4">

              {[1, 2, 3, 4, 5].map((horse) => (
                <div
                  key={horse}
                  className="flex items-center justify-between bg-[#0a0a0a] border border-white/5 rounded-lg p-4"
                >
                  <div>
                    <h3 className="text-white font-semibold">
                      Horse #{horse}
                    </h3>

                    <p className="text-gray-400 text-sm">
                      Jockey: Marcus Sterling
                    </p>
                  </div>

                  <div className="text-[#e10600] font-bold">
                    Lane {horse}
                  </div>
                </div>
              ))}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}