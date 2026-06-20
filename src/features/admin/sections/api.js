import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchAdminSections(params = {}) {
  const response = await client.get(endpoints.admin.sections, { params });
  const payload = response?.data?.data;
  return {
    sections: payload?.sections || (Array.isArray(payload) ? payload : []),
    meta: payload?.pagination || null,
  };
}

export async function createAdminSection(body) {
  const response = await client.post(endpoints.admin.sections, body);
  return response?.data?.data || null;
}

export async function updateAdminSection({ id, body }) {
  const response = await client.patch(`${endpoints.admin.sections}/${id}`, body);
  return response?.data?.data || null;
}

export async function deleteAdminSection(id) {
  const response = await client.delete(`${endpoints.admin.sections}/${id}`);
  return response?.data?.data || null;
}
