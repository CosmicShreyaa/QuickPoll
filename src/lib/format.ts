import { formatDistanceToNowStrict } from "date-fns";

export function formatRelativeTime(iso: string): string {
  try {
    return `${formatDistanceToNowStrict(new Date(iso))} ago`;
  } catch {
    return "";
  }
}
