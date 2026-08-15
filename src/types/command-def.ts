/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { Promisable } from "type-fest";
import type { ArgumentsCamelCase } from "yargs";

import type { ParsedPositional } from "./parsed-positional";
import type { ParsedSpec } from "./parsed-spec";

export interface CommandDef<TAccum extends object = object, TPrefetchResult = void> {
  name: string;
  aliases: string[];
  describe?: string;
  commands: CommandDef[];
  options: ParsedSpec[];
  positionalArgs: ParsedPositional[];
  prefetchableCb?: (args: TAccum) => Promisable<TPrefetchResult>;
  validateFn?: (args: ArgumentsCamelCase<TAccum>, result: TPrefetchResult) => void;
  handler?: (args: ArgumentsCamelCase<TAccum>, result: TPrefetchResult) => Promisable<void>;
}
