import test from "node:test";
import assert from "node:assert/strict";
import { validBirthDate, imageMatchesType } from "../lib/tryout-validation.mjs";
test("DOB rejects future, impossible and malformed dates", () => {
  assert.ok(validBirthDate("2012-02-29", "2026-10-20"));
  for (const value of [
    "2011-02-29",
    "2027-01-01",
    "2000-13-01",
    "",
    "not-a-date",
  ])
    assert.equal(validBirthDate(value, "2026-10-20"), false);
});
test("headshot bytes must agree with claimed image type", () => {
  assert.ok(
    imageMatchesType(new Uint8Array([255, 216, 255, 224]), "image/jpeg"),
  );
  assert.equal(
    imageMatchesType(
      new TextEncoder().encode("<script>hello</script>"),
      "image/jpeg",
    ),
    false,
  );
  assert.ok(
    imageMatchesType(
      new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
      "image/png",
    ),
  );
  assert.equal(
    imageMatchesType(new Uint8Array([255, 216, 255]), "image/png"),
    false,
  );
});
