const OFF = "off";
const DEBUG = "debug";
const INFO = "info";
const WARN = "warn";

const PRIORITY_MAP = {
  debug: 10,
  info: 20,
  warn: 30,
  off: 40,
};

class Logger {
  constructor() {
    this._level = OFF;
  }

  setLevel(level) {
    if (!Object.prototype.hasOwnProperty.call(PRIORITY_MAP, level)) {
      throw new Error(
        `Invalid logLevel ${level}. Expected one of: ${Object.keys(
          PRIORITY_MAP
        ).join(", ")}`
      );
    }
    this._level = level;
  }

  debug(msg) {
    this._doLog(DEBUG, msg);
  }

  info(msg) {
    this._doLog(INFO, msg);
  }

  warn(msg) {
    this._doLog(WARN, msg);
  }

  _doLog(level, msg) {
    if (PRIORITY_MAP[level] < PRIORITY_MAP[this._level]) {
      return;
    }
    // eslint-disable-next-line no-console
    console.log(`${level}/reflective-bind: ${msg}`);
  }
}

module.exports = new Logger();
