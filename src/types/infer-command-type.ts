/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { Command } from "../core";

/**
 * Infers the options type from a `Command` instance.
 *
 * @template TCommand - The command instance type.
 * @example
 * ```ts
 * const cmd = program.command("foo").option("--bar <string>");
 * type Options = inferCommandType<typeof cmd>; // { bar: string }
 * ```
 */
export type inferCommandType<TCommand> =
  TCommand extends Command<infer TOptions> ? TOptions : never;
