import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductionOrdersPage } from './pages/ProductionOrdersPage';
import { DevelopmentsPage } from './pages/DevelopmentsPage';
import { WorkOrdersPage } from './pages/WorkOrdersPage';
import { InventoryPage } from './pages/InventoryPage';
import { PurchasingPage } from './pages/PurchasingPage';
import { InternalOrdersPage } from './pages/InternalOrdersPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { ShipmentsPage } from './pages/ShipmentsPage';
import { AccountingSyncPage } from './pages/AccountingSyncPage';
import { ReportsPage } from './pages/ReportsPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { SettingsPage } from './pages/SettingsPage';
import { useAuthStore } from './stores/auth.store';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuth = useAuthStore((s) => s.isAuthenticated());
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/production" element={<ProductionOrdersPage />} />
            <Route path="/developments" element={<DevelopmentsPage />} />
            <Route path="/work-orders" element={<WorkOrdersPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/purchasing" element={<PurchasingPage />} />
            <Route path="/internal-orders" element={<InternalOrdersPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/shipments" element={<ShipmentsPage />} />
            <Route path="/accounting" element={<AccountingSyncPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
