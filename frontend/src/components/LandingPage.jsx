const languages = [
  { code: 'en', name: 'English', flag: 'US' },
  { code: 'es', name: 'Spanish', flag: 'ES' },
  { code: 'fr', name: 'French', flag: 'FR' },
  { code: 'hi', name: 'Hindi', flag: 'IN' },
  { code: 'zh', name: 'Chinese', flag: 'CN' },
  { code: 'ar', name: 'Arabic', flag: 'SA' },
];

export default function LandingPage({ onStart }) {
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');

  const handleStart = () => {
    if (source && target && source !== target) {
      onStart(source, target);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-white mb-4">Real-Time Speech Translator</h2>
          <p className="text-xl text-white/80">Speak naturally. Be understood instantly.</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">From</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select language</option>
                {languages.map(l => (
                  <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">To</label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select language</option>
                {languages.map(l => (
                  <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={!source || !target || source === target}
            className="mt-8 w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Start Translation
          </button>
        </div>
      </div>
    </div>
  );
}