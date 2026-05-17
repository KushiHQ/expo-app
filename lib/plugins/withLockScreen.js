// Lock screen display is now managed at runtime via the lock-screen-manager
// native module. setShowWhenLocked(true) is called only when on a call screen.
const withLockScreen = (config) => config;

module.exports = withLockScreen;
