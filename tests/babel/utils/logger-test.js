import logger from "../../../babel/utils/logger";

/* eslint-disable no-console */
function withMockConsoleLog(body) {
  const mockFn = jest.fn();
  const prevLog = console.log;
  console.log = mockFn;
  body(mockFn);
  console.log = prevLog;
}
/* eslint-enable no-console */

function doesNotLog(fn) {
  return () => {
    withMockConsoleLog(mockFn => {
      logger[fn]("hi");
      expect(mockFn.mock.calls.length).toBe(0);
    });
  };
}

function doesLog(fn) {
  return () => {
    withMockConsoleLog(mockFn => {
      logger[fn]("hi");
      expect(mockFn.mock.calls.length).toBeGreaterThan(0);
    });
  };
}

describe("logger", () => {
  describe("level: off", () => {
    beforeEach(() => {
      logger.setLevel("off");
    });

    it("does not log debug", doesNotLog("debug"));
    it("does not log info", doesNotLog("info"));
    it("does not log warn", doesNotLog("warn"));
  });

  describe("level: debug", () => {
    beforeEach(() => {
      logger.setLevel("debug");
    });

    it("logs debug", doesLog("debug"));
    it("logs info", doesLog("info"));
    it("logs warn", doesLog("warn"));
  });

  describe("level: info", () => {
    beforeEach(() => {
      logger.setLevel("info");
    });

    it("does not log debug", doesNotLog("debug"));
    it("logs info", doesLog("info"));
    it("logs warn", doesLog("warn"));
  });

  describe("level: warn", () => {
    beforeEach(() => {
      logger.setLevel("warn");
    });

    it("does not log debug", doesNotLog("debug"));
    it("does not log info", doesNotLog("info"));
    it("logs warn", doesLog("warn"));
  });

  it("throws when setting invalid level", () => {
    expect(() => logger.setLevel("bad")).toThrow();
  });
});
