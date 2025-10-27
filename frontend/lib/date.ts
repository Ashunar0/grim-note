import { format } from "date-fns";

export function formatDateTime(value: string, formatPattern = "yyyy/MM/dd HH:mm") {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return format(date, formatPattern);
}
