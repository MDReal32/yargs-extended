/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */

type CapitalizeMap = {
  a: "A";
  b: "B";
  c: "C";
  d: "D";
  e: "E";
  f: "F";
  g: "G";
  h: "H";
  i: "I";
  j: "J";
  k: "K";
  l: "L";
  m: "M";
  n: "N";
  o: "O";
  p: "P";
  q: "Q";
  r: "R";
  s: "S";
  t: "T";
  u: "U";
  v: "V";
  w: "W";
  x: "X";
  y: "Y";
  z: "Z";
};

export type CapitalizeAscii<S extends string> = S extends `${infer First}${infer Rest}`
  ? First extends keyof CapitalizeMap
    ? `${CapitalizeMap[First]}${Rest}`
    : S
  : S;
