import { describe, expect, it } from "vitest";

import { parsePositional } from "./parse-positional";

describe("parsePositional", () => {
  it("should parse required arguments", () => {
    const p = parsePositional("<name>");
    expect(p.name).toBe("name");
    expect(p.isRequired).toBe(true);
    expect(p.array).toBe(false);
  });

  it("should parse optional arguments", () => {
    const p = parsePositional("[name]");
    expect(p.name).toBe("name");
    expect(p.isRequired).toBe(false);
  });

  it("should parse variadic arguments (start)", () => {
    const p = parsePositional("...files");
    expect(p.name).toBe("files");
    expect(p.array).toBe(true);
  });

  // Coverage for array=inner.endsWith("...") logic in type parsing if implicit?
  // Actually the code handles "..." prefix for name.

  it("should parse typed arguments", () => {
    const p = parsePositional("<count: number>");
    expect(p.name).toBe("count");
    expect(p.type).toBe("number");
  });

  it("should parse optional typed arguments", () => {
    const p = parsePositional("[path: string]");
    expect(p.name).toBe("path");
    expect(p.type).toBe("string");
  });

  it("should parse implicit optional with ?", () => {
    const p = parsePositional("name?");
    expect(p.name).toBe("name");
    expect(p.isRequired).toBe(false);
  });

  it("should throw on empty spec", () => {
    expect(() => parsePositional("")).toThrow();
  });

  it("should throw on missing name", () => {
    expect(() => parsePositional("...")).toThrow();
    expect(() => parsePositional("<>")).toThrow();
  });

  it("should throw on unclosed wrapper", () => {
    expect(() => parsePositional("<name")).toThrow();
  });

  it("should throw on invalid name", () => {
    expect(() => parsePositional("<123>")).toThrow();
  });

  it("should throw on unknown type", () => {
    expect(() => parsePositional("<name: unknown>")).toThrow();
  });
});
