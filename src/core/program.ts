/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import yargs, { type Argv, type Options } from "yargs";
import { hideBin } from "yargs/helpers";

import type { CommandDef } from "../types/command-def";
import type { ConfigOptions } from "../types/config-options";
import type { ParsedSpec } from "../types/parsed-spec";
import { parseSpec } from "../utils/parse-spec";
import { Command } from "./command";

/**
 * The main entry point for the CLI application.
 * Wraps `yargs` to provide a fluent, type-safe API for defining commands and options.
 *
 * @example
 * ```ts
 * const program = Program.createProgram()
 *   .name("my-cli")
 *   .description("A cool CLI")
 *   .version("1.0.0");
 *
 * program.command("run", "Run the app").action(() => { ... });
 * await program.parseAsync();
 * ```
 */
export class Program {
  private _argv: Argv<unknown>;
  private options: ParsedSpec[] = []; // root-only options
  private _commands = new Map<string, Command>();

  private constructor(argv: Argv<unknown>) {
    this._argv = argv;
  }

  /**
   * Creates a new Program instance.
   *
   * @param args - Optional arguments array to parse. Defaults to `process.argv`.
   *               Useful for dependency injection during testing.
   */
  static createProgram(args?: string[]) {
    const argv = yargs(args ?? hideBin(process.argv))
      .help()
      .strict()
      .recommendCommands()
      .demandCommand(1, "You must provide a command")
      .help()
      .parserConfiguration({ "strip-aliased": false, "camel-case-expansion": true });
    return new Program(argv);
  }

  /**
   * Sets the CLI script name.
   * @param n - The name of the script (e.g., "velnora").
   */
  name(n: string) {
    this._argv = this._argv.scriptName(n);
    return this;
  }

  /**
   * Sets the CLI description.
   * @param description - A brief description of what the CLI tool does.
   */
  description(description: string) {
    this._argv = this._argv.usage(description);
    return this;
  }

  /**
   * Sets the CLI version.
   * @param v - The version string (e.g., "1.0.0").
   */
  version(v: string) {
    this._argv = this._argv.version(v);
    return this;
  }

  /**
   * Registers a new command or retrieves an existing one.
   *
   * @param name - The name of the command.
   * @param desc - Optional description for the command.
   * @returns The `Command` instance for further configuration.
   */
  command<N extends string>(name: N, desc?: string) {
    const command = this._commands.get(name) ?? new Command(name);
    if (desc) command.description(desc);
    this._commands.set(name, command);
    return command;
  }

  /**
   * Registers a global option available to all commands.
   *
   * @param spec - The option specification (e.g., "--verbose", "--foo <string>").
   * @param config - Additional configuration for the option (description, default value, etc.).
   * @throws Error if the option is already registered.
   */
  option<const TSpec extends `--${string}`>(spec: TSpec, config?: ConfigOptions<TSpec>) {
    const parsed = parseSpec(spec, config);

    // small local utilities (function-scope, not class members)
    const collect = (specs: ParsedSpec[]) => {
      const longs = new Set<string>(),
        shorts = new Set<string>();
      for (const s of specs) {
        for (const l of s.longs) longs.add(l);
        for (const sh of s.shorts) shorts.add(sh);
      }
      return { longs, shorts };
    };

    const conflicts = (cand: ParsedSpec, pool: ParsedSpec[]) => {
      const res = { longs: [] as string[], shorts: [] as string[] };
      const c = collect(pool);
      for (const l of cand.longs) if (c.longs.has(l)) res.longs.push(l);
      for (const sh of cand.shorts) if (c.shorts.has(sh)) res.shorts.push(sh);
      return res;
    };

    const format = (c: { longs: string[]; shorts: string[] }) =>
      [...c.longs.map((l) => `--${l}`), ...c.shorts.map((s) => `-${s}`)].join(", ");

    const cc = conflicts(parsed, this.options);
    if (cc.longs.length || cc.shorts.length) {
      throw new Error(`Option(s) ${format(cc)} already registered for $0.`);
    }
    this.options.push(parsed);

    return this;
  }

  /**
   * Synchronously parses the arguments and executes the corresponding command.
   * @returns The parsed arguments.
   */
  parse() {
    this._build();
    return this._argv.parse();
  }

  /**
   * Asynchronously parses the arguments and executes the corresponding command.
   *
   * @param args - Optional arguments to parse. If provided, overrides the internal arguments.
   * @returns A promise resolving to the parsed arguments.
   */
  async parseAsync(args?: string[]): Promise<unknown> {
    this._build();
    if (args) return this._argv.parseAsync(args);
    return this._argv.parseAsync();
  }

  /**
   * Configures whether the process should exit on error/help or throw an error instead.
   * Useful for testing to prevent the test runner from exiting.
   *
   * @param exitProcess - If false, errors will throw exceptions instead of exiting the process.
   */
  overrideExit(exitProcess = false) {
    this._argv = this._argv.exitProcess(exitProcess);
    return this;
  }

  private _build() {
    this._argv = this._applyOptions(this._argv, this.options);
    this._argv = this._applyCommands(this._argv, Array.from(this._commands.values()));
  }

  private _applyCommands<U>(acc: Argv<U>, commands: CommandDef[]) {
    // Register subcommands
    for (const command of commands) {
      const handler = command.handler ?? (() => {});
      const positionalNames = command.positionalArgs.map((p) =>
        p.isRequired ? `<${p.name}>` : `[${p.name}]`
      );

      acc = acc.command(
        [command.name, ...command.aliases]
          .filter(Boolean)
          .flatMap((cmd) => `${cmd} ${positionalNames.join(" ")}`.trim()),
        command.describe ?? "",
        (yargs) => {
          yargs = this._applyPositionalArguments(yargs, command.positionalArgs);
          yargs = this._applyCommands(yargs, command.commands);
          yargs = this._applyOptions(yargs, command.options);
          return yargs;
        },
        command.handler &&
          (async (args) => {
            const result = await command.prefetchableCb?.(args);
            command.validateFn?.(args, result);
            try {
              return await handler(args, result);
            } catch (err) {
              console.error("Error executing command:", err);
              process.exit(1);
            }
          })
      );
    }

    return acc.strictCommands();
  }

  private _applyOptions<U>(acc: Argv<U>, specs: ParsedSpec[]) {
    // local helpers only; keep logic contained to this method
    const toNumber = (x: unknown, key: string): number => {
      const n = typeof x !== "number" ? Number(x) : x;
      if (Number.isNaN(n)) {
        throw new Error(`Expected a number for --${key}, got ${JSON.stringify(x)}`);
      }
      return n;
    };
    const splitMaybe = (v: unknown): unknown[] => {
      if (Array.isArray(v)) {
        return v.flatMap((item) => splitMaybe(item));
      }
      if (typeof v === "string") {
        return v
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [v];
    };

    for (const s of specs) {
      const key = s.longs[0];
      if (!key) continue;

      const aliasList = [...s.longs.slice(1), ...s.shorts];
      const hasDefault = typeof s.defaultValue !== "undefined";

      const optCfg: Options = {
        type: s.type === "enum" ? "string" : s.type, // "boolean" | "number" | "string" | "array"
        describe: s.description,
        choices: s.type === "enum" ? s.choices : undefined,
        alias: aliasList.length ? aliasList : undefined,
        array: s.array ? true : undefined
      };
      if (hasDefault) optCfg.default = s.defaultValue;

      // Coerce & validate
      if (s.type === "number") {
        optCfg.coerce = (v: unknown) => {
          if (typeof v === "undefined") return v;
          return !s.isRequired
            ? v
            : s.array
              ? splitMaybe(v).map((item) => toNumber(item, key))
              : toNumber(v, key);
        };
      } else if (s.type === "string") {
        optCfg.coerce = (v: unknown) => {
          if (typeof v === "undefined") return v;
          return !s.isRequired
            ? v
            : s.array
              ? splitMaybe(v).map((item) => (typeof item === "string" ? item.trim() : String(item)))
              : typeof v === "string"
                ? v.trim()
                : String(v);
        };
      }
      // boolean: yargs handles true/false and --no- flags

      acc = acc.option(key, optCfg) as Argv<U>;

      // Only demand if value is required and there is no default
      if (s.isRequired && s.type !== "boolean" && !hasDefault) {
        acc = acc.demandOption(key);
      }
    }

    return acc.strictOptions();
  }

  private _applyPositionalArguments<U>(acc: Argv<U>, positionalArgs: CommandDef["positionalArgs"]) {
    for (const p of positionalArgs) {
      const name = p.isRequired ? `<${p.name}>` : `[${p.name}]`;
      acc = acc.positional(name, {
        type: p.type,
        array: p.array,
        demandOption: p.isRequired,
        description: p.description
      });
    }

    return acc;
  }
}
