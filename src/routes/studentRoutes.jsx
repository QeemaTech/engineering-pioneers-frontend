import { Navigate, Route, useLocation, useParams } from "react-router-dom";
import { APP_ROLES } from "../config/permissions";
import GuardedRoute from "./guardedRoute";
import StudentLayout from "../layouts/StudentLayout";
import StudentOverview from "../pages/student/Overview";
import MyClasses from "../pages/MyClasses";
import LiveSessions from "../pages/student/LiveSessions";
import LiveSessionDetails from "../pages/student/LiveSessionDetails";
import RecordingsLibrary from "../pages/student/RecordingsLibrary";
import RecordingPlayer from "../pages/student/RecordingPlayer";
import Homework from "../pages/Homework";
import HomeworkCohort from "../pages/HomeworkCohort";
import HomeworkDetail from "../pages/HomeworkDetail";
import Exams from "../pages/Exams";
import ExamDetails from "../pages/ExamDetails";
import TakeExam from "../pages/TakeExam";
import ExamResult from "../pages/ExamResult";
import Progress from "../pages/Progress";
import StudentAttendance from "../pages/student/Attendance";
import BookPrivate from "../pages/BookPrivate";
import Payments from "../pages/student/Payments";
import Certificates from "../pages/student/Certificates";
import Tickets from "../pages/student/Tickets";
import TicketDetail from "../pages/student/TicketDetail";
import Checkout from "../pages/Checkout";
import Settings from "../pages/Settings";
import Wishlist from "../pages/student/Wishlist";
import CourseView from "../pages/CourseView";
import StudentQna from "../pages/student/Qna";

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
      <Route path="/checkout" element={<Navigate to="/student/checkout" replace />} />
      <Route path="/book-session" element={<Navigate to="/instructors" replace />} />
    </>
  );
}

export default StudentRoutes;
