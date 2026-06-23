import DashboardLayout from "./DashboardLayout";
import { getStudentNavigation } from "../config/navigation";

function StudentLayout() {
  return <DashboardLayout sidebarSections={getStudentNavigation()} />;
}

export default StudentLayout;
