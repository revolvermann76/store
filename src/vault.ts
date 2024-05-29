import { namespace } from "./namespace";
import { TPlainObject, TPlainObjectProperty } from "./TPlainObject";

type TVault = {
  set: (key: string, value: TPlainObjectProperty) => void;
  get: (key: string) => TPlainObjectProperty;
  remove: (key: string) => void;
};

function vault(preset?: TPlainObject): TVault {
  const store = preset || {};

  return {
    set: (key: string, value: TPlainObjectProperty): void => {
      namespace(store, key, value);
    },
    get: (key: string): TPlainObjectProperty => {
      return namespace(store, key);
    },
    remove: (key: string): void => {
      namespace(store, key, undefined);
    },
  };
}

export { vault, TVault };
