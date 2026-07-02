import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles } from 'lucide-react';
import logo from '../../assets/logo/logo.png';

import API_URL from '../../config/api';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // 1. KIỂM TRA ĐÃ ĐĂNG NHẬP CHƯA
    useEffect(() => {
        const checkLoggedIn = () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    // Nếu là admin thì đẩy vào trang admin, ngược lại đẩy vào /app
                    const isAdmin = user.role === 'admin' || user.email === 'admin';
                    navigate(isAdmin ? '/admin' : '/app');
                } catch (e) {
                    localStorage.removeItem('user');
                }
            }
        };
        checkLoggedIn();
    }, [navigate]);

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await axios.post(
                API_URL + '/api/users/login.php', formData
            );

            const loggedInUser = response.data.user;
            localStorage.setItem('user', JSON.stringify(loggedInUser));
            setMessage({ type: 'success', text: response.data.message });

            // 2. CHUYỂN HƯỚNG DỰA THEO ROLE (Vai trò)
            const isAdmin = loggedInUser.role === 'admin' || formData.email === 'admin';
            setTimeout(() => { navigate(isAdmin ? '/admin' : '/app'); }, 1000);

        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Lỗi kết nối đến server LifeTracker!!';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center px-3" style={{ backgroundColor: '#f0f4f8', fontFamily: 'sans-serif' }}>

            {/* THÊM LOGO VÀ SLOGAN */}
            <div className="text-center mb-4">
                <img src={logo} alt="LifeTracker Logo" className="mb-3" style={{ width: '100px', height: '65px', objectFit: 'cover' }} />
                <h2 className="fw-bold m-0" style={{ color: '#1e3a8a', letterSpacing: '1px' }}>LifeTracker</h2>
                <p className="text-secondary mt-2 fw-medium">Tối ưu công việc, làm chủ thời gian</p>
            </div>

            {/* THẺ FORM ĐĂNG NHẬP */}
            <div className="card w-100 rounded-4 shadow-sm p-4 p-md-5 border-0 mb-4" style={{ maxWidth: '420px', backgroundColor: '#ffffff' }}>
                <div className="mb-4">
                    <h4 className="fw-bold mb-2" style={{ color: '#1e293b' }}>Chào mừng trở lại 👋</h4>
                    <p className="text-secondary small m-0">Đăng nhập để tiếp tục hành trình của bạn</p>
                </div>

                {message.text && (
                    <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} py-2 small fw-medium`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                    <div>
                        <label className="fw-bold small mb-2" style={{ color: '#1e293b' }}>Email hoặc Tài khoản</label>
                        <input
                            type="text" name="email" value={formData.email} onChange={handleChange} required
                            className="form-control shadow-none px-3 py-2 rounded-3 border-0"
                            style={{ backgroundColor: '#f1f5f9', color: '#1e293b' }}
                            placeholder="you@example.com hoặc admin"
                        />
                    </div>

                    <div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <label className="fw-bold small m-0" style={{ color: '#1e293b' }}>Mật khẩu</label>
                            <a href="#" className="text-decoration-none small" style={{ color: '#2563eb' }}>Quên mật khẩu?</a>
                        </div>
                        <input
                            type="password" name="password" value={formData.password} onChange={handleChange} required
                            className="form-control shadow-none px-3 py-2 rounded-3 border-0"
                            style={{ backgroundColor: '#f1f5f9', color: '#1e293b' }}
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn w-100 py-2 fw-bold rounded-3 mt-3 d-flex justify-content-center align-items-center text-white transition-all shadow-sm" style={{ backgroundColor: '#2563eb' }}>
                        {loading ? <><span className="spinner-border spinner-border-sm me-2"></span> Đang xử lý...</> : 'Đăng nhập'}
                    </button>

                    <p className="text-center text-secondary m-0 mt-3" style={{ fontSize: '12px' }}>
                        Mẹo: dùng <span className="text-primary fw-medium">admin</span> / <span className="text-primary fw-medium">admin</span> để vào trang quản trị
                    </p>
                </form>
            </div>

            <div className="text-secondary small fw-medium">
                Chưa có tài khoản? <Link to="/register" className="fw-bold text-decoration-none ms-1" style={{ color: '#2563eb' }}>Đăng ký ngay</Link>
            </div>
        </div>
    );
}

export default Login;