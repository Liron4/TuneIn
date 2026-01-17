const roomTimers = new Map();

module.exports = {
  clearAll(roomId) {
    const timers = roomTimers.get(roomId);
    if (!timers) return;
    if (timers.transitionTimer) clearTimeout(timers.transitionTimer);
    if (timers.songDurationTimer) clearTimeout(timers.songDurationTimer);
    roomTimers.delete(roomId);
  },

  setTransitionTimer(roomId, timer) {
    roomTimers.set(roomId, { transitionTimer: timer });
  },

  setSongDurationTimer(roomId, timer) {
    const timers = roomTimers.get(roomId) || {};
    timers.songDurationTimer = timer;
    roomTimers.set(roomId, timers);
  }
};
