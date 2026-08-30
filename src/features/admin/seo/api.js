import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchAdminSeoSettings() {
  const response = await client.get(endpoints.admin.seo);
  return response?.data?.data || { global: {}, pages: [], robotsTxt: "" };
}

export async function updateAdminSeoSettings(body) {
  const response = await client.put(endpoints.admin.seo, body);
  return response?.data?.data || {};
}

export async function fetchAdminSeoAudit() {
  const response = await client.get(endpoints.admin.seoAudit);
  return response?.data?.data || { score: 100, issues: [], summary: {} };
}

export async function fetchAdminSitemapPreview() {
  const response = await client.get(endpoints.admin.seoSitemapPreview);
  return response?.data?.data?.xml || "";
}

export async function fetchPublicSeoSettings() {
  const response = await client.get(endpoints.public.seoSettings);
  return response?.data?.data || { global: {}, pages: [] };
}
