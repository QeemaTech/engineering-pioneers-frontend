import client from "../../../api/client";
import endpoints from "../../../api/endpoints";
import { fetchStudentMyCourses } from "../financials/api";

function normalizeMyCourseRow(row: Record<string, unknown>) {
  if (row?.course && typeof row.course === "object") {
    const course = row.course as Record<string, unknown>;
    return {
      id: course.id,
      courseId: row.courseId ?? course.id,
      title: course.title,
      thumbnail: course.thumbnail,
      type: course.type,
      instructor: course.instructor,
      progressPercentage: row.progressPercentage,
      completedLessonsCount: row.completedLessonsCount,
      isCompleted: row.isCompleted,
      purchasedAt: row.purchasedAt,
    };
  }
  return row;
}

export async function fetchMyCourses() {
  const rows = await fetchStudentMyCourses();
  return Array.isArray(rows) ? rows.map((row) => normalizeMyCourseRow(row as Record<string, unknown>)) : [];
}

export async function fetchCourseUnits(courseId: string) {
  const res = await client.get(endpoints.student.courseUnits(courseId));
  return res?.data?.data ?? [];
}
