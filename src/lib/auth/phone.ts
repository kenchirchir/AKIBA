const rwandaMobile = /^7[2389]\d{7}$/;

export function normalizeRwandaPhone(input: string) {
  const digits = input.replace(/\D/g, "");
  const national = digits.startsWith("250")
    ? digits.slice(3)
    : digits.startsWith("0")
      ? digits.slice(1)
      : digits;

  return rwandaMobile.test(national) ? `+250${national}` : null;
}

export function nationalPart(phone: string) {
  return phone.replace(/\D/g, "").replace(/^250/, "");
}

export function formatRwandaPhone(phone: string) {
  const national = nationalPart(phone);
  return `+250 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
}

export function localRwandaPhone(phone: string) {
  const national = nationalPart(phone);
  return `0${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
}
