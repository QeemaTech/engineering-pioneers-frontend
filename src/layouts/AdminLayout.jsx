import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "./DashboardLayout";
import {
  filterNavByPermission,
  getAdminNavigation,
} from "../config/navigation";
import { usePermissions } from "../hooks/usePermissions";
import { useSessionHeartbeat } from "../hooks/useSessionHeartbeat";
import useAuthStore from "../store/authStore";
import { fetchAdminTickets } from "../features/admin/tickets/api";

function AdminLayout() {
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const { hasPermission } = usePermissions();

  useSessionHeartbeat(true);

  useEffect(() => {
    refreshProfile().catch(() => {});
  }, [refreshProfile]);

  const { data: ticketsData } = useQuery({
    queryKey: ["admin", "tickets", "open-count"],
    queryFn: () => fetchAdminTickets({ status: "OPEN" }),
    enabled: hasPermission("support:manage"),
    staleTime: 60_000,
  });

  const openTicketsCount = useMemo(() => {
    const tickets = ticketsData?.tickets || [];
    return tickets.filter((t) => String(t.status || "").toUpperCase() === "OPEN").length;
  }, [ticketsData]);

  const sidebarSections = useMemo(
    () => filterNavByPermission(getAdminNavigation(openTicketsCount), hasPermission),
    [openTicketsCount, hasPermission]
  );

  return <DashboardLayout sidebarSections={sidebarSections} />;
}

export default AdminLayout;
