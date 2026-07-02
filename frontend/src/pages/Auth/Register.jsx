import { useState, useEffect } from "react";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import logo from '../../assets/logo/logo.png';

import API_URL from "../../config/api";

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // KIỂM TRA ĐÃ ĐĂNG NHẬP CHƯA
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const isAdmin = user.role === 'admin' || user.email === 'admin';
                navigate(isAdmin ? '/admin' : '/app');
            } catch(e) { }
        }
    }, [navigate]);

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value })
    };

    const handleSubmit = async (event) => {
        event.preventDefault(); 
        setLoading(true); 
        setMessage({ type: '', text: '' }); 

        try {
            const response = await axios.post( API_URL + '/api/users/register.php', formData);
            setMessage({ type: 'success', text: response.data.message });
            setFormData({ username: '', email: '', password: '' });
            setTimeout(() => { navigate('/login'); }, 1500); // Đăng ký xong chuyển sang trang đăng nhập
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Có lỗi kết nối đến server!';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center px-3" style={{ backgroundColor: '#f0f4f8', fontFamily: 'sans-serif' }}>
            
            {/* THÊM LOGO VÀ SLOGAN */}
            <div className="text-center mb-4">
                <img src={logo} alt="LifeTracker Logo" className="mb-3" style={{ width: '100px', height: '65px', objectFit: 'cover' }} />
                <h2 className="fw-bold m-0" style={{ color: '#1e3a8a', letterSpacing: '1px' }}>LifeTracker</h2>
                <p className="text-secondary mt-2 fw-medium">Tối ưu công việc, làm chủ thời gian</p>
            </div>

            {/* THẺ FORM ĐĂNG KÝ */}
            <div className="card w-100 rounded-4 shadow-sm p-4 p-md-5 border-0 mb-4" style={{ maxWidth: '420px', backgroundColor: '#ffffff' }}>
                <div className="mb-4">
                    <h4 className="fw-bold mb-2" style={{ color: '#1e293b' }}>Tạo tài khoản</h4>
                    <p className="text-secondary small m-0">Bắt đầu phát triển bản thân ngay hôm nay</p>
                </div>

                {message.text && (
                    <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} py-2 small fw-medium`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                    <div>
                        <label className="fw-bold small mb-2" style={{ color: '#1e293b' }}>Họ và tên</label>
                        <input 
                            type="text" name="username" value={formData.username} onChange={handleChange} required
                            className="form-control shadow-none px-3 py-2 rounded-3 border-0"
                            style={{ backgroundColor: '#f1f5f9', color: '#1e293b' }}
                            placeholder="VD: Nguyễn Văn A" 
                        />
                    </div>

                    <div>
                        <label className="fw-bold small mb-2" style={{ color: '#1e293b' }}>Email</label>
                        <input 
                            type="email" name="email" value={formData.email} onChange={handleChange} required
                            className="form-control shadow-none px-3 py-2 rounded-3 border-0"
                            style={{ backgroundColor: '#f1f5f9', color: '#1e293b' }}
                            placeholder="you@example.com" 
                        />
                    </div>

                    <div>
                        <label className="fw-bold small mb-2" style={{ color: '#1e293b' }}>Mật khẩu</label>
                        <input 
                            type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6"
                            className="form-control shadow-none px-3 py-2 rounded-3 border-0"
                            style={{ backgroundColor: '#f1f5f9', color: '#1e293b' }}
                            placeholder="Tối thiểu 6 ký tự" 
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn w-100 py-2 fw-bold rounded-3 mt-3 d-flex justify-content-center align-items-center text-white shadow-sm transition-all" style={{ backgroundColor: '#2563eb' }}>
                        {loading ? <><span className="spinner-border spinner-border-sm me-2"></span> Đang xử lý...</> : 'Đăng ký'}
                    </button>
                </form>
            </div>

            <div className="text-secondary small fw-medium">
                Đã có tài khoản? <Link to="/login" className="fw-bold text-decoration-none ms-1" style={{ color: '#2563eb' }}>Đăng nhập</Link>
            </div>
        </div>
    );
};

export default Register;