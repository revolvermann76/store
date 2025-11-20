import Immutable from "immutable";
import type { Store } from "./store";
let idCounter: number = 0;
export class Binding {
  #store: Store;
  #paused: boolean = false;
  #id: number;
  #selectors: string[];
  #oldValues: { [key: string]: unknown } = {};
  #handler: (results: unknown[]) => void;

  constructor(
    store: Store,
    selectors: string[],
    handler: (results: unknown[]) => void
  ) {
    this.#id = idCounter++;
    this.#handler = handler;
    this.#store = store;
    this.#selectors = selectors;
    this.#gatherOldValues();
  }
  #gatherOldValues() {
    for (let i = 0; i < this.#selectors.length; i++) {
      this.#oldValues[this.#selectors[i] as string] = this.#store.getImmutable(
        this.#selectors[i] as string
      );
    }
  }
  #debug(txt: string) {
    if (this.#store.debug) {
      console.log(txt);
    }
  }
  fire(force?: boolean) {
    if (this.#paused) {
      this.#debug("fire() no action, because this binding is paused");
      return;
    }
    for (let i = 0; i < this.#selectors.length; i++) {
      const selector = this.#selectors[i] as string;
      const oldValue = this.#oldValues[selector];
      const newValue = this.#store.getImmutable(selector);
      if (!Immutable.is(oldValue, newValue) || force) {
        this.#gatherOldValues();
        const result = [];
        for (let j = 0; j < this.#selectors.length; j++) {
          result.push(this.#store.get(this.#selectors[j] as string));
        }
        this.#handler(result);
        return;
      }
    }
    this.#debug("fire() no action, because nothing changed");
  }

  get paused(): boolean {
    return this.#paused;
  }

  set paused(value: boolean) {
    this.#paused = value;
    this.fire();
  }

  get id() {
    return this.#id;
  }

  unbind() {
    this.#store.unbind(this);
  }
}
