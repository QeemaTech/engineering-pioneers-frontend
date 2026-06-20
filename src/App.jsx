import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ThemeHtmlSync from "./components/ThemeHtmlSync";
import RouterNavigationBridge from "./components/RouterNavigationBridge";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Explore from "./pages/Explore";
import Subscription from "./pages/Subscription";
import MyClasses from "./pages/MyClasses";
import CourseView from "./pages/CourseView";
import Homework from "./pages/Homework";
import HomeworkCohort from "./pages/HomeworkCohort";
import BookPrivate from "./pages/BookPrivate";
import Exams from "./pages/Exams";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import Recordings from "./pages/Recordings";
import CourseDetails from "./pages/CourseDetails";
import FaqPage from "./pages/FaqPage";
import AboutPage from "./pages/AboutPage";
import BlogsPage from "./pages/BlogsPage";
import BlogPostPage from "./pages/BlogPostPage";
import Checkout from "./pages/Checkout";
import ExamDetails from "./pages/ExamDetails";
import HomeworkDetail from "./pages/HomeworkDetail";
import TakeExam from "./pages/TakeExam";
import ExamResult from "./pages/ExamResult";
import AccessDenied from "./pages/AccessDenied";
import AdminRoutes from "./routes/adminRoutes";
import InstructorRoutes from "./routes/instructorRoutes";
import GuardedRoute from "./routes/guardedRoute";
import useAuthStore from "./store/authStore";
import { APP_ROLES, normalizeRole, hasAdminAccess } from "./config/permissions";

function RoleLanding() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const role = normalizeRole(user?.role);

  if (!hydrated) return null;

  if (isAuthenticated && hasAdminAccess(user)) return <Navigate to="/admin" replace />;
  if (isAuthenticated && role === APP_ROLES.INSTRUCTOR) return <Navigate to="/instructor" replace />;
  return <Home />;
}

function App() {
  return (
    <BrowserRouter>
      <ThemeHtmlSync />
      <RouterNavigationBridge />
      <Routes>
        {/* Auth pages — standalone (no Header/Footer) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/access-denied" element={<AccessDenied />} />

        {/* Main app shell with Header + Footer */}
        <Route element={<Layout />}>
          <Route index element={<RoleLanding />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/courses" element={<Explore />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blogs/:slug" element={<BlogPostPage />} />
          <Route path="/courses/:id" element={<CourseDetails />} />

          <Route element={<GuardedRoute allowedRoles={[APP_ROLES.STUDENT]} />}>
            <Route path="/my-classes" element={<MyClasses />} />
            <Route path="/course/:id" element={<CourseView />} />
            <Route path="/homework" element={<Homework />} />
            <Route path="/homework/assignment/:homeworkId" element={<HomeworkDetail />} />
            <Route path="/homework/:cohortId/:homeworkId" element={<HomeworkDetail />} />
            <Route path="/homework/:cohortId" element={<HomeworkCohort />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/exams/:id" element={<ExamDetails />} />
            <Route path="/exams/:id/take" element={<TakeExam />} />
            <Route path="/exams/:id/results/:submissionId" element={<ExamResult />} />
            <Route path="/book-session" element={<BookPrivate />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/recordings" element={<Recordings />} />
            <Route path="/checkout" element={<Checkout />} />
          </Route>
        </Route>

        <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
        {AdminRoutes()}
        {InstructorRoutes()}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
