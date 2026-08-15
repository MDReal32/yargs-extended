/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { ParsePositionalSpec } from "./parse-positional-spec";

export type OptRecordFromPositional<TSpec extends string> =
  ParsePositionalSpec<TSpec> extends infer P extends {
    name: string;
    ts: unknown;
    isRequired: boolean;
  }
    ? P["isRequired"] extends true
      ? { [K in P["name"]]: P["ts"] }
      : { [K in P["name"]]?: P["ts"] }
    : never;
