import { Mockit } from "./mockit";

class Human {
  public walk() {
    return "walking";
  }

  public talk() {
    return "talking";
  }

  public eat() {
    return "eating";
  }
}

describe("Mockit > stub", () => {
  describe("stub", () => {
    it("should be able to stub a class", () => {
      const stub = Mockit.stub(Human);
      expect(stub.walk()).toBeUndefined();
      expect(stub.talk()).toBeUndefined();
      expect(stub.eat()).toBeUndefined();
    });
  });

  describe("stubThatThrows", () => {
    it("should be able to stub a class that throws", () => {
      const stub = Mockit.stubThatThrows(Human, "dudetteError");
      expect(() => stub.walk()).toThrow("dudetteError");
      expect(() => stub.talk()).toThrow("dudetteError");
      expect(() => stub.eat()).toThrow("dudetteError");
    });
  });

  describe("stubThatReturns", () => {
    it("should be able to stub a class that returns", () => {
      const stub = Mockit.stubThatReturns(Human, "dudette");
      expect(stub.walk()).toEqual("dudette");
      expect(stub.talk()).toEqual("dudette");
      expect(stub.eat()).toEqual("dudette");
    });
  });

  describe("stubThatResolves", () => {
    it("should be able to stub a class that resolves", async () => {
      const stub = Mockit.stubThatResolves(Human, "dudette");
      await expect(stub.walk()).resolves.toEqual("dudette");
      await expect(stub.talk()).resolves.toEqual("dudette");
      await expect(stub.eat()).resolves.toEqual("dudette");
    });
  });

  describe("stubThatRejects", () => {
    it("should be able to stub a class that rejects", async () => {
      const stub = Mockit.stubThatRejects(Human, "dudetteError");
      await expect(stub.walk()).rejects.toEqual("dudetteError");
      await expect(stub.talk()).rejects.toEqual("dudetteError");
      await expect(stub.eat()).rejects.toEqual("dudetteError");
    });
  });
});
