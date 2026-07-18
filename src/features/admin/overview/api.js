import client from "../../../api/client";
import endpoints from "../../../api/endpoints";
import { unwrapResponse } from "../../../api/error";

export async function fetchAdminStats() {
  const response = await client.get(endpoints.admin.stats);
  return unwrapResponse(response);
}

export async function fetchAdminOverview(range = "30d") {
  const response = await client.get(`${endpoints.admin.overview}?range=${range}`);
  return unwrapResponse(response);
}

