import { describe, expect, it } from "vitest";

import { parseSpec } from "./parse-spec";

describe("parseSpec", () => {
  it("should parse simple long flags", () => {
    const spec = parseSpec("--foo");
    expect(spec.longs).toEqual(["foo"]);
    expect(spec.shorts).toEqual([]);
    expect(spec.type).toBe("boolean");
    expect(spec.isRequired).toBe(false);
  });

  it("should parse flags with aliases", () => {
    const spec = parseSpec("--foo, -f");
    expect(spec.longs).toEqual(["foo"]);
    expect(spec.shorts).toEqual(["f"]);
    expect(spec.type).toBe("boolean");
  });

  it("should parse required string arguments", () => {
    const spec = parseSpec("--name <string>");
    expect(spec.longs).toEqual(["name"]);
    expect(spec.type).toBe("string");
    expect(spec.isRequired).toBe(false);
  });

  it("should parse optional string arguments", () => {
    const spec = parseSpec("--name [string]");
    expect(spec.longs).toEqual(["name"]);
    expect(spec.type).toBe("string");
    expect(spec.isRequired).toBe(false);
  });

  it("should parse number arguments", () => {
    const spec = parseSpec("--port <number>");
    expect(spec.type).toBe("number");
  });

  it("should handle description from config", () => {
    const spec = parseSpec("--foo", { description: "My flag" });
    expect(spec.description).toBe("My flag");
  });

  it("should handle default values", () => {
    const spec = parseSpec("--foo", { default: true });
    expect(spec.defaultValue).toBe(true);
  });

  it("should parse array types", () => {
    const spec = parseSpec("--files <string...>");
    expect(spec.type).toBe("string");
    expect(spec.array).toBe(true);
  });

  it("should parse enum choices", () => {
    const spec = parseSpec("--env <dev|prod>");

    expect(spec.type).toBe("enum");
    expect(spec.choices).toEqual(["dev", "prod"]);
  });

  it("should parse multiple long aliases", () => {
    const spec = parseSpec("--dry-run, --preview, -d");

    expect(spec.longs).toEqual(["dry-run", "preview"]);
    expect(spec.shorts).toEqual(["d"]);
  });

  it("should mark options required from config, not token wrapper", () => {
    expect(parseSpec("--name <string>").isRequired).toBe(false);
    expect(parseSpec("--name <string>", { required: true }).isRequired).toBe(true);
  });

  it("should reject missing long options", () => {
    expect(() => parseSpec("-f")).toThrow("missing --long");
  });

  it("should reject aliases with conflicting value tokens", () => {
    expect(() => parseSpec("--count <number>, --name <string>")).toThrow(
      "Conflicting value tokens"
    );
  });
});
