import { lazy } from "react";
import { Navigate, Route, useLocation, useParams } from "react-router-dom";
import { APP_ROLES } from "../config/permissions";
import GuardedRoute from "./guardedRoute";
import StudentLayout from "../layouts/StudentLayout";

const StudentOverview = lazy(() => import("../pages/student/Overview"));
const MyClasses = lazy(() => import("../pages/MyClasses"));
const LiveSessions = lazy(() => import("../pages/student/LiveSessions"));
const LiveSessionDetails = lazy(() => import("../pages/student/LiveSessionDetails"));
const RecordingsLibrary = lazy(() => import("../pages/student/RecordingsLibrary"));
const RecordingPlayer = lazy(() => import("../pages/student/RecordingPlayer"));
const Homework = lazy(() => import("../pages/Homework"));
const HomeworkCohort = lazy(() => import("../pages/HomeworkCohort"));
const HomeworkDetail = lazy(() => import("../pages/HomeworkDetail"));
const Exams = lazy(() => import("../pages/Exams"));
const ExamDetails = lazy(() => import("../pages/ExamDetails"));
const TakeExam = lazy(() => import("../pages/TakeExam"));
const ExamResult = lazy(() => import("../pages/ExamResult"));
const Progress = lazy(() => import("../pages/Progress"));
const StudentAttendance = lazy(() => import("../pages/student/Attendance"));
const BookPrivate = lazy(() => import("../pages/BookPrivate"));
const Payments = lazy(() => import("../pages/student/Payments"));
const Certificates = lazy(() => import("../pages/student/Certificates"));
const Tickets = lazy(() => import("../pages/student/Tickets"));
const TicketDetail = lazy(() => import("../pages/student/TicketDetail"));
const Checkout = lazy(() => import("../pages/Checkout"));
const Settings = lazy(() => import("../pages/Settings"));
const Wishlist = lazy(() => import("../pages/student/Wishlist"));
const CourseView = lazy(() => import("../pages/CourseView"));
const StudentQna = lazy(() => import("../pages/student/Qna"));
const StudentSurveys = lazy(() => import("../pages/student/Surveys"));
const StudentMyPrivateSessions = lazy(() => import("../pages/student/MyPrivateSessions"));

function RedirectCourseLearn() {
  const { id } = useParams();
  return <Navigate to={`/student/courses/${id}/learn`} replace />;
}

function RedirectHomeworkCourse() {
  const { cohortId } = useParams();
  return <Navigate to={`/student/homework/course/${cohortId}`} replace />;
}

function RedirectHomeworkAssignment() {
  const { homeworkId } = useParams();
  return <Navigate to={`/student/homework/assignment/${homeworkId}`} replace />;
}

function RedirectExamsPath() {
  const location = useLocation();
  const suffix = location.pathname.replace(/^\/exams/, "") || "";
  return <Navigate to={`/student/exams${suffix}${location.search}`} replace />;
}

function StudentRoutes() {
  return (
    <>
      <Route element={<GuardedRoute allowedRoles={[APP_ROLES.STUDENT]} />}>
        <Route path="/student/courses/:id/learn" element={<CourseView />} />
        <Route path="/student/exams/:id/take" element={<TakeExam />} />

        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentOverview />} />
          <Route path="classes" element={<MyClasses />} />
          <Route path="live-sessions" element={<LiveSessions />} />
          <Route path="live-sessions/:id" element={<LiveSessionDetails />} />
          <Route path="recordings" element={<RecordingsLibrary />} />
          <Route path="recordings/:sourceType/:id" element={<RecordingPlayer />} />
          <Route path="homework" element={<Homework />} />
          <Route path="homework/assignment/:homeworkId" element={<HomeworkDetail />} />
          <Route path="homework/course/:courseId" element={<HomeworkCohort />} />
          <Route path="exams" element={<Exams />} />
          <Route path="exams/:id" element={<ExamDetails />} />
          <Route path="exams/:id/results/:submissionId" element={<ExamResult />} />
          <Route path="progress" element={<Progress />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="book-session" element={<BookPrivate />} />
          <Route path="payments" element={<Payments />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="tickets/:id" element={<TicketDetail />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="settings" element={<Settings />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="qna" element={<StudentQna />} />
          <Route path="surveys" element={<StudentSurveys />} />
          <Route path="my-private-sessions" element={<StudentMyPrivateSessions />} />
        </Route>
      </Route>

      {/* Legacy path redirects */}
      <Route path="/my-classes" element={<Navigate to="/student/classes" replace />} />
      <Route path="/course/:id" element={<RedirectCourseLearn />} />
      <Route path="/homework" element={<Navigate to="/student/homework" replace />} />
      <Route path="/homework/assignment/:homeworkId" element={<RedirectHomeworkAssignment />} />
      <Route path="/homework/:cohortId/:homeworkId" element={<RedirectHomeworkAssignment />} />
      <Route path="/homework/:cohortId" element={<RedirectHomeworkCourse />} />
      <Route path="/exams/*" element={<RedirectExamsPath />} />
      <Route path="/progress" element={<Navigate to="/student/progress" replace />} />
      <Route path="/settings" element={<Navigate to="/student/settings" replace />} />
      <Route path="/recordings" element={<Navigate to="/student/recordings" replace />} />
      <Route path="/checkout" element={<RedirectToCheckout />} />
      <Route path="/book-session" element={<Navigate to="/instructors" replace />} />
    </>
  );
}

function RedirectToCheckout() {
  const location = useLocation();
  return <Navigate to={`/student/checkout${location.search}`} replace />;
}

export default StudentRoutes;
