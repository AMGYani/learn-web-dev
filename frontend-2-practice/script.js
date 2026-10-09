function getToday() {
  const now = new Date();
  return {
    day: now.getDate(),
    month: now.getMonth(),
    year: now.getFullYear(),
  };
}

const TODAY = getToday();

const SLOTS_EVEN = [
  { time: "10:00", available: true },
  { time: "11:00", available: false },
  { time: "12:00", available: true },
  { time: "13:00", available: false },
  { time: "14:00", available: true },
  { time: "15:00", available: true },
  { time: "16:00", available: false },
  { time: "17:00", available: true },
];

const SLOTS_ODD = [
  { time: "10:00", available: true },
  { time: "11:00", available: true },
  { time: "12:00", available: true },
  { time: "13:00", available: true },
  { time: "14:00", available: false },
  { time: "15:00", available: true },
  { time: "16:00", available: true },
  { time: "17:00", available: false },
];

function fetchSlotsForDay(day, month, year) {
  const isEven = day % 2 === 0;
  return isEven ? SLOTS_EVEN : SLOTS_ODD;
}

const BOOKING_STATE = {
  currentMonth: TODAY.month,
  currentYear: TODAY.year,
  selectedDay: TODAY.day,
  selectedTime: null,
  slots: [],
};

const MONTHS_NOMINATIVE = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const MONTHS_GENITIVE = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

const DAYS_OF_WEEK = [
  "Воскресенье", "Понедельник", "Вторник", "Среда",
  "Четверг", "Пятница", "Суббота",
];

function compareDates(date1, date2) {
  const d1 = new Date(date1.year, date1.month, date1.day);
  const d2 = new Date(date2.year, date2.month, date2.day);
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
}

function isDateSelectable(day, month, year) {
  return compareDates({ day: day, month: month, year: year }, TODAY) >= 0;
}

function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = offset - 1; i >= 0; i--) {
    cells.push({ day: prevMonthLastDay - i, otherMonth: true });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, otherMonth: false });
  }

  const totalCells = Math.ceil(cells.length / 7) * 7;
  let nextDay = 1;
  while (cells.length < totalCells) {
    cells.push({ day: nextDay, otherMonth: true });
    nextDay++;
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function formatSelection(day, month, year, time) {
  const dateObj = new Date(year, month, day);
  const dayName = DAYS_OF_WEEK[dateObj.getDay()];
  const monthName = MONTHS_GENITIVE[month];
  const timePart = time ? time : "время не выбрано";
  return dayName + ", " + day + " " + monthName + " " + year + " • " + timePart;
}

function renderCalendar() {
  const monthYearEl = document.getElementById("monthYear");
  const grid = document.getElementById("calendarGrid");

  const year = BOOKING_STATE.currentYear;
  const month = BOOKING_STATE.currentMonth;

  monthYearEl.textContent = MONTHS_NOMINATIVE[month] + " " + year;

  const weeks = buildCalendarGrid(year, month);
  let html = "";

  weeks.forEach(function (week) {
    week.forEach(function (cell) {
      let classes = "calendar__day";
      if (cell.otherMonth) classes += " calendar__day--other-month";

      const isToday =
        !cell.otherMonth &&
        cell.day === TODAY.day &&
        month === TODAY.month &&
        year === TODAY.year;
      if (isToday) classes += " calendar__day--today";

      const isSelected =
        !cell.otherMonth &&
        cell.day === BOOKING_STATE.selectedDay &&
        month === BOOKING_STATE.currentMonth &&
        year === BOOKING_STATE.currentYear;
      if (isSelected) classes += " calendar__day--selected";

      const selectable = isDateSelectable(cell.day, month, year);
      const isDisabled = !cell.otherMonth && !selectable;
      if (isDisabled) classes += " calendar__day--disabled";

      html +=
        '<button class="' + classes + '" data-day="' + cell.day +
        '" data-other="' + cell.otherMonth +
        '"' + (isDisabled || cell.otherMonth ? " disabled" : "") + '>' +
        cell.day + "</button>";
    });
  });

  grid.innerHTML = html;

  const dayButtons = grid.querySelectorAll(
    ".calendar__day:not(.calendar__day--other-month):not(.calendar__day--disabled)"
  );
  dayButtons.forEach(function (btn) {
    btn.addEventListener("click", onDayClick);
  });
}

function renderTimeSlots() {
  const grid = document.getElementById("timeGrid");
  const slots = BOOKING_STATE.slots;

  if (!slots || slots.length === 0) {
    grid.innerHTML =
      '<div class="time__empty">В этот день нет доступного времени</div>';
    return;
  }

  let html = "";
  slots.forEach(function (slot) {
    let classes = "time__slot";
    if (!slot.available) classes += " time__slot--busy";
    if (slot.time === BOOKING_STATE.selectedTime && slot.available) {
      classes += " time__slot--selected";
    }
    const busyAttr = slot.available ? "" : " disabled";
    const statusHtml = slot.available
      ? ""
      : '<span class="time__status">Занято</span>';
    html +=
      '<button class="' + classes + '" data-time="' + slot.time + '"' +
      busyAttr + '>' + slot.time + statusHtml + "</button>";
  });

  grid.innerHTML = html;

  const slotButtons = grid.querySelectorAll(
    ".time__slot:not(.time__slot--busy)"
  );
  slotButtons.forEach(function (btn) {
    btn.addEventListener("click", onTimeSlotClick);
  });
}

function updateBottomBar() {
  const valueEl = document.getElementById("selectionValue");
  valueEl.textContent = formatSelection(
    BOOKING_STATE.selectedDay,
    BOOKING_STATE.currentMonth,
    BOOKING_STATE.currentYear,
    BOOKING_STATE.selectedTime
  );
}

function onDayClick(event) {
  const btn = event.currentTarget;
  const day = parseInt(btn.dataset.day);

  BOOKING_STATE.selectedDay = day;
  BOOKING_STATE.selectedTime = null;
  BOOKING_STATE.slots = fetchSlotsForDay(
    day,
    BOOKING_STATE.currentMonth,
    BOOKING_STATE.currentYear
  );

  renderCalendar();
  renderTimeSlots();
  updateBottomBar();
}

function onTimeSlotClick(event) {
  const btn = event.currentTarget;
  BOOKING_STATE.selectedTime = btn.dataset.time;

  renderTimeSlots();
  updateBottomBar();
}

function setupMonthNavigation() {
  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");

  prevBtn.addEventListener("click", function () {
    BOOKING_STATE.currentMonth -= 1;
    if (BOOKING_STATE.currentMonth < 0) {
      BOOKING_STATE.currentMonth = 11;
      BOOKING_STATE.currentYear -= 1;
    }
    BOOKING_STATE.selectedTime = null;
    renderCalendar();
    updateBottomBar();
  });

  nextBtn.addEventListener("click", function () {
    BOOKING_STATE.currentMonth += 1;
    if (BOOKING_STATE.currentMonth > 11) {
      BOOKING_STATE.currentMonth = 0;
      BOOKING_STATE.currentYear += 1;
    }
    BOOKING_STATE.selectedTime = null;
    renderCalendar();
    updateBottomBar();
  });
}

function setupSelectButton() {
  const btn = document.getElementById("selectBtn");
  btn.addEventListener("click", function () {
    if (!BOOKING_STATE.selectedTime) {
      alert("Пожалуйста, выберите время");
      return;
    }
    alert(
      "Вы записаны: " +
        formatSelection(
          BOOKING_STATE.selectedDay,
          BOOKING_STATE.currentMonth,
          BOOKING_STATE.currentYear,
          BOOKING_STATE.selectedTime
        )
    );
  });
}

function init() {
  BOOKING_STATE.currentMonth = TODAY.month;
  BOOKING_STATE.currentYear = TODAY.year;
  BOOKING_STATE.selectedDay = TODAY.day;
  BOOKING_STATE.selectedTime = null;

  BOOKING_STATE.slots = fetchSlotsForDay(
    TODAY.day,
    TODAY.month,
    TODAY.year
  );

  renderCalendar();
  renderTimeSlots();
  updateBottomBar();

  setupMonthNavigation();
  setupSelectButton();
}

document.addEventListener("DOMContentLoaded", init);