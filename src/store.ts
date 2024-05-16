import { generateUUID } from "./uuid";

type TStoreOptions = {
  protect?: {
    write?: symbol;
    read?: symbol;
    delete?: symbol;
  };
};

export class Store {
  #name: string;
  #subStores: Store[] = [];
  #options: TStoreOptions;

  constructor(name?: string, options?: TStoreOptions) {
    this.#name = name || generateUUID();
    this.#options = options || {};
  }

  get name(): string {
    return this.#name;
  }

  sub(name: string, options?: TStoreOptions): Store {
    if (!name) {
      return null;
    }
    for (let i = 0; i < this.#subStores.length; i++) {
      if (this.#subStores[i].name === name) {
        return this.#subStores[i];
      }
    }
    const newStore = new Store(name, options);
    this.#subStores.push(newStore);
    return newStore;
  }

  set(key: string, value: unknown, token?: symbol): void {}

  get(key: string, token?: symbol): unknown {
    return null;
  }

  remove(key: string, token?: symbol) {}

  bind(
    keys: string[] | string,
    fn: (values: [unknown, unknown][]) => void,
    token?: symbol,
  ): void {}

  plug(plugin) {}
}
