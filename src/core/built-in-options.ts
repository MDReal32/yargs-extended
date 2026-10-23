/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { ParsedSpec } from "../types/parsed-spec";

const builtIn = (long: string, short: string): ParsedSpec => ({
  type: "boolean",
  longs: [long],
  shorts: [short],
  array: false,
  choices: [],
  isRequired: false
});

/** Flags every program has (`--help, -h` and `--version, -v`); user options may not reuse them. */
export const BUILT_IN_OPTIONS: ParsedSpec[] = [builtIn("help", "h"), builtIn("version", "v")];
