import { generateUUID } from "./uuid";

export class Store {
  #name: string;
  #subStores: Store[] = [];

  constructor(name?: string) {
    this.#name = name || generateUUID();
  }

  get name(): string {
    return this.#name;
  }

  sub(name: string): Store {
    if (!name) {
      return null;
    }
    for (let i = 0; i < this.#subStores.length; i++) {
      if (this.#subStores[i].name === name) {
        return this.#subStores[i];
      }
    }
    const newStore = new Store(name);
    this.#subStores.push(newStore);
    return newStore;
  }

  set(key: string, value: unknown, token?: symbol): void {}

  get(key: string, token?: symbol): unknown {
    return null;
  }

  remove(key: string, token?: symbol) {}

  bind(
    key: string,
    fn: (newValue: unknown, oldValue: unknown) => void,
    token?: symbol,
  ): void {}

  plug(plugin) {}
}
