/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { OptionTsType } from "./option-ts-type";

export type DefaultForSpec<TString extends string> =
  OptionTsType<TString> extends (infer U)[] ? readonly U[] : OptionTsType<TString>;
