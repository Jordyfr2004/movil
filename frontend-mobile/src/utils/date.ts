type DateFormatOptions = {
  locale?: string;
  timeZone?: string;
};

const DEFAULT_LOCALE = "es-EC";
const DEFAULT_TIMEZONE = "America/Guayaquil";
const ECUADOR_UTC_OFFSET_MINUTES = -5 * 60;

const MONTHS_ES_SHORT = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

const WEEKDAYS_ES_SHORT = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

const supportsTimeZoneOption = (() => {
  try {
    // En algunos runtimes RN/Expo, Intl existe pero no soporta timeZone.
    new Intl.DateTimeFormat(DEFAULT_LOCALE, {
      timeZone: DEFAULT_TIMEZONE,
      hour: "2-digit",
    }).format(new Date());
    return true;
  } catch {
    return false;
  }
})();

function toEcuadorDateFromIso(isoDate: string) {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  // Convertimos a "hora Ecuador" usando offset fijo UTC-5.
  // Luego formateamos usando getters UTC para evitar depender del timezone del dispositivo.
  const shifted = new Date(parsed.getTime() + ECUADOR_UTC_OFFSET_MINUTES * 60 * 1000);
  return shifted;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export const formatMenuDate = (isoDate: string, options?: DateFormatOptions) => {
  if (supportsTimeZoneOption) {
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) {
      return isoDate;
    }

    return parsed.toLocaleDateString(options?.locale ?? DEFAULT_LOCALE, {
      timeZone: options?.timeZone ?? DEFAULT_TIMEZONE,
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  }

  const shifted = toEcuadorDateFromIso(isoDate);
  if (!shifted) return isoDate;

  const weekday = WEEKDAYS_ES_SHORT[shifted.getUTCDay()] ?? "";
  const day = pad2(shifted.getUTCDate());
  const month = MONTHS_ES_SHORT[shifted.getUTCMonth()] ?? "";

  return `${weekday} ${day} ${month}`.trim();
};

export const formatReservationDate = (
  isoDate: string,
  options?: DateFormatOptions
) => {
  if (supportsTimeZoneOption) {
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) {
      return isoDate;
    }

    return parsed.toLocaleString(options?.locale ?? DEFAULT_LOCALE, {
      timeZone: options?.timeZone ?? DEFAULT_TIMEZONE,
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const shifted = toEcuadorDateFromIso(isoDate);
  if (!shifted) return isoDate;

  const day = pad2(shifted.getUTCDate());
  const month = MONTHS_ES_SHORT[shifted.getUTCMonth()] ?? "";
  const hour = pad2(shifted.getUTCHours());
  const minute = pad2(shifted.getUTCMinutes());

  return `${day} ${month}, ${hour}:${minute}`.trim();
};
