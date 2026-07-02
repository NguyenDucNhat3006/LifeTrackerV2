import { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Flame,
  CalendarDays, Book, Timer, Store, Settings, LogOut, Menu
} from 'lucide-react';
import logo from '../assets/logo/logo.png'; // Đảm bảo đường dẫn logo này đúng với thư mục của bạn

const MainLayout = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, text: 'Tổng quan', path: '/app' },
    { icon: <CheckSquare size={20} />, text: 'Công việc', path: '/todo' },
    { icon: <Flame size={20} />, text: 'Thói quen', path: '/habit' },
    { icon: <CalendarDays size={20} />, text: 'Lịch', path: '/calendar' },
    { icon: <Book size={20} />, text: 'Nhật ký', path: '/journal' },
    { icon: <Timer size={20} />, text: 'Đếm ngược', path: '/timer' },
  ];

  return (
    <div className="d-flex vh-100 overflow-hidden" style={{ backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: 'sans-serif' }}>

      {/* ==========================================
          SIDEBAR (THANH ĐIỀU HƯỚNG BÊN TRÁI)
      ========================================== */}
      <aside
        className="bg-white border-end d-flex flex-column position-relative z-3"
        style={{ width: isExpanded ? '260px' : '80px', transition: 'width 0.3s ease' }}
      >
        {/* Nút thu gọn / Mở rộng (Chuẩn thiết kế: Nằm vắt ngang viền) */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="position-absolute bg-white d-flex align-items-center justify-content-center transition-all"
          style={{
            width: '32px',
            height: '32px',
            right: '-16px', // Kéo ra đúng một nửa để vắt ngang viền
            top: '36px',
            cursor: 'pointer',
            color: '#475569',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            zIndex: 10
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
        >
          <Menu size={18} strokeWidth={2.5} />
        </button>

        {/* Khu vực Logo (Tự co giãn khoảng trống khi thu nhỏ) */}
        <div 
          className={`d-flex align-items-center ${isExpanded ? 'px-4' : 'justify-content-center'} mt-4 mb-4`} 
          style={{ height: '44px' }}
        >
          <img 
            src={logo} 
            alt="LifeTracker Logo" 
            style={{ 
              width: isExpanded ? '44px' : '36px', 
              height: isExpanded ? '44px' : '36px', 
              objectFit: 'contain',
              transition: 'all 0.3s ease'
            }} 
          />
          {isExpanded && (
            <div className="d-flex flex-column text-nowrap ms-3 overflow-hidden">
              <span className="fw-bold fs-5 lh-1" style={{ color: '#1e3a8a' }}>LifeTracker</span>
              <span className="fw-medium" style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Phát triển bản thân</span>
            </div>
          )}
        </div>

        {/* Menu Navigation */}
        <nav className="flex-grow-1 px-3 py-2 overflow-y-auto d-flex flex-column gap-2" style={{ scrollbarWidth: 'thin' }}>
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) => `
                d-flex align-items-center gap-3 px-3 py-2 text-decoration-none transition-all
                ${!isExpanded ? 'justify-content-center' : ''}
              `}
              style={({ isActive }) => ({
                borderRadius: '12px',
                backgroundColor: isActive ? '#2563eb' : 'transparent',
                color: isActive ? 'white' : '#64748b',
                boxShadow: isActive ? '0 4px 6px -1px rgba(37, 99, 235, 0.2)' : 'none',
                fontWeight: 500
              })}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {isExpanded && <span className="text-truncate" style={{ fontSize: '14px' }}>{item.text}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Widget Level & Bottom Menu */}
        <div className="p-3 border-top mt-auto">
          <div className="d-flex flex-column gap-1">
            <NavLink
              to="/settings"
              className={({ isActive }) => `
                d-flex align-items-center gap-3 px-3 py-2 text-decoration-none transition-all
                ${!isExpanded ? 'justify-content-center' : ''}
              `}
              style={({ isActive }) => ({
                borderRadius: '12px',
                backgroundColor: isActive ? '#2563eb' : 'transparent',
                color: isActive ? 'white' : '#64748b',
                boxShadow: isActive ? '0 4px 6px -1px rgba(37, 99, 235, 0.2)' : 'none',
                fontWeight: 500
              })}
            >
              <div className="flex-shrink-0"><Settings size={20} /></div>
              {isExpanded && <span className="text-truncate" style={{ fontSize: '14px' }}>Cài đặt</span>}
            </NavLink>

            <button
              onClick={handleLogout}
              className={`btn border-0 d-flex align-items-center gap-3 px-3 py-2 w-100 transition-all ${!isExpanded ? 'justify-content-center' : ''}`}
              style={{ color: '#ef4444', fontSize: '14px', fontWeight: 500, borderRadius: '12px', textAlign: 'left' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div className="flex-shrink-0"><LogOut size={20} /></div>
              {isExpanded && <span>Đăng xuất</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ==========================================
          MAIN CONTENT AREA (NỘI DUNG CHÍNH)
      ========================================== */}
      <main className="flex-grow-1 overflow-y-auto h-100">
        <Outlet />
      </main>

    </div>
  );
};

export default MainLayout;