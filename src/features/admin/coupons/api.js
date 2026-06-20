import client from "../../../api/client";

function normalizeCoupon(raw) {
  if (!raw || typeof raw !== "object") return raw;
  const courseIds = Array.isArray(raw.courseIds)
    ? raw.courseIds
    : Array.isArray(raw.eligibleCourses)
      ? raw.eligibleCourses.map((ec) => ec.courseId || ec.course?.id).filter(Boolean)
      : [];
  return { ...raw, courseIds };
}

export async function fetchAdminCoupons(params = {}) {
  const response = await client.get("/admin/coupons", { params });
  const payload = response?.data?.data;
  const coupons = payload?.coupons || payload || [];
  return {
    coupons: Array.isArray(coupons) ? coupons.map(normalizeCoupon) : [],
    meta: payload?.pagination || null,
  };
}

export async function createAdminCoupon(body) {
  const response = await client.post("/admin/coupons", body);
  const payload = response?.data?.data;
  return payload ? normalizeCoupon(payload) : null;
}

export async function updateAdminCoupon({ id, body }) {
  const response = await client.patch(`/admin/coupons/${id}`, body);
  const payload = response?.data?.data;
  return payload ? normalizeCoupon(payload) : null;
}

export async function deleteAdminCoupon(id) {
  const response = await client.delete(`/admin/coupons/${id}`);
  return response?.data?.data || null;
}

