import {
  ArrowLeft,
  Trophy,
} from 'lucide-react';
import { useState } from 'react';
import { currentTournament } from '../data/tournamentWorkflow';
import { createHorse } from '../services/api';

interface RegisterHorsePageProps {
  onNavigate: (page: string) => void;
}

export default function RegisterHorsePage({
  onNavigate,
}: RegisterHorsePageProps) {
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [veterinaryCertificateUrl, setVeterinaryCertificateUrl] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = () => {
    setMessage('');
    setIsSubmitting(true);

    createHorse({
      name,
      breed,
      age,
      veterinaryCertificateUrl,
    })
      .then(({ horseCount, maxHorses }) => {
        setMessage(`Horse registration submitted. Owner horse limit: ${horseCount}/${maxHorses}.`);
        setTimeout(() => onNavigate('horses'), 700);
      })
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : 'Unable to register horse');
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12">

      <div className="max-w-4xl mx-auto px-4">

        {/* BACK BUTTON */}
        <button
          onClick={() => onNavigate('horses')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Horses
        </button>

        {/* CARD */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-8">

          {/* HEADER */}
          <div className="flex items-center gap-4 mb-10">

            <div className="w-16 h-16 rounded-2xl bg-[#e10600]/20 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-[#e10600]" />
            </div>

            <div>
              <p className="text-[#e10600] uppercase tracking-[0.2em] text-sm font-bold">
                Horse Owner Registration
              </p>

              <h1 className="text-4xl font-black text-white mt-2">
                Register New Horse
              </h1>

              <p className="text-gray-400 mt-2">
                Tournament: {currentTournament.name} • registration window {currentTournament.registrationWindow}
              </p>
            </div>

          </div>

          {/* FORM */}
          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="block text-gray-300 mb-2">
                Horse Name
              </label>

              <input
                type="text"
                placeholder="Midnight Storm"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full h-12 px-4 bg-[#0a0a0a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#e10600]"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">
                Breed
              </label>

              <input
                type="text"
                placeholder="Thoroughbred"
                value={breed}
                onChange={(event) => setBreed(event.target.value)}
                className="w-full h-12 px-4 bg-[#0a0a0a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#e10600]"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">
                Age
              </label>

              <input
                type="number"
                placeholder="4"
                min="1"
                value={age}
                onChange={(event) => setAge(event.target.value)}
                className="w-full h-12 px-4 bg-[#0a0a0a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#e10600]"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">
                Registration Status
              </label>

              <input
                type="text"
                value="Pending Admin Approval"
                readOnly
                className="w-full h-12 px-4 bg-[#0a0a0a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#e10600]"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">
                Jockey Pairing
              </label>

              <input
                type="text"
                value="Select after horse approval"
                readOnly
                className="w-full h-12 px-4 bg-[#0a0a0a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#e10600]"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">
                Veterinary Certificate URL
              </label>

              <input
                type="text"
                placeholder="https://..."
                value={veterinaryCertificateUrl}
                onChange={(event) => setVeterinaryCertificateUrl(event.target.value)}
                className="w-full h-12 px-4 bg-[#0a0a0a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#e10600]"
              />
            </div>

          </div>

          {message && (
            <div className="mt-6 rounded-xl border border-[#e10600]/30 bg-[#e10600]/10 px-4 py-3 text-[#ff6b66] font-semibold">
              {message}
            </div>
          )}

          {/* BUTTONS */}
          <div className="flex items-center justify-end gap-4 mt-10">

            <button
              onClick={() => onNavigate('horses')}
              className="px-6 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>

            <button
              onClick={submit}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-[#e10600] hover:bg-[#c00500] disabled:opacity-60 text-white font-semibold transition-all"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
