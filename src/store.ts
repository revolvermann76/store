import { TPlainObjectProperty } from "./TPlainObject";
import { generateUUID } from "./uuid";
import { TVault, vault } from "./vault";

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
  #vault: TVault;

  [key: `$${string}`]: Store;

  constructor(name?: string, options?: TStoreOptions) {
    this.#name = name || generateUUID();
    this.#options = options || {};
    this.#vault = vault();
  }

  get name(): string {
    return this.#name;
  }

  set name(n: string) {
    // do nothing (intentional)
  }

  createSubStore(name: string, options?: TStoreOptions): Store {
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

  subStore(name: string): Store {
    return this.#subStores[name] || null;
  }

  set(key: string, value: TPlainObjectProperty, token?: symbol): void {
    if (
      this.#options.protect &&
      this.#options.protect.write &&
      token !== this.#options.protect.write
    ) {
      throw new Error("set - token not given or wrong");
    }
    this.#vault.set(key, value);
  }

  get(key: string, token?: symbol): unknown {
    if (
      this.#options.protect &&
      this.#options.protect.read &&
      token !== this.#options.protect.read
    ) {
      throw new Error("get - token not given or wrong");
    }
    return this.#vault.get(key);
  }

  remove(key: string, token?: symbol): void {
    if (
      this.#options.protect &&
      this.#options.protect.delete &&
      token !== this.#options.protect.delete
    ) {
      throw new Error("remove - token not given or wrong");
    }
    this.#vault.remove(key);
  }

  bind(
    keys: string[] | string,
    fn: (values: [unknown, unknown][]) => void,
    token?: symbol,
  ): void {}

  plug(plugin) {}
}
