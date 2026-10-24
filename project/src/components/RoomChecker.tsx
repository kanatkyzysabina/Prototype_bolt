import { useMemo, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  DoorClosed,
  Users,
  MapPin,
  Lock,
  CalendarClock,
} from "lucide-react";
import type { Decision } from "@/types";
import { ROOMS, BOOKINGS } from "@/data";
import { checkAvailability, minutesToLabel, overlaps } from "@/lib/availability";

function timeInputToMinutes(value: string): number {
  if (!value) return NaN;
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
  return h * 60 + m;
}

function minutesToTimeInput(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export default function RoomChecker() {
  // Current time rounded to next 5-minute mark
  const initialCurrent = useMemo(() => {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    return Math.ceil(mins / 5) * 5;
  }, []);

  const [roomId, setRoomId] = useState<string>(ROOMS[0].id);
  const [startTime, setStartTime] = useState<string>(
    minutesToTimeInput(initialCurrent + 30),
  );
  const [endTime, setEndTime] = useState<string>(
    minutesToTimeInput(initialCurrent + 60),
  );
  const [currentTime, setCurrentTime] = useState<number>(initialCurrent);
  const [decision, setDecision] = useState<Decision | null>(null);

  const startMin = timeInputToMinutes(startTime);
  const endMin = timeInputToMinutes(endTime);

  const roomBookings = BOOKINGS.filter((b) => b.roomId === roomId);
  const selectedRoom = ROOMS.find((r) => r.id === roomId)!;

  function handleCheck() {
    const result = checkAvailability(
      { start: startMin, end: endMin, roomId, currentTime },
      ROOMS,
      BOOKINGS,
    );
    setDecision(result);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center">
            <CalendarClock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900">
              Smart Campus Room Availability
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Check whether a campus room is free for your time slot.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        {/* Form */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Check a Room
          </h2>

          {/* Room select */}
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Room
          </label>
          <select
            value={roomId}
            onChange={(e) => {
              setRoomId(e.target.value);
              setDecision(null);
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent mb-4"
          >
            {ROOMS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} — {r.building}
                {r.blocked ? " (Blocked)" : ""}
              </option>
            ))}
          </select>

          {/* Time row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Start
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setDecision(null);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                End
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setDecision(null);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Current time */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-5 bg-slate-50 rounded-lg px-3 py-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              Current time: <span className="font-medium text-slate-700">{minutesToLabel(currentTime)}</span>
            </span>
          </div>

          <button
            onClick={handleCheck}
            className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-medium text-sm rounded-lg py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            Check Availability
          </button>

          {/* Decision */}
          {decision && (
            <div
              className={`mt-4 rounded-lg p-4 flex items-start gap-3 transition-all ${
                decision.status === "available"
                  ? "bg-emerald-50 border border-emerald-200"
                  : "bg-rose-50 border border-rose-200"
              }`}
            >
              {decision.status === "available" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={`font-semibold text-sm ${
                    decision.status === "available"
                      ? "text-emerald-800"
                      : "text-rose-800"
                  }`}
                >
                  {decision.status === "available" ? "Available" : "Unavailable"}
                </p>
                {decision.status === "unavailable" && (
                  <p className="text-sm text-rose-700 mt-0.5">{decision.reason}</p>
                )}
                {decision.status === "available" && (
                  <p className="text-sm text-emerald-700 mt-0.5">
                    {selectedRoom.name} is free from {minutesToLabel(startMin)} to {minutesToLabel(endMin)}.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Room detail + bookings */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Room Details
          </h2>

          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{selectedRoom.name}</h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {selectedRoom.building}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {selectedRoom.capacity} seats
                </span>
              </div>
            </div>
            {selectedRoom.blocked ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full">
                <Lock className="w-3 h-3" /> Blocked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                <DoorClosed className="w-3 h-3" /> Active
              </span>
            )}
          </div>

          <h3 className="text-sm font-medium text-slate-700 mb-2">Existing Bookings</h3>
          {roomBookings.length === 0 ? (
            <p className="text-sm text-slate-400">No bookings for this room.</p>
          ) : (
            <ul className="space-y-2">
              {roomBookings.map((b) => {
                const isOverlapping = overlaps({ start: startMin, end: endMin }, b);
                return (
                  <li
                    key={b.id}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm border transition-colors ${
                      isOverlapping
                        ? "border-rose-300 bg-rose-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <span className="font-medium text-slate-700">{b.title}</span>
                    <span className="text-slate-500 tabular-nums">
                      {minutesToLabel(b.start)} – {minutesToLabel(b.end)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          <p className="text-xs text-slate-400 mt-5 leading-relaxed">
            Bookings can be at most 120 minutes. Touching endpoints (e.g. one
            booking ends at 10:00, another starts at 10:00) are allowed.
          </p>
        </section>
      </main>
    </div>
  );
}
