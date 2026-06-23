import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchMyTickets() {
  const res = await client.get(endpoints.student.tickets);
  return res?.data?.data ?? [];
}

export async function createTicket(body) {
  const res = await client.post(endpoints.student.tickets, body);
  return res?.data?.data ?? null;
}

export async function replyToTicket(ticketId, message) {
  const res = await client.post(endpoints.student.ticketReply(ticketId), { message });
  return res?.data?.data ?? null;
}
