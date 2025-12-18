import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from './stores/userStore';
import LoginPage from './features/auth/LoginPage';
import LobbyPage from './features/lobby/LobbyPage';
import InventoryPage from './features/inventory/InventoryPage';
import SlotMachinePage from './features/slot-machine/SlotMachinePage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useEffect } from 'react';
import { authApi } from './services/api';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, setUser, setToken } = useUserStore();

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await authApi.getMe();
          setUser(response.data.data);
        } catch (error) {
          // Token无效，清除
          useUserStore.getState().logout();
        }
      }
    };
    loadUser();
  }, [token, setUser, setToken]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/lobby"
            element={
              <ProtectedRoute>
                <LobbyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/slots"
            element={
              <ProtectedRoute>
                <SlotMachinePage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/lobby" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
