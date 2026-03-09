import test from "node:test";
import assert from "node:assert/strict";
import { parseDateListInput, normalizeDateList } from "@/lib/dates";

test("normalizeDateList removes duplicates and invalid values", () => {
  assert.deepEqual(
    normalizeDateList([
      "2026-03-10",
      "2026-03-09",
      "2026-03-09",
      "invalid",
      "",
    ]),
    ["2026-03-09", "2026-03-10"]
  );
});

test("parseDateListInput accepts commas and newlines", () => {
  assert.deepEqual(
    parseDateListInput("2026-03-11, 2026-03-10\n2026-03-11"),
    ["2026-03-10", "2026-03-11"]
  );
});
