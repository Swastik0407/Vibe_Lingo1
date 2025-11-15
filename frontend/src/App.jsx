import { useState } from 'react';
import LandingPage from './components/LandingPage.jsx';
import TranslatorInterface from './components/TranslatorInterface.jsx';

export default function App() {
  const [selected, setSelected] = useState({ source: null, target: null });

  const handleStart = (source, target) => {
    setSelected({ source, target });
  };

  const handleBack = () => {
    setSelected({ source: null, target: null });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">Vibe Lingo</h1>
        </div>
      </header>

      <main className="flex-1">
        {!selected.source || !selected.target ? (
          <LandingPage onStart={handleStart} />
        ) : (
          <TranslatorInterface
            sourceLang={selected.source}
            targetLang={selected.target}
            onBack={handleBack}
          />
        )}
      </main>
    </div>
  );
}

