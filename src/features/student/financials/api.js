import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

/** Course lifetime purchase checkout (pending until admin approves). */
export async function postStudentCourseCheckout(courseId, body) {
  const res = await client.post(endpoints.student.financialsCheckoutCourse(courseId), body);
  return res?.data?.data ?? res?.data;
}

/** Private session checkout for an availability slot. */
export async function postStudentPrivateCheckout(availabilityId, body) {
  const res = await client.post(endpoints.student.financialsCheckoutPrivate(availabilityId), body);
  return res?.data?.data ?? res?.data;
}

export async function fetchStudentMyCourses() {
  const res = await client.get(endpoints.student.financialsMyCourses);
  return res?.data?.data ?? [];
}

export async function validateStudentCoupon(body) {
  const res = await client.post(endpoints.student.couponValidate, body);
  return res?.data?.data ?? res?.data;
}

export async function fetchMyPayments() {
  const res = await client.get(endpoints.student.myPayments);
  return res?.data?.data ?? [];
}

export async function fetchLiveSessionDetails(liveSessionId) {
  const res = await client.get(`/student/classes/${liveSessionId}`);
  return res?.data?.data ?? res?.data;
}

export async function postStudentLiveSessionCheckout(liveSessionId, body) {
  const res = await client.post(`/student/financials/checkout/live-session/${liveSessionId}`, body);
  return res?.data?.data ?? res?.data;
}
