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
