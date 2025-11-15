module.exports = {
  async translate(text, source, target) {
    await new Promise(r => setTimeout(r, 300));
    const map = { en: 'Hello', es: 'Hola', fr: 'Bonjour', hi: 'नमस्ते' };
    return map[target] || text;
  }
};