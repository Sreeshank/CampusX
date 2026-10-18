export const money = (paise: number | null) =>
  paise === null
    ? "Swap"
    : paise === 0
      ? "Free"
      : new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 2,
        }).format(paise / 100);
export const dateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
export const localDay = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
export const istInput = (date: Date) =>
  new Date(date.getTime() + 330 * 60000).toISOString().slice(0, 16);
export const fromIstInput = (value: string) =>
  new Date(value + ":00+05:30").toISOString();
