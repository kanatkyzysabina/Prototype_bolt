// Runs the Bolt-generated checkAvailability() with the assignment's base data.
// Run from the project root:  npx tsx verification/logic_check.ts
import { checkAvailability } from "../src/lib/availability";

const rooms = [
  { id: "open", name: "Open room", building: "B", capacity: 10, blocked: false },
  { id: "shut", name: "Blocked room", building: "B", capacity: 10, blocked: true },
];
const frozenBookings = Object.freeze([
  Object.freeze({ id: "b1", roomId: "open", title: "Existing", start: 600, end: 660 }),
]) as any;
const multi = Object.freeze([
  Object.freeze({ id: "m1", roomId: "open", title: "A", start: 100, end: 200 }),
  Object.freeze({ id: "m2", roomId: "open", title: "B", start: 600, end: 660 }),
]) as any;

type C = [string, string, number, number, number, string, any, "available" | "unavailable"];
const NOW = 540;
const cases: C[] = [
  ["AC4", "Touching", 660, 720, NOW, "open", frozenBookings, "available"],
  ["AC4", "Overlap", 630, 690, NOW, "open", frozenBookings, "unavailable"],
  ["AC3", "Blocked", 660, 720, NOW, "shut", frozenBookings, "unavailable"],
  ["AC2", "Exactly 120 min", 720, 840, NOW, "open", frozenBookings, "available"],
  ["AC2", "121 min", 720, 841, NOW, "open", frozenBookings, "unavailable"],
  ["AC1", "Starts now", 540, 570, NOW, "open", frozenBookings, "unavailable"],
  ["AC1", "Reversed times", 700, 600, NOW, "open", frozenBookings, "unavailable"],
  ["AC1", "Start == end", 600, 600, NOW, "open", frozenBookings, "unavailable"],
  ["AC1", "End 1440 (day bound)", 1320, 1440, 1000, "open", frozenBookings, "available"],
  ["AC1", "End 1441 (day bound)", 1321, 1441, 1000, "open", frozenBookings, "unavailable"],
  ["AC1", "Negative start", -10, 50, NOW, "open", frozenBookings, "unavailable"],
  ["AC1", "Start now+1", 541, 571, NOW, "open", frozenBookings, "available"],
  ["AC4", "Multiple: overlaps 2nd", 650, 700, 0, "open", multi, "unavailable"],
  ["AC4", "Multiple: gap", 300, 360, 0, "open", multi, "available"],
  ["AC4", "Touching at start of booking", 540 + 1, 600, NOW, "open", frozenBookings, "available"],
  ["AC1", "NaN start (empty field)", NaN, 700, NOW, "open", frozenBookings, "unavailable"],
];
let fail = 0;
for (const [ac, name, s, e, now, room, bk, exp] of cases) {
  let got = "";
  try {
    got = checkAvailability({ start: s, end: e, roomId: room, currentTime: now }, rooms, bk).status;
  } catch (err) { got = "THROW: " + (err as Error).message; }
  const ok = got === exp; if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${ac} | ${name} | ${s}-${e} now=${now} room=${room} | expected ${exp} | actual ${got}`);
}
console.log(`\nbookings unchanged (frozen, no throw): ${JSON.stringify(frozenBookings)}`);
console.log(fail === 0 ? `ALL ${cases.length} CASES PASSED` : `${fail} FAILED`);
process.exit(fail ? 1 : 0);
