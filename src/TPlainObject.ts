type TPlainObjectProperty =
  | string
  | number
  | boolean
  | { [x: string]: TPlainObjectProperty }
  | Array<TPlainObjectProperty>;

type TPlainObject = { [key: string]: TPlainObjectProperty | TPlainObject };

export { TPlainObject, TPlainObjectProperty };
