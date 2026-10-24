import type { Booking, Room } from "@/types";

export const ROOMS: Room[] = [
  { id: "r1", name: "Lincoln 101", building: "Lincoln Hall",   capacity: 40, blocked: false },
  { id: "r2", name: "Tesla Lab B",  building: "Innovation Wing", capacity: 25, blocked: true  },
  { id: "r3", name: "Curie 220",    building: "Science Block",   capacity: 60, blocked: false },
  { id: "r4", name: "Da Vinci 305", building: "Arts Center",     capacity: 30, blocked: false },
  { id: "r5", name: "Newton 110",   building: "Physics Block",   capacity: 50, blocked: false },
];

export const BOOKINGS: Booking[] = [
  { id: "b1", roomId: "r1", title: "Intro to Algorithms", start: 540,  end: 630  }, // 9:00 – 10:30
  { id: "b2", roomId: "r1", title: "Faculty Sync",        start: 720,  end: 780  }, // 12:00 – 13:00
  { id: "b3", roomId: "r3", title: "Organic Chem Lab",    start: 600,  end: 720  }, // 10:00 – 12:00
  { id: "b4", roomId: "r3", title: "Guest Lecture",       start: 900,  end: 1020 }, // 15:00 – 17:00
  { id: "b5", roomId: "r4", title: "Painting Workshop",   start: 840,  end: 960  }, // 14:00 – 16:00
  { id: "b6", roomId: "r5", title: "Robotics Club",       start: 1080, end: 1140 }, // 18:00 – 19:00
];
