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
      expiresAt: row.expiresAt,
    };
  }
  return row;
}

export async function fetchMyCourses() {
  const rows = await fetchStudentMyCourses();
  return Array.isArray(rows) ? rows.map((row) => normalizeMyCourseRow(row as Record<string, unknown>)) : [];
}

function normalizeCourseUnit(unit: Record<string, unknown>) {
  const sections = Array.isArray(unit.sections)
    ? unit.sections.map((section) => {
        const row = section as Record<string, unknown>;
        const lessons = Array.isArray(row.lessons) ? row.lessons : [];
        return { ...row, lessons };
      })
    : [];
  const directLessons = Array.isArray(unit.lessons) ? unit.lessons : [];

  if (sections.length > 0) {
    const lessons = sections.flatMap((section) => {
      const sectionRow = section as Record<string, unknown>;
      return (sectionRow.lessons as Record<string, unknown>[]).map((lesson) => ({
        ...lesson,
        sectionId: sectionRow.id,
        sectionTitle: sectionRow.title,
      }));
    });
    return { ...unit, sections, lessons };
  }

  return { ...unit, sections: [], lessons: directLessons };
}

export async function fetchCourseUnits(courseId: string) {
  const res = await client.get(endpoints.student.courseUnits(courseId));
  const rows = res?.data?.data ?? [];
  return Array.isArray(rows) ? rows.map((row) => normalizeCourseUnit(row as Record<string, unknown>)) : [];
}
