import client from "../../../api/client";

export async function fetchAdminTickets(params = {}) {
  const response = await client.get("/admin/tickets", { params });
  const payload = response?.data?.data;
  const rows = payload?.tickets || payload?.items || payload || [];
  return { tickets: Array.isArray(rows) ? rows : [] };
}

export async function fetchAdminTicketById(id) {
  const response = await client.get(`/admin/tickets/${id}`);
  return response?.data?.data || null;
}

export async function replyAdminTicket({ id, message }) {
  const response = await client.post(`/admin/tickets/${id}/message`, { message });
  return response?.data?.data || null;
}

export async function processAdminTicket({ id, body }) {
  const response = await client.patch(`/admin/tickets/${id}/process`, body);
  return response?.data?.data || null;
}

export async function createAdminTicket(body) {
  const response = await client.post("/admin/tickets", body);
  return response?.data?.data || null;
}

