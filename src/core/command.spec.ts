import { describe, expect, it } from "vitest";

import { Command } from "./command";

describe("Command", () => {
  it("should create a command instance", () => {
    const cmd = new Command("test");
    expect(cmd.name).toBe("test");
  });

  it("should add aliases", () => {
    const cmd = new Command("test");
    cmd.addAlias("t").addAlias("tst");

    expect(cmd.aliases).toContain("t");
    expect(cmd.aliases).toContain("tst");
  });

  it("should remove aliases", () => {
    const cmd = new Command("test");
    cmd.addAlias("t").removeAlias("t");

    expect(cmd.aliases).not.toContain("t");
  });

  it("should register subcommands", () => {
    const cmd = new Command("parent");
    const sub = cmd.command("child");

    expect(sub.name).toBe("child");
    expect(cmd.commands).toContain(sub);
  });

  it("should throw error on duplicate command registration", () => {
    const cmd = new Command("parent");
    cmd.command("child");

    expect(() => cmd.command("child")).toThrow();
  });

  it("should parse options", () => {
    const cmd = new Command("test");
    cmd.option("--flag", { description: "A flag" });

    // Check internal options array if possible, or verify behavior
    expect(cmd.options.length).toBeGreaterThan(0);
  });

  it("should register positional arguments", () => {
    const cmd = new Command("test");
    cmd.positional("<file>");
    expect(cmd.positionalArgs.length).toBe(1);
    expect(cmd.positionalArgs[0]?.name).toBe("file");
  });

  it("should register validation function", () => {
    const cmd = new Command("test");
    const fn = () => {};
    cmd.validate(fn);
    expect(cmd.validateFn).toBe(fn);
  });

  it("should register action handler", () => {
    const cmd = new Command("test");
    const fn = async () => {};
    cmd.action(fn);
    expect(cmd.handler).toBe(fn);
  });

  it("should register prefetch callback", () => {
    const cmd = new Command("test");
    const fn = async () => {};
    cmd.prefetch(fn);
    expect(cmd.prefetchableCb).toBe(fn);
  });

  it("should throw on option conflict", () => {
    const cmd = new Command("test");
    cmd.option("--foo");
    expect(() => cmd.option("--foo")).toThrow();
  });
});
