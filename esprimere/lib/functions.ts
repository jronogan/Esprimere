export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function isUpcoming(iso: string) {
  return new Date(iso) >= new Date();
}

export function studioInitials(studioName: string) {
  return studioName.charAt(0).toUpperCase();
}

export function userInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
