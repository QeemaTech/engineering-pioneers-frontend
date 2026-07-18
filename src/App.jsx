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
import Instructors from "./pages/Instructors";
import InstructorProfile from "./pages/InstructorProfile";
import CourseDetails from "./pages/CourseDetails";
import FaqPage from "./pages/FaqPage";
import AboutPage from "./pages/AboutPage";
import BlogsPage from "./pages/BlogsPage";
import BlogPostPage from "./pages/BlogPostPage";
import StaticContentPage from "./pages/StaticContentPage";
import VerifyCertificate from "./pages/VerifyCertificate";
import AccessDenied from "./pages/AccessDenied";
import EventsPage from "./pages/public/Events";
import Packages from "./pages/Packages";
import AdminRoutes from "./routes/adminRoutes";
import InstructorRoutes from "./routes/instructorRoutes";
import StudentRoutes from "./routes/studentRoutes";
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
    </BrowserRouter>
  );
}

export default App;
