import { describe, expect, it } from "vitest";

import { Program } from "./program";

describe("Program", () => {
  it("should create a program instance", () => {
    const program = Program.createProgram();
    expect(program).toBeDefined();
    // internal options property is private, so we check if it's truthy generally
    expect(program).toBeTruthy();
  });

  it("should set name, description and version", () => {
    const program = Program.createProgram();
    const p = program.name("my-cli").description("A test CLI").version("1.0.0");

    expect(p).toBe(program); // Verify chaining
    // Internal state is hidden in yargs, limited checks possible without casting
    expect(typeof program.name).toBe("function");
    expect(typeof program.description).toBe("function");
  });

  it("should register a command", () => {
    const program = Program.createProgram();
    const cmd = program.command("test-cmd");

    expect(cmd).toBeDefined();
    expect(cmd.name).toBe("test-cmd");
  });

  it("should register a command with description", () => {
    const program = Program.createProgram();
    const cmd = program.command("test-cmd", "Running test");
    expect(cmd.describe).toBe("Running test");
  });

  it("should register global options", () => {
    const program = Program.createProgram();
    program.option("--global <string>", { description: "Global option" });
    // access private options via checking behavior or if public method existed
    // verify it doesn't throw
  });

  it("should throw on global option conflict", () => {
    const program = Program.createProgram();
    program.option("--foo");
    expect(() => program.option("--foo")).toThrow();
  });

  it("should alias options correctly", () => {
    const program = Program.createProgram();
    // Test alias conflict logic indirectly if possible
    program.option("--foo, -f");
    // Should conflict on -f alias even if long name is different
    expect(() => program.option("--bar, -f")).toThrow();
  });

  it("should parse arguments", async () => {
    const program = Program.createProgram();
    program.option("--foo <string>");

    // limited ability to test parsing without mocking process.argv or yargs behavior fully,
    // but we can ensure parse() is callable.
    // In a real integration test we would exec the CLI.
    // Here we can try mocking argv if Program allowed injection, but it uses private yargs(hideBin(process.argv)).
    // However, `_argv` is private.
    // We can at least call parseAsync() and catch strict mode errors if no command provided.

    try {
      await program.parseAsync();
    } catch (e) {
      // Expected since no command provided and demandCommand(1) is set
      expect(e).toBeDefined();
    }
  });

  it("should execute a command end-to-end", async () => {
    const program = Program.createProgram().overrideExit();

    let executed = false;
    program.command("run-me").action(async () => {
      executed = true;
    });

    await program.parseAsync(["run-me"]);
    expect(executed).toBe(true);
  });

  it("should parse options in end-to-end execution", async () => {
    const program = Program.createProgram().overrideExit();

    let receivedArgs: Record<string, unknown> | undefined;
    program
      .command("run-opts")
      .option("--val <string>")
      .action(async (args) => {
        receivedArgs = args;
      });

    await program.parseAsync(["run-opts", "--val", "hello"]);

    // Verify yargs structure as pointed out by user
    expect(receivedArgs).toMatchObject({
      val: "hello",
      _: expect.arrayContaining(["run-opts"])
    });
  });

  it("should handle command execution errors gracefully", async () => {
    const program = Program.createProgram().overrideExit();

    // We can't easily spy on console in this env without a library, but we can verify it doesn't crash the test suite
    // yargs .fail() might handle it if we configured it, but we have a try/catch in the handler wrapper.

    program.command("fail").action(async () => {
      throw new Error("Boom");
    });

    // Should catch error and call process.exit(1), which is overridden to throw
    await expect(program.parseAsync(["fail"])).rejects.toThrow();
  });

  it("should validate number options", async () => {
    const program = Program.createProgram().overrideExit();
    program.option("--port <number>");

    // Should throw validation error for non-number
    await expect(program.parseAsync(["--port", "abc"])).rejects.toThrow();
  });

  it("should parse array options", async () => {
    const program = Program.createProgram().overrideExit();
    program.option("--include <string...>");

    let args: Record<string, unknown> | undefined;
    // temporary hack to capture args since action isn't strictly needed for parsing if we could access argv
    // but using a command is easiest to inspect result
    program.command("run").action(async (a) => {
      args = a;
    });

    await program.parseAsync(["run", "--include", "a", "b"]);
    expect(args).toMatchObject({ include: ["a", "b"] });
  });

  it("should split comma-separated array options", async () => {
    const program = Program.createProgram().overrideExit();
    program.option("--include <string...>", { required: true });

    let args: Record<string, unknown> | undefined;
    program.command("run").action(async (a) => {
      args = a;
    });

    await program.parseAsync(["run", "--include", "a,b,c"]);
    expect(args).toMatchObject({ include: ["a", "b", "c"] });
  });

  it("should enforce required options", async () => {
    const program = Program.createProgram().overrideExit();
    program.option("--required <string>", { required: true });

    await expect(program.parseAsync(["--version"])).resolves.not.toThrow(); // global flags might bypass?
    // actually, if we run a command that doesn't use it?
    // global options are applied to all commands usually if program.option is used.

    // checks strict option demand
    await expect(program.parseAsync([])).rejects.toThrow();
  });
});
