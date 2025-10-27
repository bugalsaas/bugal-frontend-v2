'use client';

import { MainLayout } from '@/components/layout/wrapped-main-layout';
import { DashboardContent } from '@/components/pages/dashboard-content';

export default function Home() {
  const headerConfig = {
    title: "Overview",
    subtitle: "Dashboard overview",
    showSearch: false,
    showAddButton: false,
  };

  return (
    <MainLayout activeNavItem="dashboard" headerConfig={headerConfig}>
      <DashboardContent />
    </MainLayout>
  );
}