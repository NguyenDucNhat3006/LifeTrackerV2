import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react'; // Import thêm công cụ để sử dụng kỹ thuật code splitting

import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

// import các trang dưới dạng Lazy load
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const TodoList = lazy(() => import('./pages/Dashboard/TodoList'));
const HabitTracker = lazy(() => import('./pages/Dashboard/HabitTracker'));
const Calendar = lazy(() => import('./pages/Dashboard/Calendar'));
const Journal = lazy(() => import('./pages/Dashboard/Journal'));
const Countdown = lazy(() => import('./pages/Dashboard/Countdown'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/Admin/UserManagement'));
const Settings = lazy(() => import('./pages/Dashboard/Settings'));

function App() {
  return (
    <BrowserRouter>
      <Suspense 
        fallback={
          <div className="d-flex justify-content-center align-items-center vh-100 bg-dark">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<LandingPage />} />

          <Route element={<ProtectedRoute allowedRole="user"><MainLayout /></ProtectedRoute>}>
            <Route path="/app" element={<Dashboard />} />
            <Route path="/todo" element={<TodoList />} />
            <Route path="/habit" element={<HabitTracker />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/timer" element={<Countdown />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="/admin" element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/users" element={
            <ProtectedRoute allowedRole="admin">
              <UserManagement />
            </ProtectedRoute>
          } />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;