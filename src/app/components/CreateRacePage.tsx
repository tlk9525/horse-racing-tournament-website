import { useEffect, useState } from 'react';
import { ArrowLeft, Bell, ShieldCheck, Trophy } from 'lucide-react';
import { currentTournament } from '../data/tournamentWorkflow';
import {
  RaceBuilderPairing,
  RaceBuilderReferee,
  createRace,
  getRaceBuilder,
} from '../services/api';

interface CreateRacePageProps {
  onNavigate: (page: string) => void;
}

type EntryDraft = {
  selected: boolean;
  lane: number;
  handicap: number;
};

export default function CreateRacePage({ onNavigate }: CreateRacePageProps) {
  const fieldClass =
    'w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-[#e10600]/70 focus:ring-2 focus:ring-[#e10600]/20';

  const [pairings, setPairings] = useState<RaceBuilderPairing[]>([]);
  const [referees, setReferees] = useState<RaceBuilderReferee[]>([]);
  const [entries, setEntries] = useState<Record<string, EntryDraft>>({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    raceName: '',
    round: 'Qualifier',
    raceDate: '',
    startTime: '',
    venue: currentTournament.location,
    distance: '1400',
    surfaceType: 'Turf',
    raceClass: 'Open',
    totalPrize: '',
    refereeUserId: '',
  });

  useEffect(() => {
    getRaceBuilder()
      .then((data) => {
        setPairings(data.pairings);
        setReferees(data.referees);
        setForm((current) => ({
          ...current,
          refereeUserId: data.referees[0]?.id || '',
        }));
        setEntries(
          data.pairings.reduce<Record<string, EntryDraft>>((acc, pairing, index) => {
            acc[pairing.invitationId] = {
              selected: true,
              lane: index + 1,
              handicap: pairing.jockeyWeight
                ? Math.max(0, Number((58 - pairing.jockeyWeight).toFixed(1)))
                : 0,
            };

            return acc;
          }, {})
        );
      })
      .catch((error) =>
        setMessage(error instanceof Error ? error.message : 'Unable to load race builder')
      )
      .finally(() => setIsLoading(false));
  }, []);

  const selectedEntries = pairings
    .filter((pairing) => entries[pairing.invitationId]?.selected)
    .map((pairing) => ({
      invitationId: pairing.invitationId,
      lane: entries[pairing.invitationId].lane,
      handicap: entries[pairing.invitationId].handicap,
    }));

  const updateEntry = (
    invitationId: string,
    patch: Partial<EntryDraft>
  ) => {
    setEntries((current) => ({
      ...current,
      [invitationId]: {
        ...current[invitationId],
        ...patch,
      },
    }));
  };

  const handleSubmit = () => {
    setMessage('');

    if (
      !form.raceName ||
      !form.raceDate ||
      !form.startTime ||
      !form.venue ||
      !form.distance ||
      !form.refereeUserId
    ) {
      setMessage('Please complete race name, date, start time, venue, distance and referee.');
      return;
    }

    if (selectedEntries.length === 0) {
      setMessage('Select at least one approved Horse-Jockey pairing.');
      return;
    }

    const lanes = selectedEntries.map((entry) => Number(entry.lane));
    const uniqueLanes = new Set(lanes);

    if (uniqueLanes.size !== lanes.length) {
      setMessage('Each selected horse must have a unique race line.');
      return;
    }

    setIsSubmitting(true);

    createRace({
      name: form.raceName,
      round: form.round,
      date: form.raceDate,
      time: form.startTime,
      venue: form.venue,
      distance: form.distance,
      surface: form.surfaceType,
      raceClass: form.raceClass,
      totalPrize: form.totalPrize,
      refereeUserId: form.refereeUserId,
      entries: selectedEntries,
    })
      .then(() => {
        setMessage('Race created. Schedule, race line and handicap notifications were sent to Owner and Jockey.');
        setTimeout(() => onNavigate('admin'), 900);
      })
      .catch((error) =>
        setMessage(error instanceof Error ? error.message : 'Unable to create race')
      )
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => onNavigate('admin')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-8">
            <div>
              <h1 className="text-4xl font-black text-white">
                Create Race
              </h1>

              <p className="text-gray-400 mt-2">
                Build a race from approved Horse-Jockey pairings, assign race lines and publish the schedule.
              </p>
            </div>

            <div className="rounded-2xl border border-[#e10600]/30 bg-[#e10600]/10 px-5 py-3 text-[#ff6b66] font-bold">
              {selectedEntries.length} selected entries
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-[#e10600]/30 bg-[#e10600]/10 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-[#e10600] mt-0.5" />

              <div>
                <div className="text-white font-bold">
                  Race scheduling follows the end-to-end tournament workflow.
                </div>

                <p className="text-gray-400 mt-1">
                  Sau khi tạo race, hệ thống gửi lịch, danh sách ngựa, jockey, line đua và handicap cho Owner, Jockey và Referee.
                </p>
              </div>
            </div>
          </div>

          {message && (
            <div className="mb-6 rounded-xl border border-[#e10600]/30 bg-[#e10600]/10 px-4 py-3 text-[#ff6b66] font-semibold">
              {message}
            </div>
          )}

          <div className="grid lg:grid-cols-[1fr,360px] gap-8">
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-300 mb-2">Race Name</label>
                  <input
                    placeholder="Summer Derby Qualifier R2"
                    className={fieldClass}
                    value={form.raceName}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        raceName: event.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Round</label>
                  <select
                    className={fieldClass}
                    value={form.round}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        round: event.target.value,
                      })
                    }
                  >
                    <option>Qualifier</option>
                    <option>Round 2</option>
                    <option>Semi Final</option>
                    <option>Final</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Race Date</label>
                  <input
                    type="date"
                    className={fieldClass}
                    value={form.raceDate}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        raceDate: event.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Start Time</label>
                  <input
                    type="time"
                    className={fieldClass}
                    value={form.startTime}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        startTime: event.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Venue</label>
                  <input
                    placeholder="Churchill Downs"
                    className={fieldClass}
                    value={form.venue}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        venue: event.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Distance (m)</label>
                  <input
                    type="number"
                    min="1"
                    className={fieldClass}
                    value={form.distance}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        distance: event.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Surface</label>
                  <select
                    className={fieldClass}
                    value={form.surfaceType}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        surfaceType: event.target.value,
                      })
                    }
                  >
                    <option>Turf</option>
                    <option>Dirt</option>
                    <option>Synthetic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Race Class</label>
                  <input
                    placeholder="Open"
                    className={fieldClass}
                    value={form.raceClass}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        raceClass: event.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Total Prize</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="125000"
                    className={fieldClass}
                    value={form.totalPrize}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        totalPrize: event.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Assigned Referee</label>
                  <select
                    className={fieldClass}
                    value={form.refereeUserId}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        refereeUserId: event.target.value,
                      })
                    }
                  >
                    {referees.map((referee) => (
                      <option key={referee.id} value={referee.id}>
                        {referee.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-2xl font-black text-white">
                      Approved Horse-Jockey Entries
                    </h2>

                    <p className="text-gray-400 mt-1">
                      Only pairings accepted by Jockey and approved by Admin appear here.
                    </p>
                  </div>

                  <Trophy className="w-7 h-7 text-[#e10600]" />
                </div>

                {isLoading && (
                  <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4 text-gray-400">
                    Loading approved pairings...
                  </div>
                )}

                {!isLoading && pairings.length === 0 && (
                  <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4 text-gray-400">
                    No approved Horse-Jockey pairings yet. Approve pairings in Admin Control Center first.
                  </div>
                )}

                <div className="space-y-4">
                  {pairings.map((pairing) => {
                    const entry = entries[pairing.invitationId];

                    return (
                      <div
                        key={pairing.invitationId}
                        className={`rounded-2xl border p-4 ${
                          entry?.selected
                            ? 'border-[#e10600]/50 bg-[#e10600]/10'
                            : 'border-white/10 bg-[#0a0a0a]'
                        }`}
                      >
                        <div className="grid lg:grid-cols-[1fr,110px,140px] gap-4 lg:items-center">
                          <label className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={entry?.selected || false}
                              onChange={(event) =>
                                updateEntry(pairing.invitationId, {
                                  selected: event.target.checked,
                                })
                              }
                              className="mt-1 h-5 w-5 accent-[#e10600]"
                            />

                            <span>
                              <span className="block text-white font-bold text-lg">
                                {pairing.horseName} + {pairing.jockeyName}
                              </span>

                              <span className="block text-gray-400 text-sm mt-1">
                                Owner: {pairing.ownerName} | {pairing.breed}, {pairing.age} years | Jockey {pairing.jockeyWeight}kg
                              </span>
                            </span>
                          </label>

                          <div>
                            <label className="block text-gray-400 text-sm mb-1">
                              Race Line
                            </label>

                            <input
                              type="number"
                              min="1"
                              value={entry?.lane || 1}
                              onChange={(event) =>
                                updateEntry(pairing.invitationId, {
                                  lane: Number(event.target.value),
                                })
                              }
                              className={fieldClass}
                            />
                          </div>

                          <div>
                            <label className="block text-gray-400 text-sm mb-1">
                              Handicap (kg)
                            </label>

                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={entry?.handicap || 0}
                              onChange={(event) =>
                                updateEntry(pairing.invitationId, {
                                  handicap: Number(event.target.value),
                                })
                              }
                              className={fieldClass}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-4">
                  <Bell className="w-6 h-6 text-[#e10600]" />

                  <h2 className="text-2xl font-black text-white">
                    Publish Schedule
                  </h2>
                </div>

                <p className="text-gray-400 mb-5">
                  Creating the race sends schedule details to each selected Owner and Jockey.
                </p>

                <div className="space-y-3 text-sm text-gray-300 mb-6">
                  <div className="flex justify-between gap-3">
                    <span>Owner + Jockey confirmations</span>
                    <span className="text-white font-bold">Required</span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span>Pre-race inspection</span>
                    <span className="text-white font-bold">Referee</span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span>Predictions open after</span>
                    <span className="text-white font-bold">Confirmations</span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full px-8 py-4 bg-[#e10600] hover:bg-[#c00500] disabled:opacity-60 rounded-2xl text-white font-bold transition-all"
                >
                  {isSubmitting ? 'Creating Race...' : 'Create Race & Notify'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
