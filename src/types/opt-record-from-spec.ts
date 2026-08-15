/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { AllLongFlags } from "./all-long-flags";
import type { AllShortFlags } from "./all-short-flags";
import type { KebabToCamel } from "./kebab-to-camel";
import type { OptionTsType } from "./option-ts-type";

/**
 * Final exported type:
 * - THasDefault = true  → required (non-optional)
 * - THasDefault = false → required depends on TIsRequired
 */
export type OptRecordFromSpec<TString extends string> = {
  [TKey in AllLongFlags<TString> as KebabToCamel<TKey>]: OptionTsType<TString>;
} & {
  [TKey in AllShortFlags<TString>]: OptionTsType<TString>;
};
