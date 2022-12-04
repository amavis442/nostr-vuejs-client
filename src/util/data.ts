export function getTime(t: number) {
  return new Date(t * 1000).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
}
