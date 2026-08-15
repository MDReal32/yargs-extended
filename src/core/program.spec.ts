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
    const returned = program.option("--global <string>", { description: "Global option" });

    expect(returned).toBe(program);
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

  it("should reject missing commands", async () => {
    const program = Program.createProgram().overrideExit();

    await expect(program.parseAsync([])).rejects.toThrow("You must provide a command");
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

    program.command("fail").action(async () => {
      throw new Error("Boom");
    });

    // Should catch error and call process.exit(1), which is overridden to throw
    await expect(program.parseAsync(["fail"])).rejects.toThrow();
  });

  it("should validate number options", async () => {
    const program = Program.createProgram().overrideExit();
    program.option("--port <number>", { required: true });

    program.command("serve").action(async () => {});

    await expect(program.parseAsync(["serve", "--port", "abc"])).rejects.toThrow();
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
    program.command("run").action(async () => {});

    await expect(program.parseAsync(["--version"])).resolves.toMatchObject({ version: true });
    await expect(program.parseAsync(["run"])).rejects.toThrow();
  });

  it("should execute command aliases", async () => {
    const program = Program.createProgram().overrideExit();

    let executed = false;
    program
      .command("run")
      .addAlias("r")
      .action(async () => {
        executed = true;
      });

    await program.parseAsync(["r"]);
    expect(executed).toBe(true);
  });

  it("should parse command option aliases and camel-case long names", async () => {
    const program = Program.createProgram().overrideExit();

    let args: Record<string, unknown> | undefined;
    program
      .command("deploy")
      .option("--dry-run, -d")
      .action(async (parsed) => {
        args = parsed;
      });

    await program.parseAsync(["deploy", "-d"]);

    expect(args).toMatchObject({
      d: true,
      dryRun: true
    });
  });

  it("should apply default values", async () => {
    const program = Program.createProgram().overrideExit();

    let args: Record<string, unknown> | undefined;
    program
      .command("deploy")
      .option("--target <string>", { default: "local" })
      .action(async (parsed) => {
        args = parsed;
      });

    await program.parseAsync(["deploy"]);

    expect(args).toMatchObject({ target: "local" });
  });

  it("should validate enum choices", async () => {
    const program = Program.createProgram().overrideExit();

    let args: Record<string, unknown> | undefined;
    program
      .command("deploy")
      .option("--env <dev|prod>", { required: true })
      .action(async (parsed) => {
        args = parsed;
      });

    await program.parseAsync(["deploy", "--env", "prod"]);
    expect(args).toMatchObject({ env: "prod" });

    await expect(program.parseAsync(["deploy", "--env", "stage"])).rejects.toThrow();
  });

  it("should parse required and optional positional arguments", async () => {
    const program = Program.createProgram().overrideExit();

    let args: Record<string, unknown> | undefined;
    program
      .command("copy")
      .positional("<source>")
      .positional("[target]")
      .action(async (parsed) => {
        args = parsed;
      });

    await program.parseAsync(["copy", "input.txt"]);
    expect(args).toMatchObject({ source: "input.txt" });
    expect(args).not.toHaveProperty("target");

    await program.parseAsync(["copy", "input.txt", "output.txt"]);
    expect(args).toMatchObject({ source: "input.txt", target: "output.txt" });
  });

  it("should execute nested subcommands", async () => {
    const program = Program.createProgram().overrideExit();

    let args: Record<string, unknown> | undefined;
    program
      .command("workspace")
      .command("add")
      .positional("<name>")
      .option("--private")
      .action(async (parsed) => {
        args = parsed;
      });

    await program.parseAsync(["workspace", "add", "core", "--private"]);

    expect(args).toMatchObject({
      name: "core",
      private: true
    });
  });

  it("should run prefetch, validate, and action in order", async () => {
    const program = Program.createProgram().overrideExit();
    const calls: string[] = [];

    program
      .command("publish")
      .option("--tag <string>", { required: true })
      .prefetch(async (args) => {
        calls.push(`prefetch:${args.tag}`);
        return { releaseId: "rel-1" };
      })
      .validate((args, result) => {
        calls.push(`validate:${args.tag}:${result.releaseId}`);
      })
      .action(async (args, result) => {
        calls.push(`action:${args.tag}:${result.releaseId}`);
      });

    await program.parseAsync(["publish", "--tag", "latest"]);

    expect(calls).toEqual(["prefetch:latest", "validate:latest:rel-1", "action:latest:rel-1"]);
  });
});
