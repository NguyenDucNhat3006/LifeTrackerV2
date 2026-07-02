import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import logo from '../assets/logo/logo.png';

const LandingPage = () => {
    const navigate = useNavigate();

    // KIỂM TRA ĐÃ ĐĂNG NHẬP CHƯA
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const isAdmin = user.role === 'admin' || user.email === 'admin';
                navigate(isAdmin ? '/admin' : '/app');
            } catch (e) { }
        }
    }, [navigate]);

    return (
        <div className="min-vh-100" style={{ backgroundColor: '#f0f4f8', color: '#1e293b', fontFamily: 'sans-serif' }}>

            {/* HEADER */}
            <header className="d-flex justify-content-between align-items-center px-4 py-3 bg-white shadow-sm">
                <div className="d-flex align-items-center gap-2">
                    <img src={logo} alt="LifeTracker Logo" className="" style={{ width: '100px', height: '65px', objectFit: 'cover' }} />
                    <div className="fs-3 fw-bold" style={{ color: '#1e3a8a', letterSpacing: '0.5px' }}>
                        LifeTracker
                    </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <Link to="/login" className="text-decoration-none fw-bold" style={{ color: '#475569' }}>Đăng nhập</Link>
                    <Link to="/register" className="btn fw-bold px-4 py-2 rounded-3 text-white shadow-sm" style={{ backgroundColor: '#2563eb' }}>
                        Đăng ký
                    </Link>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="container py-5 d-flex flex-column align-items-center text-center mt-5">
                <h1 className="display-4 fw-bold mb-5" style={{ color: '#1e3a8a' }}>Tối ưu công việc, làm chủ thời gian</h1>

                <div className="w-100 rounded-4 d-flex align-items-center justify-content-center mb-5 bg-white shadow-sm border border-light"
                    style={{ maxWidth: '900px', height: '300px' }}>
                    <p className="text-secondary fst-italic m-0">*Ảnh dashboard minh họa*</p>
                </div>

                <Link to="/register" className="btn btn-lg fw-bold px-5 py-3 rounded-pill mb-5 shadow text-white transition-all hover-shadow"
                    style={{ backgroundColor: '#2563eb' }}>
                    Trải nghiệm miễn phí ngay
                </Link>

                {/* GRID TÍNH NĂNG */}
                <div className="row g-4 w-100" style={{ maxWidth: '1140px' }}>

                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="card h-100 p-4 rounded-4 bg-white border-0 shadow-sm d-flex flex-column transition-all hover-shadow">
                            <h5 className="fw-bold text-center mb-3" style={{ color: '#1e3a8a' }}>Quản lý công việc</h5>
                            <p className="small text-secondary text-center mb-4">Chia nhỏ mục tiêu và theo dõi tiến độ dễ dàng chỉ bằng thao tác kéo - thả</p>
                            <div className="rounded-3 d-flex align-items-center justify-content-center mt-auto" style={{ height: '128px', backgroundColor: '#f3f4f6' }}>
                                <span className="small text-secondary">*Ảnh tab task*</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="card h-100 p-4 rounded-4 bg-white border-0 shadow-sm d-flex flex-column">
                            <h5 className="fw-bold text-center mb-3" style={{ color: '#1e3a8a' }}>Xây dựng kỷ luật</h5>
                            <p className="small text-secondary text-center mb-4">Đánh dấu những việc làm tốt mỗi ngày để duy trì động lực và bỏ thói quen xấu</p>
                            <div className="rounded-3 d-flex align-items-center justify-content-center mt-auto" style={{ height: '128px', backgroundColor: '#f3f4f6' }}>
                                <span className="small text-secondary">*Ảnh tab habit*</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="card h-100 p-4 rounded-4 bg-white border-0 shadow-sm d-flex flex-column">
                            <h5 className="fw-bold text-center mb-3" style={{ color: '#1e3a8a' }}>Bao quát tiến độ</h5>
                            <p className="small text-secondary text-center mb-4">Mọi lịch trình và deadline trên một màn hình, giúp bạn luôn đi trước một bước</p>
                            <div className="rounded-3 d-flex align-items-center justify-content-center mt-auto" style={{ height: '128px', backgroundColor: '#f3f4f6' }}>
                                <span className="small text-secondary">*Ảnh tab calendar*</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="card h-100 p-4 rounded-4 bg-white border-0 shadow-sm d-flex flex-column">
                            <h5 className="fw-bold text-center mb-3" style={{ color: '#1e3a8a' }}>Không gian riêng tư</h5>
                            <p className="small text-secondary text-center mb-4">Góc an toàn để bạn tự do ghi chép, nhìn lại bản thân và giải tỏa áp lực</p>
                            <div className="rounded-3 d-flex align-items-center justify-content-center mt-auto" style={{ height: '128px', backgroundColor: '#f3f4f6' }}>
                                <span className="small text-secondary">*Ảnh tab nhật ký*</span>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default LandingPage;