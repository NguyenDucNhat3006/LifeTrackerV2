import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Store, Settings, Sparkles, 
  Search, Menu, LogOut, User, ChevronLeft, ChevronRight, X, Clock, Mail, ShieldAlert
} from 'lucide-react';
import logo from '../../assets/logo/logo.png';

//URL 
import API_URL from '../../config/api';

const UserManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const [selectedUser, setSelectedUser] = useState(null);

  const API_BASE_URL = API_URL + '/api';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/read_users.php`);
        if (Array.isArray(response.data)) setUsers(response.data);
      } catch (error) {
        console.error("Lỗi lấy danh sách user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleLogout = () => {
    if(window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi trang Quản trị?")) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    }
  };

  // ==========================================
  // HÀM XỬ LÝ KHÓA/MỞ KHÓA TÀI KHOẢN
  // ==========================================
  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'locked' ? 'active' : 'locked';
    const confirmMsg = newStatus === 'locked' 
      ? "Bạn có chắc chắn muốn KHÓA tài khoản này? Người dùng sẽ không thể đăng nhập." 
      : "Bạn muốn MỞ KHÓA cho tài khoản này?";

    if (!window.confirm(confirmMsg)) return;

    try {
      await axios.put(`${API_BASE_URL}/admin/update_user_status.php`, {
        id: userId,
        status: newStatus
      });

      // Cập nhật lại State để UI tự động thay đổi mà không cần load lại trang
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      setSelectedUser(prev => ({ ...prev, status: newStatus }));
      alert("Đã cập nhật trạng thái thành công!");

    } catch (error) {
      alert("Có lỗi xảy ra khi cập nhật trạng thái.");
      console.error(error);
    }
  };

  const isActiveMenu = (path) => location.pathname === path;

  let processedUsers = users.filter(u => {
    const matchSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.id.toString().includes(searchQuery);
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  processedUsers.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(processedUsers.length / usersPerPage) || 1;
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = processedUsers.slice(indexOfFirstUser, indexOfLastUser);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, sortOrder]);

  const renderStatus = (status) => {
    const configs = {
      'active': { text: 'Hoạt động', color: '#10b981', bg: '#d1fae5' },
      'locked': { text: 'Bị khóa', color: '#ef4444', bg: '#fee2e2' },
      'monitored': { text: 'Theo dõi', color: '#f59e0b', bg: '#fef3c7' }
    };
    const config = configs[status] || configs['active'];
    return (
      <span className="badge rounded-pill d-inline-flex align-items-center gap-1 px-2 py-1" style={{ backgroundColor: config.bg, color: config.color, fontWeight: '500' }}>
        <span className="rounded-circle" style={{ width: '6px', height: '6px', backgroundColor: config.color }}></span>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Chưa ghi nhận';
    return new Date(dateStr).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="d-flex" style={{ height: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* SIDEBAR */}
      <div className="bg-white border-end d-flex flex-column flex-shrink-0 transition-all" style={{ width: '260px' }}>
        <div className="d-flex align-items-center justify-content-between p-3 mb-2">
          <div className="d-flex align-items-center gap-3">
            <img src={logo} alt="LifeTracker Logo" className="" style={{ width: '60px', height: '40px', objectFit: 'cover' }} />
            <div>
              <h5 className="fw-bold m-0" style={{ color: '#1e3a8a', fontSize: '18px' }}>LifeTracker</h5>
              <span className="text-secondary" style={{ fontSize: '12px' }}>Quản trị</span>
            </div>
          </div>
          <button className="btn border-0 p-1 text-secondary d-lg-none"><Menu size={24} /></button>
        </div>
        
        <hr className="m-0 mb-3 text-secondary opacity-25" />

        <div className="d-flex flex-column gap-1 px-3 flex-grow-1">
          <Link to="/admin" className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none fw-medium transition-all ${isActiveMenu('/admin') ? 'text-white shadow-sm' : 'text-secondary hover-bg-light'}`} style={{ backgroundColor: isActiveMenu('/admin') ? '#2563eb' : 'transparent' }}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/admin/users" className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none fw-medium transition-all ${isActiveMenu('/admin/users') ? 'text-white shadow-sm' : 'text-secondary hover-bg-light'}`} style={{ backgroundColor: isActiveMenu('/admin/users') ? '#2563eb' : 'transparent' }}>
            <Users size={20} /> Người dùng
          </Link>
          {/* <Link to="/admin/store" className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none fw-medium transition-all ${isActiveMenu('/admin/store') ? 'text-white shadow-sm' : 'text-secondary hover-bg-light'}`} style={{ backgroundColor: isActiveMenu('/admin/store') ? '#2563eb' : 'transparent' }}>
            <Store size={20} /> Cửa hàng
          </Link> */}
        </div>

        <div className="p-3 d-flex flex-column gap-1 border-top">
          {/* <Link to="/admin/settings" className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none fw-medium transition-all ${isActiveMenu('/admin/settings') ? 'text-white shadow-sm' : 'text-secondary hover-bg-light'}`} style={{ backgroundColor: isActiveMenu('/admin/settings') ? '#2563eb' : 'transparent' }}>
            <Settings size={20} /> Cài đặt
          </Link> */}
          <button onClick={handleLogout} className="btn btn-link text-decoration-none d-flex align-items-center gap-3 px-3 py-2 rounded-3 fw-medium transition-all w-100" style={{ color: '#ef4444', textAlign: 'left' }}>
            <LogOut size={20} /> Đăng xuất
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <div className="flex-grow-1 overflow-y-auto p-4 p-md-5">
          
          <div className="mb-4">
            <h2 className="fw-bold m-0" style={{ color: '#1e3a8a' }}>Quản lý người dùng</h2>
            <p className="text-secondary mt-1 m-0">Theo dõi, tìm kiếm và quản trị tài khoản người dùng</p>
          </div>

          <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
            
            <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
              <div className="position-relative" style={{ maxWidth: '400px', width: '100%' }}>
                <Search size={18} className="position-absolute text-secondary" style={{ top: '10px', left: '16px' }} />
                <input 
                  type="text" className="form-control border-0" style={{ backgroundColor: '#f1f5f9', paddingLeft: '44px', borderRadius: '8px' }} 
                  placeholder="Tìm kiếm theo ID, Tên, hoặc Email..." 
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="d-flex gap-3 align-items-center text-secondary small fw-medium">
                <div className="d-flex align-items-center gap-2">
                  Trạng thái: 
                  <select className="form-select form-select-sm border shadow-none" style={{ borderRadius: '8px', minWidth: '110px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">Tất cả</option>
                    <option value="active">Hoạt động</option>
                    <option value="monitored">Theo dõi</option>
                    <option value="locked">Bị khóa</option>
                  </select>
                </div>
                <div className="d-flex align-items-center gap-2">
                  Sắp xếp: 
                  <select className="form-select form-select-sm border shadow-none" style={{ borderRadius: '8px', minWidth: '120px' }} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="table-responsive rounded-3 border">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ backgroundColor: '#f8fafc' }}>
                  <tr>
                    <th className="text-secondary small fw-bold py-3 px-4 border-0">ID</th>
                    <th className="text-secondary small fw-bold py-3 px-4 border-0">NGƯỜI DÙNG</th>
                    <th className="text-secondary small fw-bold py-3 px-4 border-0">TRẠNG THÁI</th>
                    <th className="text-secondary small fw-bold py-3 px-4 border-0">NGÀY THAM GIA</th>
                    <th className="text-secondary small fw-bold py-3 px-4 border-0 text-end"></th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {loading ? (
                    <tr><td colSpan="5" className="text-center py-4 text-secondary">Đang tải dữ liệu...</td></tr>
                  ) : currentUsers.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-4 text-secondary fst-italic">Không tìm thấy người dùng nào phù hợp.</td></tr>
                  ) : (
                    currentUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="px-4 py-3 fw-medium text-secondary" style={{ fontSize: '14px' }}>#{u.id.toString().padStart(4, '0')}</td>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center text-secondary border" style={{ width: '40px', height: '40px' }}>
                              <User size={20} />
                            </div>
                            <div>
                              <p className="m-0 fw-medium text-dark" style={{ fontSize: '14px' }}>{u.username}</p>
                              <p className="m-0 text-secondary" style={{ fontSize: '12px' }}>{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {renderStatus(u.status)}
                        </td>
                        <td className="px-4 py-3 text-secondary" style={{ fontSize: '14px' }}>
                          {formatDate(u.created_at).split(' ')[1]}
                        </td>
                        <td className="px-4 py-3 text-end">
                          <button onClick={() => setSelectedUser(u)} className="btn btn-link text-decoration-none fw-medium p-0" style={{ fontSize: '13px', color: '#2563eb' }}>Chi tiết</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {processedUsers.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-4">
                <span className="text-secondary small">
                  Hiển thị {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, processedUsers.length)} của {processedUsers.length} user
                </span>
                <div className="d-flex gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn btn-sm btn-light border d-flex align-items-center justify-content-center text-secondary" style={{ width: '32px', height: '32px' }}><ChevronLeft size={16}/></button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                    <button key={num} onClick={() => setCurrentPage(num)} className={`btn btn-sm d-flex align-items-center justify-content-center fw-medium ${currentPage === num ? 'text-white' : 'btn-light border text-secondary'}`} style={{ width: '32px', height: '32px', backgroundColor: currentPage === num ? '#2563eb' : '' }}>
                      {num}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn btn-sm btn-light border d-flex align-items-center justify-content-center text-secondary" style={{ width: '32px', height: '32px' }}><ChevronRight size={16}/></button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ==========================================
          MODAL CHI TIẾT NGƯỜI DÙNG
      ========================================== */}
      {selectedUser && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
           <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ width: '450px' }}>
              
              <div className="d-flex justify-content-between align-items-center p-4 bg-light border-bottom">
                 <h5 className="fw-bold m-0 d-flex align-items-center gap-2" style={{ color: '#1e3a8a' }}>
                    <ShieldAlert size={20} /> Thông tin tài khoản
                 </h5>
                 <button onClick={() => setSelectedUser(null)} className="btn btn-link text-secondary p-0"><X size={20}/></button>
              </div>
              
              <div className="p-4">
                <div className="d-flex align-items-center gap-4 mb-4 pb-4 border-bottom">
                   <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style={{ width: '60px', height: '60px', backgroundColor: '#2563eb', fontSize: '20px' }}>
                      {selectedUser.username.substring(0, 2).toUpperCase()}
                   </div>
                   <div>
                      <h5 className="fw-bold mb-1">{selectedUser.username}</h5>
                      <span className="text-secondary small d-flex align-items-center gap-1"><Mail size={14}/> {selectedUser.email}</span>
                   </div>
                </div>

                <div className="d-flex flex-column gap-3 mb-4">
                  <div className="row">
                     <div className="col-5 text-secondary small fw-medium">ID Hệ thống:</div>
                     <div className="col-7 fw-bold">#{selectedUser.id.toString().padStart(4, '0')}</div>
                  </div>
                  <div className="row">
                     <div className="col-5 text-secondary small fw-medium">Trạng thái:</div>
                     <div className="col-7">{renderStatus(selectedUser.status)}</div>
                  </div>
                  <div className="row">
                     <div className="col-5 text-secondary small fw-medium">Ngày đăng ký:</div>
                     <div className="col-7 fw-medium text-dark">{formatDate(selectedUser.created_at)}</div>
                  </div>
                  <div className="row">
                     <div className="col-5 text-secondary small fw-medium">Lần hoạt động cuối:</div>
                     <div className="col-7 fw-medium text-primary d-flex align-items-center gap-1">
                        <Clock size={14}/> {formatDate(selectedUser.last_active)}
                     </div>
                  </div>
                </div>

                {/* Các nút hành động quản trị (Hoạt động 100%) */}
                <div className="d-flex gap-2">
                   {selectedUser.status === 'locked' ? (
                     <button onClick={() => handleToggleStatus(selectedUser.id, selectedUser.status)} className="btn btn-success flex-grow-1 fw-medium">Mở khóa tài khoản</button>
                   ) : (
                     <button onClick={() => handleToggleStatus(selectedUser.id, selectedUser.status)} className="btn btn-outline-danger flex-grow-1 fw-medium border-2">Khóa tài khoản</button>
                   )}
                   
                   {/* Nút Gửi Email dùng mailto để mở ứng dụng mail mặc định */}
                   <a 
                     href={`mailto:${selectedUser.email}?subject=Thông báo từ Ban quản trị LifeTracker`} 
                     className="btn btn-light border flex-grow-1 fw-medium text-secondary d-flex align-items-center justify-content-center text-decoration-none"
                   >
                     Gửi Email
                   </a>
                </div>
              </div>
              
           </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;