import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchAuditLogs(params = {}) {
  const response = await client.get(endpoints.admin.auditLogs, { params });
  const payload = response?.data?.data;
  return {
    logs: payload?.logs || payload?.items || (Array.isArray(payload) ? payload : []),
    meta: response?.data?.meta || payload?.pagination || null,
  };
}
