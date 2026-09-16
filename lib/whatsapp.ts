// WhatsApp deep links. Direct chat uses wa.me/<number>; plan sharing uses the
// wa.me share picker so the traveler chooses the recipient.

// Colombian mobile in international format without "+": 57 + 10 digits.
export function isValidWhatsappFormat(phone: string): boolean {
  return /^57\d{10}$/.test(phone.replace(/[\s+-]/g, ""));
}

// Mock/demo range used in seed data: 57300XXXXXXX – 57304XXXXXXX.
// These numbers are NOT real — they must be replaced by each provider's number.
export function isDemoNumber(phone: string): boolean {
  const digits = phone.replace(/[\s+-]/g, "");
  return /^5730[0-4]\d{7}$/.test(digits);
}

export function waDirectLink(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function waShareLink(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
