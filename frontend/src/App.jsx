import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import TodoList from './pages/Dashboard/TodoList';
import HabitTracker from './pages/Dashboard/HabitTracker';
import Calendar from './pages/Dashboard/Calendar';
import Journal from './pages/Dashboard/Journal';
import Countdown from './pages/Dashboard/Countdown';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import Settings from './pages/Dashboard/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<LandingPage />} />

        {/* KHU VỰC DÀNH RIÊNG CHO NGƯỜI DÙNG (USER)  */}
        <Route element={<ProtectedRoute allowedRole="user"><MainLayout /></ProtectedRoute>}>
          <Route path="/app" element={<Dashboard />} />
          <Route path="/todo" element={<TodoList />} />
          <Route path="/habit" element={<HabitTracker />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/timer" element={<Countdown />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* KHU VỰC DÀNH RIÊNG CHO QUẢN TRỊ VIÊN (ADMIN)  */}
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
    </BrowserRouter>
  );
}

export default App;