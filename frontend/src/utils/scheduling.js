export const BUSINESS_HOURS = {
  openHour: 8,
  closeHour: 18,
};

export const SCHEDULING_HINT = 'Horário comercial: das 08:00 às 18:00.';

export function toDateTimeLocalValue(date) {
  const d = new Date(date);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

export function getMinSchedulingDateTime() {
  return toDateTimeLocalValue(new Date());
}

export function validateSchedulingDateTime(value) {
  if (!value) {
    return 'Por favor, selecione uma data para o agendamento.';
  }

  const selected = new Date(value);
  const now = new Date();

  if (Number.isNaN(selected.getTime())) {
    return 'Data ou horário inválido.';
  }

  if (selected <= now) {
    return 'O agendamento não pode ser no passado.';
  }

  const totalMinutes = selected.getHours() * 60 + selected.getMinutes();
  const openMinutes = BUSINESS_HOURS.openHour * 60;
  const closeMinutes = BUSINESS_HOURS.closeHour * 60;

  if (totalMinutes < openMinutes || totalMinutes > closeMinutes) {
    return `Horário fora do expediente. Agendamentos das ${String(BUSINESS_HOURS.openHour).padStart(2, '0')}:00 às ${String(BUSINESS_HOURS.closeHour).padStart(2, '0')}:00.`;
  }

  return null;
}
