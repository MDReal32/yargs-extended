/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { TokenBase } from "./token-base";
import type { TokenToTs } from "./token-to-ts";
import type { ValueToken } from "./value-token";

export type IsOptional<TString extends string> = TString extends `${string}[${string}]${string}`
  ? true
  : false;
export type IsVariadic<S extends string> = ValueToken<S> extends `${string}...` ? true : false;

export type OptionTsType<S extends string> =
  ValueToken<S> extends never
    ? boolean
    : IsVariadic<S> extends true
      ? TokenToTs<TokenBase<S>>[]
      : IsOptional<S> extends true
        ? TokenToTs<TokenBase<S>> | undefined
        : TokenToTs<TokenBase<S>>;
