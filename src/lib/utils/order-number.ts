// Display helper only. Production order numbers must be generated atomically
// by the database to guarantee uniqueness under concurrent checkouts.
export function formatOrderNumber(sequence: number): string {
  return `KSM-${String(sequence).padStart(6, "0")}`;
}
