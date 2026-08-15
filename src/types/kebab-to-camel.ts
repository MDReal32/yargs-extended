/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */

export type KebabToCamel<S extends string> = S extends `${infer H}-${infer T}`
  ? `${H}${Capitalize<KebabToCamel<T>>}`
  : S;
