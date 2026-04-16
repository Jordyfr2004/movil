type DateFormatOptions = {
  locale?: string;
};

const DEFAULT_LOCALE = "es-EC";

export const formatMenuDate = (isoDate: string, options?: DateFormatOptions) => {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }

  return parsed.toLocaleDateString(options?.locale ?? DEFAULT_LOCALE, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
};

export const formatReservationDate = (
  isoDate: string,
  options?: DateFormatOptions
) => {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }

  return parsed.toLocaleString(options?.locale ?? DEFAULT_LOCALE, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};
