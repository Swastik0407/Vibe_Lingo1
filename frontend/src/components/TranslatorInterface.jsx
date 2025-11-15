import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const API_URL = 'http://localhost:3001';

export default function TranslatorInterface({ sourceLang, targetLang, onBack }) {
  const [session, setSession] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('Connecting...');

  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    startSession();
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const startSession = async () => {
    try {
      const res = await fetch(`${API_URL}/api/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceLang, targetLang })
      });
      const data = await res.json();
      setSession(data);
      connectSocket(data);
    } catch (err) {
      setStatus('Failed to start session');
    }
  };

  const connectSocket = (sessionData) => {
    const socket = io(API_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('session.join', {
        token: sessionData.token,
        sessionId: sessionData.sessionId
      });
    });

    socket.on('session.joined', () => setStatus('Ready to speak'));
    socket.on('transcript.final', (data) => setTranscript(data.text));
    socket.on('translation.ready', (data) => setTranslation(data.translation));
    socket.on('tts.ready', playAudio);
    socket.on('error', (err) => setStatus(`Error: ${err.message}`));
  };

  const playAudio = (data) => {
    const audio = new Audio(`data:audio/webm;base64,${data.ttsBase64}`);
    audio.play().catch(() => {});
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];

    recorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      blob.arrayBuffer().then(buffer => {
        socketRef.current.emit('audio.chunk', {
          sessionId: session.sessionId,
          audioChunk: Buffer.from(buffer),
          sampleRate: 48000,
          isFinal: true
        });
      });
      stream.getTracks().forEach(t => t.stop());
    };

    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 text-white/80 hover:text-white flex items-center gap-2"
        >
          Back to languages
        </button>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl space-y-8">
          <div className="text-center">
            <p className="text-sm text-white/60">Status</p>
            <p className="text-lg font-medium text-white">{status}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-black/20 rounded-xl p-6">
              <p className="text-sm text-white/60 mb-2">You said ({sourceLang})</p>
              <p className="text-xl text-white font-medium">{transcript || 'Speak now...'}</p>
            </div>

            <div className="bg-black/20 rounded-xl p-6">
              <p className="text-sm text-white/60 mb-2">Translation ({targetLang})</p>
              <p className="text-xl text-white font-medium">{translation || 'Waiting...'}</p>
            </div>
          </div>

          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`w-full py-6 rounded-full font-bold text-xl transition-all ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
            }`}
          >
            {isRecording ? 'Release to Send' : 'Hold to Speak'}
          </button>
        </div>
      </div>
    </div>
  );
}