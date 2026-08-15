/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { NameOptional } from "./name-optional";
import type { PositionKind } from "./position-kind";
import type { RequiredFrom } from "./required-from";
import type { SplitNameType } from "./split-name-type";
import type { Trim } from "./trim";
import type { TypeFromTail } from "./type-from-tail";
import type { Variadic } from "./variadic";
import type { Wrapper } from "./wrapper";

export type ParsePositionalSpec<TRaw extends string> =
  Variadic<Trim<TRaw>> extends infer V extends { array: boolean; rest: string }
    ? Wrapper<V["rest"]> extends infer W extends {
        wrappedRequired: boolean | undefined;
        rest: string;
      }
      ? SplitNameType<W["rest"]> extends infer S extends { head: string; tail: string }
        ? NameOptional<S["head"]> extends infer N extends { name: string; nameOptional: boolean }
          ? TypeFromTail<S["tail"], V["array"]> extends infer T extends {
              kind: PositionKind;
              ts: unknown;
            }
            ? {
                name: N["name"];
                type: T["kind"];
                ts: T["ts"];
                array: V["array"];
                isRequired: RequiredFrom<W["wrappedRequired"], N["nameOptional"]>;
                choices: [];
              }
            : never
          : never
        : never
      : never
    : never;
