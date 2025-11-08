import { Route, Routes } from 'react-router-dom';
import routes from '../../routes';

import DefaultLayout from '../../layout/DefaultLayout/DefaultLayout';
import ProtectedRoute from '../ProtectedRoute';
import UserLayout from '../../layout/UserLayout';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from '../../features/auth/authAsync';
import { useEffect } from 'react';
import { DrawerProvider } from '../../contexts/DrawerContext';
import { usePresenceChannel } from '../../store/usePresenceChannel';

function AppRoutes() {
  const dispatch = useDispatch();
  const isAuth = useSelector((state) => state.auth.isAuth);

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);
  usePresenceChannel();
  return (
    <>
      <Routes>
        <Route element={isAuth ? <UserLayout /> : <DefaultLayout />}>
          {routes.map((route) => {
            const Component = route.component;
            const isProtected = route.protected && !isAuth;
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  isProtected && !isAuth ? (
                    <ProtectedRoute>
                      <Component {...route.props} />
                    </ProtectedRoute>
                  ) : (
                    <Component />
                  )
                }
              />
            );
          })}
        </Route>
      </Routes>
      <DrawerProvider />
    </>
  );
}

export default AppRoutes;
