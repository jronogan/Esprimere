export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function isUpcoming(iso: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(iso) >= today;
}

export function studioInitials(studioName: string) {
  return studioName.charAt(0).toUpperCase();
}

export function userInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function fmt12h(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export function calcDurationMins(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}
