import { Store } from "./store";

describe("testing store", () => {
  test("new instance", () => {
    const s = new Store("whatever");
    expect(s instanceof Store).toBe(true);
  });

  test("create subStore", () => {
    const s = new Store("whatever");
    s.createSubStore("hallo");
    expect(s["$hallo"] instanceof Store).toBe(true);
  });
});
