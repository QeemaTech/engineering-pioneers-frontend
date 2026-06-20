import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchAdminRoles() {
  const response = await client.get(endpoints.admin.roles);
  const payload = response?.data?.data;
  return payload?.roles || (Array.isArray(payload) ? payload : []);
}

export async function fetchAdminRole(id) {
  const roles = await fetchAdminRoles();
  return roles.find((r) => r.id === id) || null;
}

export async function fetchAdminPermissions() {
  const response = await client.get(`${endpoints.admin.roles}/permissions`);
  const payload = response?.data?.data;
  return payload?.permissions || payload || [];
}

export async function createAdminRole(body) {
  const response = await client.post(endpoints.admin.roles, body);
  return response?.data?.data || null;
}

export async function updateAdminRole({ id, body }) {
  const response = await client.patch(`${endpoints.admin.roles}/${id}`, body);
  return response?.data?.data || null;
}

export async function deleteAdminRole(id) {
  const response = await client.delete(`${endpoints.admin.roles}/${id}`);
  return response?.data?.data || null;
}
