export async function fetchToday() {
  const response = await fetch('/api/booking/today');
  if (!response.ok) {
    throw new Error('Не удалось загрузить данные о сегодняшнем дне');
  }
  return response.json();
}

export async function fetchSlots(date) {
  const url = `/api/slots?day=${date.day}&month=${date.month}&year=${date.year}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Не удалось загрузить слоты на этот день');
  }
  return response.json();
}