import { useState, useEffect } from "react";
import { fetchToday, fetchSlots } from "./api.js";

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

function isDateSelectable(day, month, year, today) {
  return compareDates({ day, month, year }, today) >= 0;
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
  if (day === null || month === null || year === null) return "—";
  const dateObj = new Date(year, month, day);
  const dayName = DAYS_OF_WEEK[dateObj.getDay()];
  const monthName = MONTHS_GENITIVE[month];
  const timePart = time ? time : "время не выбрано";
  return `${dayName}, ${day} ${monthName} ${year} • ${timePart}`;
}

function Header() {
  return (
    <header className="header">
      <div className="logo">YANTOP</div>
      <nav className="nav">
        <a href="#" className="nav__link">Услуги</a>
        <a href="#" className="nav__link">Команда</a>
        <a href="#" className="nav__link">Отзывы</a>
        <a href="#" className="nav__link">Контакты</a>
      </nav>
    </header>
  );
}

function Stepper({ steps, activeIndex }) {
  return (
    <div className="stepper-wrapper">
      <div className="stepper">
        {steps.map((_, index) => (
          <div key={index} className="stepper__item">
            <div className={"stepper__step" + (index === activeIndex ? " stepper__step--active" : "")}>
              {index + 1}
            </div>
            {index < steps.length - 1 && <div className="stepper__line" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__col">
          <h3 className="footer__heading">YANTOP</h3>
          <a href="#" className="footer__link">СТАТЬ БАРБЕРОМ</a>
        </div>
        <div className="footer__col">
          <h3 className="footer__heading">КОНТАКТЫ</h3>
          <div className="footer__contact"><span>ул. Садовая, 15, Москва</span></div>
          <div className="footer__contact"><span>+7 (495) 123-45-67</span></div>
        </div>
        <div className="footer__col">
          <h3 className="footer__heading">РЕЖИМ РАБОТЫ</h3>
          <p className="footer__text">Пн-Пт: 9:00 - 21:00</p>
          <p className="footer__text">Сб-Вс: 10:00 - 19:00</p>
        </div>
      </div>
      <div className="footer__bottom">
        <p className="footer__copy">© 2026. Все права защищены.</p>
        <a href="#" className="footer__link">Политика конфиденциальности</a>
      </div>
    </footer>
  );
}

function CalendarHeader({ month, year, onPrev, onNext }) {
  return (
    <div className="calendar__header">
      <h2 className="calendar__month">{MONTHS_NOMINATIVE[month]} {year}</h2>
      <div className="calendar__controls">
        <button className="calendar__btn" onClick={onPrev}>&lt;</button>
        <button className="calendar__btn" onClick={onNext}>&gt;</button>
      </div>
    </div>
  );
}

function CalendarGrid({ year, month, today, selectedDay, onDayClick }) {
  const weeks = buildCalendarGrid(year, month);
  return (
    <>
      <div className="calendar__weekdays">
        <span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span>
      </div>
      <div className="calendar__grid">
        {weeks.map((week, weekIndex) =>
          week.map((cell, dayIndex) => {
            const isToday = !cell.otherMonth && cell.day === today.day && month === today.month && year === today.year;
            const isSelected = !cell.otherMonth && cell.day === selectedDay;
            const isDisabled = !cell.otherMonth && !isDateSelectable(cell.day, month, year, today);

            const classes = ["calendar__day"];
            if (cell.otherMonth) classes.push("calendar__day--other-month");
            if (isToday) classes.push("calendar__day--today");
            if (isSelected) classes.push("calendar__day--selected");
            if (isDisabled) classes.push("calendar__day--disabled");

            return (
              <button
                key={`${weekIndex}-${dayIndex}`}
                className={classes.join(" ")}
                disabled={cell.otherMonth || isDisabled}
                onClick={() => !cell.otherMonth && !isDisabled && onDayClick(cell.day)}
              >
                {cell.day}
              </button>
            );
          })
        )}
      </div>
    </>
  );
}

export default function App() {
  const [today, setToday] = useState(null);
  const [isTodayLoading, setIsTodayLoading] = useState(true);
  const [todayError, setTodayError] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const [slots, setSlots] = useState([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(null);

  useEffect(() => {
    let ignore = false;
    setIsTodayLoading(true);
    setTodayError(null);

    fetchToday()
      .then((data) => {
        if (!ignore) {
          setToday(data);
          setCurrentMonth(data.month);
          setCurrentYear(data.year);
          setSelectedDay(data.day);
        }
      })
      .catch((err) => {
        if (!ignore) setTodayError(err.message);
      })
      .finally(() => {
        if (!ignore) setIsTodayLoading(false);
      });

    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    if (selectedDay === null || currentMonth === null || currentYear === null) return;

    let ignore = false;
    setIsSlotsLoading(true);
    setSlotsError(null);

    fetchSlots({ day: selectedDay, month: currentMonth, year: currentYear })
      .then((data) => {
        if (!ignore) {
          const isActual = data.date.day === selectedDay && 
                           data.date.month === currentMonth && 
                           data.date.year === currentYear;
          
          if (isActual) {
            setSlots(data.slots);
          }
        }
      })
      .catch((err) => {
        if (!ignore) setSlotsError(err.message);
      })
      .finally(() => {
        if (!ignore) setIsSlotsLoading(false);
      });

    return () => { ignore = true; };
  }, [selectedDay, currentMonth, currentYear]);

  function handleDayClick(day) {
    setSelectedDay(day);
    setSelectedTime(null);
  }

  function handleSlotClick(time) {
    setSelectedTime(time);
  }

  function handlePrevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedTime(null);
  }

  function handleNextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedTime(null);
  }

  function handleSelect() {
    if (!selectedTime) {
      alert("Пожалуйста, выберите время");
      return;
    }
    alert("Вы записаны: " + formatSelection(selectedDay, currentMonth, currentYear, selectedTime));
  }

  if (isTodayLoading) {
    return (
      <div className="booking-page">
        <Header />
        <Stepper steps={[1, 2, 3, 4, 5]} activeIndex={2} />
        <main className="main">
          <div className="status-message">Загрузка данных...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (todayError) {
    return (
      <div className="booking-page">
        <Header />
        <Stepper steps={[1, 2, 3, 4, 5]} activeIndex={2} />
        <main className="main">
          <div className="status-message status-message--error">
            Ошибка: {todayError}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="booking-page">
      <Header />
      <Stepper steps={[1, 2, 3, 4, 5]} activeIndex={2} />

      <main className="main">
        <h1 className="main__title">ВЫБОР ДАТЫ</h1>

        <div className="content-layout">
          <section className="calendar">
            <CalendarHeader
              month={currentMonth}
              year={currentYear}
              onPrev={handlePrevMonth}
              onNext={handleNextMonth}
            />
            <CalendarGrid
              year={currentYear}
              month={currentMonth}
              today={today}
              selectedDay={selectedDay}
              onDayClick={handleDayClick}
            />
          </section>

          <section className="time">
            <h2 className="time__title">Доступное время</h2>
            
            {isSlotsLoading ? (
              <div className="time__loading">Загрузка слотов...</div>
            ) : slotsError ? (
              <div className="time__error">Ошибка: {slotsError}</div>
            ) : slots.length === 0 ? (
              <div className="time__empty">В этот день нет доступного времени</div>
            ) : (
              <div className="time__grid">
                {slots.map((slot) => {
                  const classes = ["time__slot"];
                  if (!slot.available) classes.push("time__slot--busy");
                  if (slot.available && slot.time === selectedTime) classes.push("time__slot--selected");

                  return (
                    <button
                      key={slot.time}
                      className={classes.join(" ")}
                      disabled={!slot.available}
                      onClick={() => slot.available && handleSlotClick(slot.time)}
                    >
                      {slot.time}
                      {!slot.available && <span className="time__status">Занято</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="bottom-bar">
          <div className="bottom-bar__info">
            <span className="bottom-bar__label">Выбранная дата и время:</span>
            <span className="bottom-bar__value">
              {formatSelection(selectedDay, currentMonth, currentYear, selectedTime)}
            </span>
          </div>
          <button className="btn-select" onClick={handleSelect}>ВЫБРАТЬ</button>
        </div>
      </main>

      <Footer />
    </div>
  );
}