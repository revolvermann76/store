import { Store } from "../store";

describe("testing store", () => {
  test("new instance", () => {
    const s = new Store("whatever");
    s.sub("123");
    expect(s.name).toBe("whatever");
  });
});
