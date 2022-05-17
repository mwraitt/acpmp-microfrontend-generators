import React, { useMemo } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

export enum ROUTE {
  Default = '/',
  Home = '/home',
}

export const useAppNavigation = () => {
  const navigate = useNavigate();

  return useMemo(
    () => ({
      goToHome: () => navigate(ROUTE.Home),
    }),
    [navigate],
  );
};

export type UseAppNavigation = ReturnType<typeof useAppNavigation>;

// lazy import for pages to enable bundle code splitting per route
const HomePage = React.lazy(() => import('../pages/home-page'));

export const MainRoutes = React.memo(() => (
  <React.Suspense fallback="Loading...">
    <Routes>
      <Route path={ROUTE.Default} element={<Navigate to={ROUTE.Home} replace />} />

      <Route path={ROUTE.Home} element={<HomePage />} />

      <Route path="*" element={<HomePage />} />
    </Routes>
  </React.Suspense>
));
