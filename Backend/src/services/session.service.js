// backend/src/services/session.service.js

const sessions = new Map();

module.exports = {
  createSession(data) {
    sessions.set(data.sessionId, { ...data, createdAt: new Date() });
    return Promise.resolve();
  },

  getSession(id) {
    return sessions.get(id) || null;
  },

  cleanupSession(id) {
    sessions.delete(id);
  }
};