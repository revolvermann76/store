import { TPlainObject, TPlainObjectProperty } from "./TPlainObject";

/**
 * Schreibt und liest eine Variable unter einem bestimmten Namespace. Ist
 * für <b>value</b> ein Wert gesetzt fungiert die Funktion als Setter, ansonsten
 * als Getter.
 *
 * @param object - Das Objekt in dem sich der Namensraum befindet
 * @param namespace - Eine Zeichenkette, die den Namensraum beschreibt (z.B. de.hshsoft.vois.whatever)
 * @param value - Der zu setzende Wert (optional)
 *
 * @returns der im Objekt gespeicherte Wert
 *
 */
function namespace(
  object: TPlainObject,
  namespace: string,
  value?: TPlainObjectProperty,
): TPlainObjectProperty | null | undefined {
  if (!object || typeof object !== "object") return undefined;

  const parts = namespace.split(".");

  if (typeof value !== "undefined") {
    // Setter
    let current: TPlainObject = object;
    for (const part of parts) {
      if (
        !Object.prototype.hasOwnProperty.call(current, part) ||
        typeof current[part] !== "object"
      ) {
        current[part] = {};
      }
      if (part === parts[parts.length - 1]) {
        current[part] = value;
      }
      current = current[part] as TPlainObject;
    }
  } else {
    // Getter or Remover
    let current: TPlainObject = object;
    for (const part of parts) {
      if (!Object.prototype.hasOwnProperty.call(current, part)) {
        return undefined; // Property not found
      }
      if (part === parts[parts.length - 1]) {
        if (arguments.length === 2) {
          return current[part]; // Getter
        } else {
          delete current[part]; // Remover
        }
      }
      current = current[part] as TPlainObject;
    }
  }
  return undefined;
}

export { namespace };
