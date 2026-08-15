/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */

export type RequiredFrom<
  TWrapped extends boolean | undefined,
  TNameOptional extends boolean
> = TWrapped extends boolean ? TWrapped : TNameOptional extends true ? false : true;
