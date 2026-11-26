export function createWhatsAppUrl(phoneDigits: string, message: string): string {
  const normalizedPhone = phoneDigits.replace(/\D/g, "");
  if (!normalizedPhone) throw new Error("A valid WhatsApp destination number is required.");
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}
