const { test } = require("node:test");
const assert = require("node:assert/strict");
const reason = require("./bookingAvailability");
const now = Date.parse("2026-10-31T13:00:00Z");
const valid = { status: "scheduled", startTime: "2026-10-31T21:00:00+07:00", movieId: { status: "now_showing" }, roomId: { status: "active" } };
test("future scheduled/opened shows accept bookings", () => {
  for (const status of ["scheduled", "opened"]) assert.equal(reason({ ...valid, status }, now), null);
});
test("closed and cancelled shows reject bookings even before start", () => {
  for (const status of ["closed", "cancelled"]) assert.ok(reason({ ...valid, status }, now));
});
test("started, expired and invalid dates reject bookings", () => {
  for (const startTime of ["2026-10-31T20:00:00+07:00", "2026-10-31T19:00:00+07:00", "invalid"]) assert.ok(reason({ ...valid, startTime }, now));
});
test("ended movies and unavailable rooms reject bookings", () => {
  assert.ok(reason({ ...valid, movieId: { status: "ended" } }, now));
  assert.ok(reason({ ...valid, roomId: { status: "maintenance" } }, now));
  assert.ok(reason({ ...valid, movieId: null }, now));
});
