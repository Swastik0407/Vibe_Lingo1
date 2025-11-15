module.exports = {
  async transcribe(buffer, lang, sampleRate) {
    await new Promise(r => setTimeout(r, 500));
    return { text: "Hello, this is a test.", isPartial: false };
  }
};