// Minimal logger utility with timestamp and levels.
// In production, replace with a robust logger (pino/winston) and structure logs.

const ts = () => new Date().toISOString();

export const log = (...args) => console.log(`[LOG ${ts()}]`, ...args);
export const info = (...args) => console.info(`[INFO ${ts()}]`, ...args);
export const warn = (...args) => console.warn(`[WARN ${ts()}]`, ...args);
export const error = (...args) => console.error(`[ERROR ${ts()}]`, ...args);

export default { log, info, warn, error };
