import Immutable, { fromJS } from "immutable";
import { Binding } from "./binding";

/**
 * formt einen Pfad in der Form "lirum.larum.array[7].whatever" um in eine
 * Array-Struktur der Form `["lirum", "larum", "array", "7", "whatever"]`
 * @param path - der eingegebene Pfad
 * @returns Array of string
 */
function parsePath(path: string): string[] {
  return path
    .replace(/\[(\d+)\]/g, ".$1") // [23] → .23
    .split(".") // in Segmente trennen
    .filter(Boolean); // leere entfernen
}

let storeCounter = 0; // Zähler für die automatische Namensvergabe von Stores
export class Store {
  #value: Immutable.Map<string, unknown> | Immutable.List<unknown>; // Speichert das eigentliche Datenmodell des Stores
  #doDebug: boolean = false; // flag - sollen debug-Meldungen ausgegeben werden?
  #raiseStack: (Immutable.Map<string, unknown> | Immutable.List<unknown>)[] =
    []; // Stapel für Storeinstanzen
  #name: string; // Name des Stores
  #bindings: Binding[] = [];

  /**
   * erzeugt einen neuen Store
   * @param initialValue - Optional kann dem Store ein Anfangswert mitgegeben werden. Arrays und einfache Objekte sind hier zulässig
   * @param options - Angabe zusätzlicher Optionen
   * @param options.name - hier kann der Name des Stores gewählt werden. Ohne diese Angabe bekommt der Store einen automatischen Namen
   * @param options.debug - Angabe ob der Store Debug-Meldungen auf die Konsole schreiben soll
   */
  constructor(
    initialValue?: Array<unknown> | object,
    options?: { debug?: boolean; name?: string }
  ) {
    if (
      initialValue !== undefined &&
      initialValue !== null &&
      !Array.isArray(initialValue) &&
      !(initialValue instanceof Object)
    ) {
      throw new Error("Unable to preset Store with " + initialValue);
    }
    initialValue = initialValue || {};
    this.#doDebug = !!options?.debug;
    this.#name = options?.name || "Store_" + storeCounter++;
    this.#value = fromJS(initialValue as object | []);
    this.#debug("Store created");
  }

  #debug(message: string) {
    if (this.#doDebug) {
      console.log(this.#name, message, this.#value.toJS());
    }
  }

  #fireBindings() {
    for (let i = 0; i < this.#bindings.length; i++) {
      this.#bindings[i]?.fire();
    }
  }

  /**
   * Bindet Handler-Funktionen an bestimmte Pfade des Stores. Immer wenn es unter diesen Pfaden Änderungen gibt, werden die Handler informiert
   * @param selectors - Eine Liste von Pfaden im Store auf die gelauscht werden soll
   * @param handler - Ein Handler der bei Bedarf gerufen werden kann
   * @param initialFire - soll der Handler sofort nach der Herstellung des Bindings ein erstes Mal gerufen werden?
   */
  bind(
    selectors: string[],
    handler: (results: unknown[]) => void,
    initialFire = true
  ): Binding {
    const b = new Binding(this, selectors, handler);
    this.#bindings.push(b);
    if (initialFire) {
      b.fire(true);
    }
    return b;
  }

  unbind(binding: Binding) {
    for (let i = this.#bindings.length - 1; i > -1; i--) {
      if (binding === this.#bindings[i]) {
        this.#bindings.splice(i, 1);
      }
    }
  }

  /**
   * Es wird eine komplette Kopie des Stores angelegt. Das Original wird auf einen Stapel gelegt.
   * Sinnvoll zum Beispiel für die Arbeit mit Dialogen. Hier kann man mit dem Store arbeiten und
   * diesen ggf. auf den Originalzustand zurückdrehen (mit `lower()`). Alternativ kann man sich
   * dann (mit `settle()`) entscheiden, dauerhaft bei dem neuen Store zu bleiben.
   */
  raise() {
    const copy = this.#value.map((x) => x);
    this.#raiseStack.push(this.#value);
    this.#value = copy;
    this.#debug("raise() (height=" + this.#raiseStack.length + ")");
  }

  /**
   * macht `raise()` rückgängig
   */
  lower() {
    if (this.#raiseStack.length) {
      this.#value = this.#raiseStack.pop() as Immutable.Map<string, unknown>;
      this.#debug("lower() (height=" + this.#raiseStack.length + ")");
      this.#fireBindings();
    } else {
      this.#debug("lower() unable to lower stack. Stack height was 0");
    }
  }

  /**
   * persistiert dauerhaft die durch `raise()` erzeugte Kopie des Stores
   */
  settle() {
    if (this.#raiseStack.length === 0) {
      this.#debug("settle() unable to settle stack. Stack height was 0");
    } else {
      this.#raiseStack.pop();
      this.#debug(
        "settle() done. Stack height is now " + this.#raiseStack.length
      );
    }
  }

  /**
   * wurde raise() mehrmals gerufen, gibt es mehrere Kopien des ursprünglichen Stores.
   * All diese Kopien werden hiermit verworfen
   */
  settleAll() {
    if (this.#raiseStack.length === 0) {
      this.#debug("settleAll() unable to settle stack. Stack height was 0");
    } else {
      this.#raiseStack = [];
      this.#debug("settleAll() done. Stack height is now 0");
    }
  }

  /**
   * Ein Wert wird unter einem bestimmten Pfad in den Store geschrieben
   * @param selector - der Pfad
   * @param value - der neue Wert
   */
  set(selector: string, value: unknown) {
    this.#debug("Before set(" + selector + ")");
    const newValue = this.#value.setIn(parsePath(selector), fromJS(value));
    this.#value = newValue;
    this.#fireBindings();
    this.#debug("After set(" + selector + ")");
  }

  /**
   * Ein Wert wird mit dem im Store bestehenden Wert gemergt
   * @param selector - der Pfad
   * @param value - der neue Wert
   */
  merge(selector: string, value: unknown) {
    this.#debug("merge(" + selector + ") before");
    const newValue = this.#value.mergeIn(parsePath(selector), value);
    this.#value = newValue;
    this.#fireBindings();
    this.#debug("merge(" + selector + ") after");
  }

  /**
   * Ein Wert wird unter einem bestimmten Pfad im Store gelöscht
   * @param selector - der Pfad
   */
  remove(selector: string) {
    this.#debug("remove(" + selector + ") before");
    const newValue = this.#value.removeIn(parsePath(selector));
    this.#value = newValue;
    this.#fireBindings();
    this.#debug("remove(" + selector + ") after");
  }

  /**
   * Liefert den Wert im Store unter einem gegebenen Pfad als Immutable-Objekt
   * @param selector - der Pfad
   * @returns den Wert
   */
  getImmutable(selector: string): unknown {
    return this.#value.getIn(parsePath(selector));
  }

  /**
   * Liefert den Wert im Store unter einem gegebenen Pfad
   * @param selector - der Pfad
   * @returns den Wert
   */
  get(selector: string): unknown {
    let result = this.getImmutable(selector);
    if (result instanceof Immutable.Map) {
      result = (result as Immutable.Map<string, undefined>).toJS();
    } else if (result instanceof Immutable.List) {
      result = (result as Immutable.List<undefined>).toJS();
    }
    return result;
  }

  /**
   * Liefert den Namen des Stores
   */
  get name(): string {
    return this.#name;
  }

  get debug(): boolean {
    return this.#doDebug;
  }

  set debug(value: boolean) {
    this.#doDebug = value;
  }

  get raised(): number {
    return this.#raiseStack.length;
  }
}
