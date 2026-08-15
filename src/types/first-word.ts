/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */

export type FirstWord<S extends string> = S extends `${infer A} ${string}` ? A : S;
