export const MANUAL_PAYMENT_METHODS = [
  { value: "BANK_TRANSFER", labelEn: "Bank transfer", labelAr: "تحويل بنكي" },
  { value: "VODAFONE_CASH", labelEn: "Vodafone Cash", labelAr: "فودافون كاش" },
  { value: "INSTAPAY", labelEn: "Instapay", labelAr: "إنستاباي" },
];

export const PAYMENT_INSTRUCTIONS = {
  BANK_TRANSFER: {
    en: "Transfer the amount to the academy bank account, then upload a clear screenshot of the receipt.",
    ar: "حوّل المبلغ إلى الحساب البنكي للأكاديمية ثم ارفع صورة واضحة من الإيصال.",
  },
  VODAFONE_CASH: {
    en: "Send the amount via Vodafone Cash to the academy number, then upload a screenshot of the transfer.",
    ar: "حوّل المبلغ عبر فودافون كاش إلى رقم الأكاديمية ثم ارفع لقطة الشاشة.",
  },
  INSTAPAY: {
    en: "Send the amount via Instapay, then upload a screenshot of the confirmation.",
    ar: "حوّل المبلغ عبر إنستاباي ثم ارفع لقطة تأكيد التحويل.",
  },
};

export function isReceiptPath(value) {
  return typeof value === "string" && (value.startsWith("/uploads/receipts/") || value.includes("/uploads/receipts/"));
}
