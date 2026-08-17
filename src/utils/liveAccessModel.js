export function deriveLiveAccessModel(session) {
  if (session?.isFreeForAll) return "PUBLIC_FREE";
  if (Number(session?.price ?? 0) <= 0) return "TARGETED_FREE";
  return "PAID";
}

export function payloadFromAccessModel(accessModel, { price, selectedLevels }) {
  const years = (selectedLevels || []).filter(Boolean);
  if (accessModel === "PUBLIC_FREE") {
    return { isFreeForAll: true, price: 0, targetLevels: [] };
  }
  if (accessModel === "TARGETED_FREE") {
    return {
      isFreeForAll: false,
      price: 0,
      targetLevels: years.filter((level) => level !== "GENERAL"),
    };
  }
  return { isFreeForAll: false, price: Number(price || 0), targetLevels: years };
}
