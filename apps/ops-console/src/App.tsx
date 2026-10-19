import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RequireAbility } from './auth/RequireAbility';
import { AppShell } from './components/AppShell';
import { createQueryClient } from './lib/query-client';
import { DashboardPage } from './routes/DashboardPage';
import { ForbiddenPage } from './routes/ForbiddenPage';
import { KycQueuePage } from './routes/KycQueuePage';
import { NotFoundPage } from './routes/NotFoundPage';

const queryClient = createQueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <RequireAbility permission="ops_dashboard.ops_dashboard.view">
                  <DashboardPage />
                </RequireAbility>
              }
            />
            <Route
              path="/kyc"
              element={
                <RequireAbility permission="ops_kyc.kyc_case.view">
                  <KycQueuePage />
                </RequireAbility>
              }
            />
            <Route path="/forbidden" element={<ForbiddenPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
