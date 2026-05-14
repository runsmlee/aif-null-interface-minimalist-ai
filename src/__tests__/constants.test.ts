import { describe, it, expect } from "vitest";
import { APP_NAME, APP_VERSION, STORAGE_KEY, EXPORT_PREFIX } from "../constants";

describe("constants", () => {
  it("exports a non-empty app name", () => {
    expect(APP_NAME).toBe("Null Interface");
    expect(APP_NAME.length).toBeGreaterThan(0);
  });

  it("exports a version string starting with 'v'", () => {
    expect(APP_VERSION).toMatch(/^v\d+\.\d+$/);
  });

  it("exports a non-empty storage key", () => {
    expect(STORAGE_KEY).toBe("null-interface-messages");
    expect(STORAGE_KEY.length).toBeGreaterThan(0);
  });

  it("exports a non-empty export prefix", () => {
    expect(EXPORT_PREFIX).toBe("null-interface");
    expect(EXPORT_PREFIX.length).toBeGreaterThan(0);
  });
});
