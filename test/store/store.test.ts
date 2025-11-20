import { Store } from "../../src/store/store";

describe("Storename", () => {
  test("Ein individueller Name wird übernommen", () => {
    const s = new Store({}, { name: "MeinStore" });
    expect(s.name).toBe("MeinStore");
  });
  test("Storename bekommt automatischen Namen", () => {
    const s1 = new Store();
    expect(s1.name).toBe("Store_0");

    const s2 = new Store();
    expect(s2.name).toBe("Store_1");
  });
});
describe("Preset", () => {
  test("Speichere Object im Store", () => {
    let s = new Store({ hallo: "welt" });
    expect(s.get("hallo")).toBe("welt");
    s = new Store({ hallo: { wilde: "welt" } });
    expect(s.get("hallo")).toStrictEqual({ wilde: "welt" });

    s = new Store({ hallo: ["welt"] });
    expect(s.get("hallo")).toStrictEqual(["welt"]);
  });
  test("Erzeuge Store ohne Preset", () => {
    let s = new Store();
    expect(s.get("")).toStrictEqual({});
  });
  test("Speichere Array im Store", () => {
    let s = new Store([]);
    expect(s.get("")).toStrictEqual([]);

    s = new Store([4]);
    expect(s.get("[0]")).toStrictEqual(4);
  });
  test("Übergebe fehlerhaften Wert als Preset", () => {
    expect(() => {
      new Store(8);
    }).toThrow();
  });
});

describe("Binding", () => {
  test("initialFire", () => {
    // initialFire
    let s = new Store({ hallo: "welt" });
    expect(s.get("hallo")).toBe("welt");
    let called = false;
    s.bind(
      ["hallo"],
      (results) => {
        called = true;
      },
      true
    );
    expect(called).toBe(true);

    let called2 = false;
    s.bind(
      ["hallo"],
      (results) => {
        called2 = true;
      },
      false
    );
    expect(called2).toBe(false);

    let called3 = false;
    s.bind(["hallo"], (results) => {
      called3 = true;
    });
    expect(called3).toBe(true);
  });
  test("Rufe Handler bei Veränderungen im Store", () => {
    let s1 = new Store({ hallo: "welt", ping: "pong" });
    expect(s1.get("hallo")).toBe("welt");
    let result = null;
    s1.bind(
      ["hallo", "ping"],
      (results) => {
        result = results;
      },
      false
    );
    s1.set("hallo", "Marc");
    expect(s1.get("hallo")).toBe("Marc");
    expect(result).toStrictEqual(["Marc", "pong"]);
  });
  test("Pausiere Binding", () => {
    let s2 = new Store({ hallo: "welt", ping: "pong" });
    expect(s2.get("hallo")).toBe("welt");
    let result = null;
    let binding = s2.bind(
      ["hallo", "ping"],
      (results) => {
        result = results;
      },
      false
    );
    binding.paused = true;
    s2.set("hallo", "Marc");
    expect(s2.get("hallo")).toBe("Marc");
    expect(result).toStrictEqual(null);
    binding.paused = false;
    expect(result).toStrictEqual(["Marc", "pong"]);
  });
});

describe("Raise", () => {
  test("Raise und lower", () => {
    let s = new Store({ hallo: "welt" });
    expect(s.get("hallo")).toBe("welt");

    s.raise();
    s.set("hallo", "Marc");
    expect(s.get("hallo")).toBe("Marc");

    s.lower();
    expect(s.get("hallo")).toBe("welt");
  });
  test("Raise und Settle", () => {
    let s = new Store({ hallo: "welt" });
    s.raise();
    s.set("hallo", "Tarek");
    expect(s.get("hallo")).toBe("Tarek");
    expect(s.raised).toBe(1);

    s.settle();
    expect(s.get("hallo")).toBe("Tarek");
    expect(s.raised).toBe(0);
  });
  test("Raise multiple level", () => {
    let s = new Store({ hallo: "welt" });
    s.raise();
    s.raise();
    expect(s.raised).toBe(2);
    s.lower();
    expect(s.raised).toBe(1);
    s.lower();
    expect(s.raised).toBe(0);

    //---
    s.raise();
    s.raise();
    expect(s.raised).toBe(2);
    s.settle();
    expect(s.raised).toBe(1);
    s.settle();
    expect(s.raised).toBe(0);

    //---
    s.raise();
    s.raise();
    s.set("hallo", "Jack");
    expect(s.raised).toBe(2);
    s.settleAll();
    expect(s.raised).toBe(0);
    expect(s.get("hallo")).toBe("Jack");
  });
});
