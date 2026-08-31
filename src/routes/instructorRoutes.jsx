import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";
import { APP_ROLES } from "../config/permissions";
import GuardedRoute from "./guardedRoute";
import InstructorLayout from "../layouts/InstructorLayout";

const InstructorOverview = lazy(() => import("../pages/instructor/Overview"));
const InstructorCourses = lazy(() => import("../pages/instructor/Courses"));
const InstructorCreateCourse = lazy(() => import("../pages/instructor/CreateCourse"));
const InstructorEditCourse = lazy(() => import("../pages/instructor/EditCourse"));
const InstructorExams = lazy(() => import("../pages/instructor/Exams"));
const InstructorExamDetailPage = lazy(() => import("../pages/instructor/ExamDetail"));
const InstructorStudents = lazy(() => import("../pages/instructor/Students"));
const InstructorStudentDetail = lazy(() => import("../pages/instructor/StudentDetail"));
const InstructorQna = lazy(() => import("../pages/instructor/Qna"));
const InstructorWallet = lazy(() => import("../pages/instructor/Wallet"));
const InstructorPerformance = lazy(() => import("../pages/instructor/Performance"));
const InstructorHomework = lazy(() => import("../pages/instructor/Homework"));
const InstructorAvailability = lazy(() => import("../pages/instructor/Availability"));
const InstructorAttendance = lazy(() => import("../pages/instructor/Attendance"));
const InstructorSettings = lazy(() => import("../pages/instructor/Settings"));
const InstructorLiveSessions = lazy(() => import("../pages/instructor/LiveSessions"));
const InstructorSurveys = lazy(() => import("../pages/instructor/Surveys"));

function InstructorRoutes() {
  return (
    <Route element={<GuardedRoute allowedRoles={[APP_ROLES.INSTRUCTOR]} />}>
      <Route path="/instructor" element={<InstructorLayout />}>
        <Route index element={<Navigate to="/instructor/dashboard" replace />} />
        <Route path="dashboard" element={<InstructorOverview />} />
        <Route path="classes" element={<Navigate to="/instructor/courses" replace />} />
        <Route path="cohorts" element={<Navigate to="/instructor/courses" replace />} />
        <Route path="courses" element={<InstructorCourses />} />
        <Route path="courses/new" element={<InstructorCreateCourse />} />
        <Route path="courses/:id/edit" element={<InstructorEditCourse />} />
        <Route path="homework" element={<InstructorHomework />} />
        <Route path="live-sessions" element={<InstructorLiveSessions />} />
        <Route path="availability" element={<InstructorAvailability />} />
        <Route path="attendance" element={<InstructorAttendance />} />
        <Route path="exams" element={<InstructorExams />} />
        <Route path="exams/:examId" element={<InstructorExamDetailPage />} />
        <Route path="students" element={<InstructorStudents />} />
        <Route path="students/:id" element={<InstructorStudentDetail />} />
        <Route path="qna" element={<InstructorQna />} />
        <Route path="wallet" element={<InstructorWallet />} />
        <Route path="performance" element={<InstructorPerformance />} />
        <Route path="settings" element={<InstructorSettings />} />
        <Route path="surveys" element={<InstructorSurveys />} />
      </Route>
    </Route>
  );
}

export default InstructorRoutes;
