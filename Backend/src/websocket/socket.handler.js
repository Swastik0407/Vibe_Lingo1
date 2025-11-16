const sessionService = require('../services/session.service');
const sttService = require('../services/stt.service');
const translationService = require('../services/translation.service');
const ttsService = require('../services/tts.service');

const buffers = new Map();
const MAX_BUFFER_MS = 2000;

const toBuffer = (data) => {
  if (Buffer.isBuffer(data)) return data;
  if (typeof data === 'string' && /^data:audio/.test(data)) {
    return Buffer.from(data.split(',')[1], 'base64');
  }
  if (data.audioChunk) {
    return Buffer.isBuffer(data.audioChunk)
      ? data.audioChunk
      : Buffer.from(data.audioChunk, 'base64');
  }
  return null;
};

const emitError = (socket, error, message) => {
  socket.emit('error', { error, message });
};

const handleAudioChunk = async (socket, data) => {
  const sessionId = socket.sessionId;
  if (!sessionId) return emitError(socket, 'no_session', 'Session not joined');

  const session = sessionService.getSession(sessionId);
  if (!session) return emitError(socket, 'invalid_session', 'Session not found');

  const audioBuffer = toBuffer(data);
  if (!audioBuffer || audioBuffer.length === 0) {
    return emitError(socket, 'invalid_audio', 'No valid audio data');
  }

  const sampleRate = data.sampleRate || 16000;
  const chunkDurationMs = (audioBuffer.length / (sampleRate * 2)) * 1000;

  let entry = buffers.get(sessionId);
  if (!entry) {
    entry = { buffer: Buffer.alloc(0), sampleRate, startTime: Date.now() };
    buffers.set(sessionId, entry);
  }

  entry.buffer = Buffer.concat([entry.buffer, audioBuffer]);

  const totalDurationMs = Date.now() - entry.startTime;
  const shouldProcess = data.isFinal || totalDurationMs >= MAX_BUFFER_MS;

  if (!shouldProcess) return;

  const audioToProcess = entry.buffer;
  buffers.delete(sessionId);

  try {
    const { text, isPartial } = await sttService.transcribe(audioToProcess, session.sourceLang, sampleRate);

    const eventName = isPartial ? 'transcript.interim' : 'transcript.final';
    socket.to(sessionId).emit(eventName, { sessionId, text, isFinal: !isPartial });
    if (isPartial) return;

    const translation = await translationService.translate(text, session.sourceLang, session.targetLang);
    socket.to(sessionId).emit('translation.ready', { sessionId, translation });

    const ttsBuffer = await ttsService.synthesize(translation, session.targetLang);
    const ttsBase64 = ttsBuffer.toString('base64');
    socket.to(sessionId).emit('tts.ready', { sessionId, ttsBase64 });
  } catch (err) {
    console.error('Audio processing error:', err);
    emitError(socket, 'processing_failed', 'Failed to process audio');
  }
};

module.exports = { handleAudioChunk };