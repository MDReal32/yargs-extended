/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { TokenToTsUnion } from "./token-to-ts-union";

export type TokenToTs<T extends string> = T extends "number"
  ? number
  : T extends "string"
    ? string
    : T extends "boolean"
      ? boolean
      : T extends "path"
        ? string
        : T extends "count"
          ? number // convenience
          : T extends `${string}|${string}`
            ? TokenToTsUnion<T>
            : never;
