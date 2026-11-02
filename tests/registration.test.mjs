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

import {safeReturnPath} from "../lib/http.mjs";
test("authentication callback rejects external or malformed return targets",()=>{
 for(const target of ["https://outside.invalid","//outside.invalid","/\\outside.invalid","javascript:alert(1)","/\n/outside.invalid",null])assert.equal(safeReturnPath(target),"/admin/tryouts");
 assert.equal(safeReturnPath("/portal?tab=family"),"/portal?tab=family");
 assert.equal(safeReturnPath("/set-password"),"/set-password");
});
