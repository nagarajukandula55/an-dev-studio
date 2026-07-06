import { AppShell } from "@/components/layout/AppShell";
import DashboardContent from "./_components/DashboardContent";

export default function HomePage() {
    return (
        <AppShell title="Dashboard">
            <DashboardContent />
        </AppShell>
    );
}
