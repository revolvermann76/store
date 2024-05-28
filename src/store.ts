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
  #subStores: { [key: string]: Store } = {};
  #options: TStoreOptions;
  [key: `$${string}`]: Store;

  constructor(name?: string, options?: TStoreOptions) {
    this.#name = name || generateUUID();
    this.#options = options || {};
  }

  get name(): string {
    return this.#name;
  }

  set name(n: string) {
    // do nothing (intentional)
  }

  createSubStore(name: string, options?: TStoreOptions): Store {
    if (!name) {
      throw new Error("createSubStore() storename not given");
    }

    if (this.#subStores[name]) {
      throw new Error("createSubStore() store already exists");
    }

    const newStore = new Store(name, options);
    this.#subStores[name] = newStore;

    Object.defineProperty(this, `$${name}`, {
      /**
       * returns a sub-store
       * @param name - then name of the store
       * @returns
       */
      get: (): Store => {
        return this.#subStores[name] || null;
      },
      set: () => {
        // do nothing (intentional)
      },
      enumerable: true,
      configurable: true,
    });

    return newStore;
  }

  set(key: string, value: unknown, token?: symbol): void {}

  get(key: string, token?: symbol): unknown {
    return null;
  }

  remove(key: string, token?: symbol): void {}

  bind(
    keys: string[] | string,
    fn: (values: [unknown, unknown][]) => void,
    token?: symbol,
  ): void {}

  plug(plugin) {}
}
