/**
 * @velnora-meta
 * type: author
 * author: MDReal
 */
import type { ParsedPositional } from "../types/parsed-positional";
import type { PositionKind } from "../types/position-kind";

export const parsePositional = (raw: string): ParsedPositional => {
  let spec = raw.trim();
  if (!spec) throw new Error("Invalid positional spec (empty).");

  // variadic prefix: ...name
  let array = false;
  if (spec.startsWith("...")) {
    array = true;
    spec = spec.slice(3).trim();
    if (!spec) throw new Error(`Invalid positional spec (missing name) in "${raw}".`);
  }

  // wrappers: <name> required, [name] optional
  let isRequired: boolean | undefined;
  if (spec.startsWith("<") || spec.startsWith("[")) {
    const open = spec[0];
    const close = open === "<" ? ">" : "]";
    if (!spec.endsWith(close)) {
      throw new Error(`Invalid positional spec (unclosed ${open}${close}) in "${raw}".`);
    }

    isRequired = open === "<";
    spec = spec.slice(1, -1).trim();
    if (!spec) throw new Error(`Invalid positional spec (empty inside wrapper) in "${raw}".`);
  }

  // split "name" and optional ": type"
  const idx = spec.indexOf(":");
  const head = (idx === -1 ? spec : spec.slice(0, idx)).trim();
  const tail = (idx === -1 ? "" : spec.slice(idx + 1)).trim();

  // name may end with "?"
  let name = head;
  let nameOptional = false;
  if (name.endsWith("?")) {
    nameOptional = true;
    name = name.slice(0, -1).trim();
  }

  if (!name) throw new Error(`Invalid positional spec (missing name) in "${raw}".`);
  if (!/^[A-Za-z_][A-Za-z0-9_-]*$/.test(name)) {
    throw new Error(`Invalid positional name "${name}" in "${raw}".`);
  }

  // required resolution:
  // - explicit wrapper wins
  // - otherwise "name?" makes it optional
  // - otherwise required by default
  const required = isRequired ?? !nameOptional;

  // type parsing
  let type: PositionKind = "string";

  if (tail) {
    // allow "string[]" / "number[]" etc.
    const typeExpr = tail.replace(/\s+/g, " ").trim();

    if (!array && typeExpr.endsWith("..."))
      throw new Error(
        `Invalid positional type "${typeExpr}" in "${raw}". Use "[]" to denote an variadic type only.`
      );

    if (array && !typeExpr.endsWith("[]"))
      throw new Error(
        `Invalid positional type "${typeExpr}" in "${raw}". Variadic positional types must use "${typeExpr}[]" syntax.`
      );

    const baseTypeExpr = array ? typeExpr.slice(0, -2).trim() : typeExpr;

    switch (baseTypeExpr) {
      case "string":
      case "path":
        type = "string";
        break;

      case "number":
      case "count":
        type = "number";
        break;

      case "boolean":
        type = "boolean";
        break;

      default:
        throw new Error(`Unknown positional type "${typeExpr}" in "${raw}".`);
    }
  }

  return { name, type, array, isRequired: required };
};
