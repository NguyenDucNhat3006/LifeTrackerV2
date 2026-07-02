import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Store, Settings, Sparkles, 
  Download, TrendingUp, AlertTriangle, CheckCircle, MessageSquare, Menu, LogOut
} from 'lucide-react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import logo from '../../assets/logo/logo.png';


//URL
import API_URL from '../../config/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [dashboardData, setDashboardData] = useState({
    kpis: { total_users: 0, online_users: 0, new_users: 0, inactive_users: 0 },
    growthData: [],
    featureData: [],
    alerts: []
  });
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const API_BASE_URL = API_URL + '/api';

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/dashboard.php`);
        if (response.data && response.data.kpis) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu Admin:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleLogout = () => {
    if(window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi trang Quản trị?")) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  // ==========================================
  // HÀM XUẤT BÁO CÁO PDF
  // ==========================================
  const exportToPDF = async () => {
    setIsExporting(true);
    const element = document.getElementById('dashboard-content');
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bao_Cao_He_Thong_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.pdf`);
    } catch (error) {
      console.error("Lỗi xuất PDF: ", error);
      alert("Có lỗi xảy ra khi xuất báo cáo.");
    } finally {
      setIsExporting(false);
    }
  };

  // ==========================================
  // TÙY CHỈNH NHÃN CHO BIỂU ĐỒ TRÒN
  // ==========================================
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent === 0) return null;
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center h-100 vh-100 text-secondary">Đang tải dữ liệu hệ thống...</div>;

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
          <Link to="/admin" className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none fw-medium transition-all ${isActive('/admin') ? 'text-white shadow-sm' : 'text-secondary hover-bg-light'}`} style={{ backgroundColor: isActive('/admin') ? '#2563eb' : 'transparent' }}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/admin/users" className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none fw-medium transition-all ${isActive('/admin/users') ? 'text-white shadow-sm' : 'text-secondary hover-bg-light'}`} style={{ backgroundColor: isActive('/admin/users') ? '#2563eb' : 'transparent' }}>
            <Users size={20} /> Người dùng
          </Link>
          {/* <Link to="/admin/store" className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none fw-medium transition-all ${isActive('/admin/store') ? 'text-white shadow-sm' : 'text-secondary hover-bg-light'}`} style={{ backgroundColor: isActive('/admin/store') ? '#2563eb' : 'transparent' }}>
            <Store size={20} /> Cửa hàng
          </Link> */}
        </div>

        <div className="p-3 d-flex flex-column gap-1 border-top">
          {/* <Link to="/admin/settings" className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none fw-medium transition-all ${isActive('/admin/settings') ? 'text-white shadow-sm' : 'text-secondary hover-bg-light'}`} style={{ backgroundColor: isActive('/admin/settings') ? '#2563eb' : 'transparent' }}>
            <Settings size={20} /> Cài đặt
          </Link> */}
          <button onClick={handleLogout} className="btn btn-link text-decoration-none d-flex align-items-center gap-3 px-3 py-2 rounded-3 fw-medium transition-all w-100" style={{ color: '#ef4444', textAlign: 'left' }}>
            <LogOut size={20} /> Đăng xuất
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <div className="flex-grow-1 overflow-y-auto p-4 p-md-5" id="dashboard-content">
          
          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-end mb-4" data-html2canvas-ignore>
            <div>
              <h2 className="fw-bold m-0" style={{ color: '#1e3a8a' }}>Dashboard</h2>
              <p className="text-secondary mt-1 m-0">Tổng quan vận hành hệ thống</p>
            </div>
            <div className="d-flex gap-2">
              <select className="form-select bg-white border shadow-sm fw-medium text-secondary" style={{ width: '120px' }}>
                <option>Tháng này</option>
                <option>Tuần này</option>
                <option>Năm nay</option>
              </select>
              <button 
                onClick={exportToPDF}
                disabled={isExporting}
                className="btn text-white fw-bold d-flex align-items-center gap-2 px-3 shadow-sm transition-all" 
                style={{ backgroundColor: '#2563eb' }}
              >
                {isExporting ? <><span className="spinner-border spinner-border-sm"></span> Đang xuất...</> : <><Download size={18} /> Xuất báo cáo</>}
              </button>
            </div>
          </div>

          {/* KPI CARDS ROW */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white" style={{ border: '1px solid #bfdbfe !important' }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center gap-2 text-secondary fw-medium small"><Users size={16} color="#3b82f6" /> <span>Tổng user</span></div>
                  <TrendingUp size={18} color="#3b82f6" />
                </div>
                <h2 className="fw-bold m-0" style={{ color: '#3b82f6' }}>{dashboardData.kpis.total_users.toLocaleString()}</h2>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0 !important' }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center gap-2 text-secondary fw-medium small">
                    <span className="position-relative d-flex h-3 w-3"><span className="position-absolute rounded-circle opacity-75" style={{ width: '10px', height: '10px', backgroundColor: '#22c55e' }}></span></span>
                    <span>User trực tuyến</span>
                  </div>
                  <TrendingUp size={18} color="#22c55e" />
                </div>
                <h2 className="fw-bold m-0" style={{ color: '#22c55e' }}>{dashboardData.kpis.online_users}</h2>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white" style={{ border: '1px solid #bfdbfe !important' }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center gap-2 text-secondary fw-medium small"><Users size={16} color="#3b82f6" /> <span>User mới hôm nay</span></div>
                  <TrendingUp size={18} color="#3b82f6" />
                </div>
                <h2 className="fw-bold m-0" style={{ color: '#3b82f6' }}>+{dashboardData.kpis.new_users}</h2>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca !important' }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center gap-2 text-secondary fw-medium small"><Users size={16} color="#ef4444" /> <span>Không hoạt động (&gt;30 ngày)</span></div>
                  <TrendingUp size={18} color="#ef4444" style={{ transform: 'scaleY(-1)' }} />
                </div>
                <h2 className="fw-bold m-0" style={{ color: '#ef4444' }}>{dashboardData.kpis.inactive_users}</h2>
              </div>
            </div>
          </div>

          {/* CHARTS ROW */}
          <div className="row g-4 mb-4">
            
            {/* Combo Chart - ĐÃ THÊM WIDTH/HEIGHT CHO RESPONSIVE CONTAINER */}
            <div className="col-12 col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                <div className="d-flex flex-column gap-2 mb-4">
                  <h6 className="fw-bold m-0 d-flex align-items-center gap-2" style={{ color: '#1e3a8a' }}>
                    <TrendingUp size={18} color="#f97316" /> Tăng trưởng user & Xu hướng DAU (30 ngày)
                  </h6>
                  <div className="d-flex gap-4 small fw-medium text-secondary">
                    <div className="d-flex align-items-center gap-2"><div className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#3b82f6' }}></div> User mới</div>
                    <div className="d-flex align-items-center gap-2"><div style={{ width: '12px', height: '3px', backgroundColor: '#f97316' }}></div> Active Users</div>
                  </div>
                </div>
                
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dashboardData.growthData} margin={{ top: 20, right: 0, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} minTickGap={20} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar yAxisId="left" dataKey="newUser" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={20} />
                      <Line yAxisId="left" type="monotone" dataKey="dau" stroke="#f97316" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Donut Chart - ĐÃ THÊM WIDTH/HEIGHT CHO RESPONSIVE CONTAINER */}
            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                <h6 className="fw-bold mb-4" style={{ color: '#1e3a8a' }}>Tỷ lệ sử dụng tính năng</h6>
                
                <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center position-relative">
                  <div style={{ width: '100%', height: '220px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={dashboardData.featureData} 
                          cx="50%" cy="50%" 
                          innerRadius={60} outerRadius={100} 
                          paddingAngle={2} 
                          dataKey="value" 
                          stroke="none"
                          labelLine={false}
                          label={renderCustomizedLabel}
                        >
                          {dashboardData.featureData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="row w-100 mt-3 mx-0 px-2" style={{ fontSize: '13px' }}>
                    {dashboardData.featureData.map((item, idx) => (
                      <div key={idx} className="col-6 d-flex align-items-center gap-2 mb-2 text-secondary fw-medium">
                        <div className="rounded-circle" style={{ width: '12px', height: '12px', backgroundColor: item.color }}></div>
                        {item.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* TÓM TẮT SỨC KHỎE HỆ THỐNG */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
             <h6 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: '#1e3a8a' }}>
               <span style={{ color: '#ef4444' }}>❤️</span> Tóm tắt sức khỏe hệ thống & vận hành
             </h6>

             <div className="d-flex flex-column gap-3">
               {dashboardData.alerts.length === 0 ? (
                 <div className="text-secondary fst-italic text-center py-3">Hệ thống đang hoạt động ổn định, không có cảnh báo nào.</div>
               ) : (
                 dashboardData.alerts.map((alert) => {
                   let bgConfig = { bg: '#eff6ff', border: '#bfdbfe', icon: <MessageSquare size={18} color="#3b82f6" /> };
                   
                   if (alert.alert_type === 'warning') bgConfig = { bg: '#fffbeb', border: '#fde68a', icon: <AlertTriangle size={18} color="#f59e0b" />, btnBg: '#fef3c7', btnText: '#b45309' };
                   else if (alert.alert_type === 'info') bgConfig = { bg: '#eff6ff', border: '#bfdbfe', icon: <MessageSquare size={18} color="#3b82f6" /> };
                   else if (alert.alert_type === 'success') bgConfig = { bg: '#f0fdf4', border: '#bbf7d0', icon: <CheckCircle size={18} color="#22c55e" /> };

                   return (
                     <div key={alert.id} className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ backgroundColor: bgConfig.bg, border: `1px solid ${bgConfig.border}` }}>
                       <div className="d-flex align-items-center gap-3 text-secondary">
                         {bgConfig.icon}
                         <span className="fw-medium">{alert.message}</span>
                       </div>
                       {bgConfig.btnBg && (
                         <button className="btn btn-sm fw-medium" data-html2canvas-ignore style={{ backgroundColor: bgConfig.btnBg, color: bgConfig.btnText }}>Xem chi tiết</button>
                       )}
                     </div>
                   );
                 })
               )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;