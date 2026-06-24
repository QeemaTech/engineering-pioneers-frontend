import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchAdminCertificates(params = {}) {
  const response = await client.get(endpoints.admin.certificates, { params });
  const payload = response?.data?.data;
  return {
    certificates: payload?.certificates || payload || [],
    total: payload?.total || 0,
  };
}

export async function issueAdminCertificate(body) {
  const response = await client.post("/admin/certificates/issue", body, {
    responseType: "blob",
  });
  return response?.data;
}

export async function downloadAdminCertificate(certificateId) {
  const response = await client.get(endpoints.admin.downloadCertificate(certificateId), {
    responseType: "blob",
  });
  return response?.data;
}

