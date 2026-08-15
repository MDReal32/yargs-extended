/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */

export type KindToTs<TKind extends string, TArray extends boolean> = TKind extends "string" | "path"
  ? { kind: "string"; ts: TArray extends true ? string[] : string }
  : TKind extends "number" | "count"
    ? { kind: "number"; ts: TArray extends true ? number[] : number }
    : TKind extends "boolean"
      ? { kind: "boolean"; ts: TArray extends true ? boolean[] : boolean }
      : never;
