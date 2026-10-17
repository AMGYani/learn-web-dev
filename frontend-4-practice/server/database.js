function getToday() {
  const now = new Date();
  return {
    day: now.getDate(),
    month: now.getMonth(),
    year: now.getFullYear(),
  };
}

export const TODAY = getToday();

export const SLOTS_EVEN = [
  { time: "10:00", available: true },
  { time: "11:00", available: false },
  { time: "12:00", available: true },
  { time: "13:00", available: false },
  { time: "14:00", available: true },
  { time: "15:00", available: true },
  { time: "16:00", available: false },
  { time: "17:00", available: true },
];

export const SLOTS_ODD = [
  { time: "10:00", available: true },
  { time: "11:00", available: true },
  { time: "12:00", available: true },
  { time: "13:00", available: true },
  { time: "14:00", available: false },
  { time: "15:00", available: true },
  { time: "16:00", available: true },
  { time: "17:00", available: false },
];

export function getSlots(day, month, year) {
  const isEven = day % 2 === 0;
  const slots = isEven ? SLOTS_EVEN : SLOTS_ODD;
  return {
    date: { day, month, year },
    slots: slots,
  };
}