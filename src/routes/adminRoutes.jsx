import { lazy } from "react";
import { Navigate, Route, useParams } from "react-router-dom";
import AdminGuard from "./adminGuard";
import AdminLayout from "../layouts/AdminLayout";
import { AdminSuspense } from "../components/admin/AdminSuspense";

const AdminOverview = lazy(() => import("../pages/admin/Overview"));
const AdminUsers = lazy(() => import("../pages/admin/Users"));
const AdminUserDetail = lazy(() => import("../pages/admin/UserDetail"));
const AdminInstructors = lazy(() => import("../pages/admin/Instructors"));
const AdminCourses = lazy(() => import("../pages/admin/Courses"));
const AdminExams = lazy(() => import("../pages/admin/Exams"));
const AdminFinance = lazy(() => import("../pages/admin/Finance"));
const AdminCms = lazy(() => import("../pages/admin/Cms"));
const AdminSettings = lazy(() => import("../pages/admin/Settings"));
const AdminAccount = lazy(() => import("../pages/admin/Account"));
const AdminTickets = lazy(() => import("../pages/admin/Tickets"));
const AdminTicketDetail = lazy(() => import("../pages/admin/TicketDetail"));
const AdminStudents = lazy(() => import("../pages/admin/Students"));
const AdminStudentDetail = lazy(() => import("../pages/admin/StudentDetail"));
const AdminInstructorsList = lazy(() => import("../pages/admin/InstructorsList"));
const AdminInstructorDetail = lazy(() => import("../pages/admin/InstructorDetail"));
const AdminInstructorPayouts = lazy(() => import("../pages/admin/InstructorPayouts"));
const AdminAddCourse = lazy(() => import("../pages/admin/AddCourse"));
const AdminCourseEditor = lazy(() => import("../pages/admin/CourseEditor"));
const AdminCourseCategories = lazy(() => import("../pages/admin/CourseCategories"));
const AdminEnrollments = lazy(() => import("../pages/admin/Enrollments"));
const AdminEnrollStudent = lazy(() => import("../pages/admin/EnrollStudent"));
const AdminCmsPosts = lazy(() => import("../pages/admin/CmsPosts"));
const AdminCmsBanners = lazy(() => import("../pages/admin/CmsBanners"));
const AdminCmsPages = lazy(() => import("../pages/admin/CmsPages"));
const AdminSettingsRoles = lazy(() => import("../pages/admin/SettingsRoles"));
const AdminRoleEditor = lazy(() => import("../pages/admin/RoleEditor"));
const AdminSettingsEmails = lazy(() => import("../pages/admin/SettingsEmails"));
const AdminSettingsIntegrations = lazy(() => import("../pages/admin/SettingsIntegrations"));
const AdminAddExam = lazy(() => import("../pages/admin/AddExam"));
const AdminExamEditor = lazy(() => import("../pages/admin/ExamEditor"));
const AdminExamSubmissions = lazy(() => import("../pages/admin/ExamSubmissions"));
const AdminPerformance = lazy(() => import("../pages/admin/Performance"));
const AdminCoupons = lazy(() => import("../pages/admin/Coupons"));
const AdminCertificates = lazy(() => import("../pages/admin/Certificates"));
const AdminPackages = lazy(() => import("../pages/admin/Packages"));
const AdminReviewQueue = lazy(() => import("../pages/admin/ReviewQueue"));
const AdminAuditLogs = lazy(() => import("../pages/admin/AuditLogs"));
const AdminLiveSessions = lazy(() => import("../pages/admin/LiveSessions"));
const AdminSurveys = lazy(() => import("../pages/admin/Surveys"));

function AdminCourseIdRedirect() {
  const { id } = useParams();
  return <Navigate to={`/admin/courses/${id}/edit`} replace />;
}

function wrap(node) {
  return <AdminSuspense>{node}</AdminSuspense>;
}

function AdminRoutes() {
  return (
    <Route element={<AdminGuard />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={wrap(<AdminOverview />)} />
        <Route path="dashboard" element={wrap(<AdminOverview />)} />
        <Route path="finance" element={wrap(<AdminFinance />)} />
        <Route path="performance" element={wrap(<AdminPerformance />)} />
        <Route path="coupons" element={wrap(<AdminCoupons />)} />
        <Route path="packages" element={wrap(<AdminPackages />)} />
        <Route path="certificates" element={wrap(<AdminCertificates />)} />
        <Route path="surveys" element={wrap(<AdminSurveys />)} />

        {/* Live sessions */}
        <Route path="live-sessions" element={wrap(<AdminLiveSessions />)} />

        <Route path="students" element={wrap(<AdminStudents />)} />
        <Route path="students/:id" element={wrap(<AdminStudentDetail />)} />

        <Route path="instructors/payouts" element={wrap(<AdminInstructorPayouts />)} />
        <Route path="instructors/list" element={wrap(<AdminInstructorsList />)} />
        <Route path="instructors" element={wrap(<AdminInstructors />)} />
        <Route path="instructors/:id" element={wrap(<AdminInstructorDetail />)} />

        <Route path="courses" element={wrap(<AdminCourses />)} />
        <Route path="courses/new" element={wrap(<AdminAddCourse />)} />
        <Route path="courses/review" element={wrap(<AdminReviewQueue />)} />
        <Route path="courses/:id/edit" element={wrap(<AdminCourseEditor />)} />
        <Route path="courses/categories" element={wrap(<AdminCourseCategories />)} />
        <Route path="courses/:id" element={wrap(<AdminCourseIdRedirect />)} />

        <Route path="enrollments" element={wrap(<AdminEnrollments />)} />
        <Route path="enrollments/new" element={wrap(<AdminEnrollStudent />)} />

        <Route path="tickets" element={wrap(<AdminTickets />)} />
        <Route path="tickets/:id" element={wrap(<AdminTicketDetail />)} />

        <Route path="cms/posts" element={wrap(<AdminCmsPosts />)} />
        <Route path="cms/banners" element={wrap(<AdminCmsBanners />)} />
        <Route path="cms/pages" element={wrap(<AdminCmsPages />)} />

        <Route path="account" element={wrap(<AdminAccount />)} />
        <Route path="settings" element={wrap(<AdminSettings />)} />
        <Route path="settings/roles/new" element={wrap(<AdminRoleEditor />)} />
        <Route path="settings/roles/:id/edit" element={wrap(<AdminRoleEditor />)} />
        <Route path="settings/roles" element={wrap(<AdminSettingsRoles />)} />
        <Route path="settings/emails" element={wrap(<AdminSettingsEmails />)} />
        <Route path="settings/integrations" element={wrap(<AdminSettingsIntegrations />)} />
        <Route path="audit-logs" element={wrap(<AdminAuditLogs />)} />

        <Route path="users/:id" element={wrap(<AdminUserDetail />)} />
        <Route path="users" element={wrap(<AdminUsers />)} />
        <Route path="exams" element={wrap(<AdminExams />)} />
        <Route path="exams/new" element={wrap(<AdminAddExam />)} />
        <Route path="exams/:id/edit" element={wrap(<AdminExamEditor />)} />
        <Route path="exams/:id/submissions" element={wrap(<AdminExamSubmissions />)} />
        <Route path="cms" element={wrap(<AdminCms />)} />
      </Route>
    </Route>
  );
}

export default AdminRoutes;
