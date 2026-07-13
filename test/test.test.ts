import { describe, expect, it } from "bun:test";

const returnOne = () => 1;

describe("test", () => {
  it("should test", () => {
    const value = returnOne();
    expect(value).toBe(1);
  });
});
