const roomTimers = new Map();

module.exports = {
  clearAll(roomId) {
    const timers = roomTimers.get(roomId);
    if (!timers) return;
    if (timers.songDurationTimer) clearTimeout(timers.songDurationTimer);
    roomTimers.delete(roomId);
  },

  setSongDurationTimer(roomId, timer) {
    const timers = roomTimers.get(roomId) || {};
    timers.songDurationTimer = timer;
    roomTimers.set(roomId, timers);
  }
};
