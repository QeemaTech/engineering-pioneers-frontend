export function applyCouponDiscount(originalPrice, coupon) {
  const base = Number(originalPrice) || 0;
  if (!coupon || base <= 0) return base;
  const value = Number(coupon.discountValue) || 0;
  if (coupon.discountType === "PERCENTAGE") {
    return Math.max(0, Math.round(base - (base * value) / 100));
  }
  return Math.max(0, Math.round(base - value));
}

export function couponDiscountLabel(coupon, isRtl) {
  if (!coupon) return "";
  const value = Number(coupon.discountValue) || 0;
  if (coupon.discountType === "PERCENTAGE") {
    return isRtl ? `${value}٪` : `${value}%`;
  }
  return isRtl ? `${Math.round(value)} جنيه` : `${Math.round(value)} EGP`;
}
