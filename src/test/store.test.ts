import { Store } from "../store";

describe("testing store", () => {
  test("new instance", () => {
    const s = new Store("whatever");
    const storeName = "storeName";
    s.createSubStore(storeName);
    expect(s[storeName] instanceof Store).toBe(true);
  });
});
