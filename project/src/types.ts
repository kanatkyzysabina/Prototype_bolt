export interface Booking {
  id: string;
  roomId: string;
  title: string;
  start: number; // minutes since midnight
  end: number;   // minutes since midnight
}

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
}

export type Decision =
  | { status: "available" }
  | { status: "unavailable"; reason: string };

export interface IntervalInput {
  start: number;
  end: number;
  roomId: string;
  currentTime: number; // minutes since midnight
}
