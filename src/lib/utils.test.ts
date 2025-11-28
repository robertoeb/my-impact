import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("merges class names", () => {
    const result = cn("class1", "class2");
    expect(result).toBe("class1 class2");
  });

  it("handles conditional classes", () => {
    const result = cn("base", true && "included", false && "excluded");
    expect(result).toBe("base included");
  });

  it("handles undefined values", () => {
    const result = cn("base", undefined, "other");
    expect(result).toBe("base other");
  });

  it("handles null values", () => {
    const result = cn("base", null, "other");
    expect(result).toBe("base other");
  });

  it("merges Tailwind classes correctly", () => {
    const result = cn("p-4", "p-2");
    expect(result).toBe("p-2");
  });

  it("handles conflicting Tailwind classes", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("handles empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("handles array of classes", () => {
    const result = cn(["class1", "class2"]);
    expect(result).toBe("class1 class2");
  });

  it("handles object syntax", () => {
    const result = cn({
      active: true,
      disabled: false,
    });
    expect(result).toBe("active");
  });

  it("handles mixed input types", () => {
    const result = cn(
      "base",
      ["array-class"],
      { "object-class": true },
      undefined,
      "final"
    );
    expect(result).toBe("base array-class object-class final");
  });
});

