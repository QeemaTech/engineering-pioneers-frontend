import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchInstructorHomeworkQueue() {
  const response = await client.get(endpoints.homework.instructorPending);
  const data = response?.data?.data;
  if (data && Array.isArray(data.submissions)) {
    return {
      submissions: data.submissions,
      counts: data.counts || { notOpened: 0, opened: 0, closed: 0 },
    };
  }
  if (Array.isArray(data)) {
    return {
      submissions: data,
      counts: { notOpened: 0, opened: 0, closed: 0 },
    };
  }
  return {
    submissions: [],
    counts: { notOpened: 0, opened: 0, closed: 0 },
  };
}

export async function patchHomeworkSubmissionReviewStatus(submissionId, instructorReviewStatus) {
  const response = await client.patch(endpoints.homework.submissionReviewStatus(submissionId), {
    instructorReviewStatus,
  });
  return response?.data?.data;
}

export async function gradeHomeworkSubmission(submissionId, body) {
  const response = await client.patch(endpoints.homework.gradeSubmission(submissionId), body);
  return response?.data?.data;
}

export async function createInstructorHomework(body) {
  const response = await client.post("/homework/instructor", body);
  return response?.data?.data;
}

export async function deleteInstructorHomework(homeworkId) {
  const response = await client.delete(`/homework/instructor/${homeworkId}`);
  return response?.data?.data;
}
