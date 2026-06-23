import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchPayments(params) {
  const response = await client.get(`${endpoints.admin.financials}/payments`, { params });
  const payload = response?.data?.data;
  return payload?.payments || (Array.isArray(payload) ? payload : []);
}

export async function fetchCoupons(params) {
  const response = await client.get(endpoints.admin.coupons, { params });
  const payload = response?.data?.data;
  return {
    coupons: payload?.coupons || (Array.isArray(payload) ? payload : []),
    meta: payload?.pagination || null,
  };
}

export async function fetchPayouts(params = {}) {
  const response = await client.get(`${endpoints.admin.payouts}`, { params });
  const payload = response?.data?.data;
  if (payload?.payouts) return payload.payouts;
  if (Array.isArray(payload)) return payload;
  return [];
}


export async function processPayout({ id, body }) {
  const response = await client.patch(`${endpoints.admin.payouts}/${id}/process`, body);
  return response?.data?.data;
}

export async function updateAdminPaymentStatus({ id, status }) {
  const response = await client.patch(`${endpoints.admin.financials}/payments/${id}/status`, { status });
  return response?.data?.data;
}

export async function updateInstructorCommission({ instructorId, commissionRate }) {
  const response = await client.patch(endpoints.admin.instructorCommission(instructorId), { commissionRate });
  return response?.data?.data;
}
