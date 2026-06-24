import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchMyCertificates() {
  const res = await client.get(endpoints.student.certificates);
  return res?.data?.data ?? [];
}

export async function claimCourseCertificate(courseId) {
  const res = await client.post(
    endpoints.student.claimCertificate(courseId),
    {},
    { responseType: "blob" }
  );
  return res.data;
}

export async function downloadStudentCertificate(certificateId) {
  const res = await client.get(endpoints.student.downloadCertificate(certificateId), {
    responseType: "blob",
  });
  return res.data;
}
