/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { Merge, Promisable } from "type-fest";
import type { ArgumentsCamelCase } from "yargs";

import type { CommandDef } from "../types/command-def";
import type { ConfigOptions } from "../types/config-options";
import type { OptRecordFromPositional } from "../types/opt-record-from-positional";
import type { OptRecordFromSpec } from "../types/opt-record-from-spec";
import type { ParsedPositional } from "../types/parsed-positional";
import type { ParsedSpec } from "../types/parsed-spec";
import { parsePositional } from "../utils/parse-positional";
import { parseSpec } from "../utils/parse-spec";

/**
 * Represents a CLI command.
 * Supports subcommands, options, positional arguments, validation, and action handlers.
 *
 * @template TAccum - Accumulator type for parsed arguments (inferred from options/positionals).
 * @template TPrefetchResult - Type of the result from the prefetch callback.
 */
export class Command<TAccum extends object = object, TPrefetchResult = void>
  implements CommandDef<TAccum, TPrefetchResult>
{
  private readonly registeredCommands = new Set<string>();

  declare describe: string | undefined;

  declare prefetchableCb?: CommandDef<TAccum, TPrefetchResult>["prefetchableCb"];
  declare validateFn?: CommandDef<TAccum, TPrefetchResult>["validateFn"];
  declare handler: CommandDef<TAccum, TPrefetchResult>["handler"];

  options: ParsedSpec[] = [];
  commands: CommandDef[] = [];
  positionalArgs: ParsedPositional[] = [];
  aliases: string[] = [];

  constructor(readonly name: string) {}

  /**
   * Registers a subcommand.
   *
   * @param command - The name of the subcommand.
   * @returns A new `Command` instance for the subcommand.
   * @throws Error if the subcommand is already registered.
   */
  command(command: string) {
    if (this.registeredCommands.has(command))
      throw new Error(`Command "${command}" already registered. Parent command: "${this.name}".`);
    const cmd = new Command(command);
    this.commands.push(cmd);
    this.registeredCommands.add(command);
    return cmd;
  }

  /**
   * Adds an alias to the command.
   * @param alias - The alias string (e.g. "co" for "checkout").
   */
  addAlias(alias: string) {
    if (this.aliases.includes(alias)) return this;
    this.aliases.push(alias);
    return this;
  }

  /**
   * Removes a previously added alias.
   * @param alias - The alias to remove.
   */
  removeAlias(alias: string) {
    this.aliases = this.aliases.filter((a) => a !== alias);
    return this;
  }

  /**
   * Sets the description for the command.
   * @param desc - A brief description displayed in help output.
   */
  description(desc: string) {
    this.describe = desc;
    return this;
  }

  // Overload: config-object form
  option<const TSpec extends `--${string}`>(
    spec: TSpec,
    config?: ConfigOptions<TSpec>
  ): Command<Merge<TAccum, OptRecordFromSpec<TSpec>>>;

  /**
   * Registers an option for this command.
   *
   * @param spec - The option specification (e.g., "--force", "--output <path>").
   * @param config - Configuration options (description, default, required).
   * @returns The `Command` instance with updated argument types.
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
      throw new Error(`Option(s) ${format(cc)} already registered. Command: "${this.name}".`);
    }
    this.options.push(parsed);

    return this as unknown as Command<Merge<TAccum, OptRecordFromSpec<TSpec>>>;
  }

  /**
   * Registers a positional argument for this command.
   *
   * @param positional - The positional argument spec (e.g., "<name>", "[dir]").
   * @param config - Configuration options (description, default, required).
   * @returns The `Command` instance with updated argument types.
   */
  positional<TPositional extends string>(
    positional: TPositional,
    config?: Pick<ConfigOptions<TPositional>, "description">
  ) {
    const positionalArg = parsePositional(positional);
    positionalArg.description = config?.description;
    this.positionalArgs.push(positionalArg);
    return this as unknown as Command<Merge<TAccum, OptRecordFromPositional<TPositional>>>;
  }

  /**
   * Registers a callback to run before the main action.
   * Useful for data prefetching or setup tasks.
   *
   * @param cb - The callback function.
   */
  prefetch<const TResult>(cb: (args: TAccum) => Promisable<TResult>) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    this.prefetchableCb = cb;
    return this as unknown as Command<TAccum, TResult>;
  }

  /**
   * Registers a validation function to run after prefetching but before the action.
   *
   * @param fn - The validation function.
   */
  validate(fn: (args: ArgumentsCamelCase<TAccum>, result: TPrefetchResult) => void) {
    this.validateFn = fn;
    return this;
  }

  /**
   * Sets the main action handler for the command.
   *
   * @param handler - The async function to execute when the command is called.
   */
  action(handler: CommandDef<TAccum, TPrefetchResult>["handler"]) {
    this.handler = handler;
  }
}
