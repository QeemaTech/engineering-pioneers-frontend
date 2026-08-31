import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ThemeHtmlSync from "./components/ThemeHtmlSync";
import RouterNavigationBridge from "./components/RouterNavigationBridge";
import useAuthStore from "./store/authStore";
import { APP_ROLES, normalizeRole, hasAdminAccess } from "./config/permissions";

// Eager load Home for instant First Paint
import Home from "./pages/Home";

// Lazy load all other pages for maximum performance and smallest initial bundle size
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Explore = lazy(() => import("./pages/Explore"));
const Instructors = lazy(() => import("./pages/Instructors"));
const InstructorProfile = lazy(() => import("./pages/InstructorProfile"));
const CourseDetails = lazy(() => import("./pages/CourseDetails"));
const FaqPage = lazy(() => import("./pages/FaqPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const BlogsPage = lazy(() => import("./pages/BlogsPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const StaticContentPage = lazy(() => import("./pages/StaticContentPage"));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate"));
const AccessDenied = lazy(() => import("./pages/AccessDenied"));
const EventsPage = lazy(() => import("./pages/public/Events"));
const Packages = lazy(() => import("./pages/Packages"));

// Lazy routes modules
import AdminRoutes from "./routes/adminRoutes";
import InstructorRoutes from "./routes/instructorRoutes";
import StudentRoutes from "./routes/studentRoutes";

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-3 border-orange-500/20 border-t-[#EE7C11]" />
        <span className="text-xs font-semibold text-slate-400">جاري التحميل...</span>
      </div>
    </div>
  );
}

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
      <Suspense fallback={<PageLoader />}>
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
            <Route path="/instructors" element={<Instructors />} />
            <Route path="/instructors/:id" element={<InstructorProfile />} />
            <Route path="/courses" element={<Explore />} />
            <Route path="/subscription" element={<Navigate to="/explore" replace />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<StaticContentPage slug="contact" showContactInfo />} />
            <Route path="/community" element={<StaticContentPage slug="community" />} />
            <Route path="/library" element={<StaticContentPage slug="library" />} />
            <Route path="/guide" element={<StaticContentPage slug="user-guide" />} />
            <Route path="/terms" element={<StaticContentPage slug="terms" />} />
            <Route path="/teach" element={<StaticContentPage slug="teach" />} />
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/blogs/:slug" element={<BlogPostPage />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/verify-certificate" element={<VerifyCertificate />} />
            <Route path="/verify-certificate/:serial" element={<VerifyCertificate />} />
          </Route>

          <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
          {AdminRoutes()}
          {InstructorRoutes()}
          {StudentRoutes()}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
