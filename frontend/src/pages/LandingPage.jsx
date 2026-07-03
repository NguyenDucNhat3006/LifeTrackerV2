import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Sparkles, Mail, Check, AlertCircle } from 'lucide-react';
import logo from '../assets/logo/logo.png';
import loopydingu from '../assets/pictures/loopydingu.jpg';
import loopydivesinh from '../assets/pictures/loopydivesinh.jpg';
import loopyhamieng from '../assets/pictures/loopyhamieng.jpg';
import loopykhoc from '../assets/pictures/loopykhoc.jpg';
import loopynguvakhoc from '../assets/pictures/loopynguvakhoc.jpg';

const LandingPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [emailStatus, setEmailStatus] = useState('');
    const [isLoadingEmail, setIsLoadingEmail] = useState(false);

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

    // Handle Newsletter Signup
    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;
        
        setIsLoadingEmail(true);
        try {
            // Gửi đến Formspree (miễn phí)
            const res = await fetch('https://formspree.io/f/meogjpvk', {
                method: 'POST',
                body: JSON.stringify({ email, message: 'Newsletter signup' }),
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (res.ok) {
                setEmailStatus('success');
                setEmail('');
                setTimeout(() => setEmailStatus(''), 3000);
            } else {
                setEmailStatus('error');
            }
        } catch (err) {
            setEmailStatus('error');
        } finally {
            setIsLoadingEmail(false);
        }
    };

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

                <div className="w-100 rounded-4 overflow-hidden mb-5 bg-white shadow-sm border border-light"
                    style={{ maxWidth: '900px', height: '300px' }}>
                    <img src={loopydingu} alt="LifeTracker Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
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
                            <div className="rounded-3 overflow-hidden mt-auto" style={{ height: '128px', backgroundColor: '#f3f4f6' }}>
                                <img src={loopyhamieng} alt="Quản lý công việc" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="card h-100 p-4 rounded-4 bg-white border-0 shadow-sm d-flex flex-column">
                            <h5 className="fw-bold text-center mb-3" style={{ color: '#1e3a8a' }}>Xây dựng kỷ luật</h5>
                            <p className="small text-secondary text-center mb-4">Đánh dấu những việc làm tốt mỗi ngày để duy trì động lực và bỏ thói quen xấu</p>
                            <div className="rounded-3 overflow-hidden mt-auto" style={{ height: '128px', backgroundColor: '#f3f4f6' }}>
                                <img src={loopydivesinh} alt="Xây dựng kỷ luật" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="card h-100 p-4 rounded-4 bg-white border-0 shadow-sm d-flex flex-column">
                            <h5 className="fw-bold text-center mb-3" style={{ color: '#1e3a8a' }}>Bao quát tiến độ</h5>
                            <p className="small text-secondary text-center mb-4">Mọi lịch trình và deadline trên một màn hình, giúp bạn luôn đi trước một bước</p>
                            <div className="rounded-3 overflow-hidden mt-auto" style={{ height: '128px', backgroundColor: '#f3f4f6' }}>
                                <img src={loopykhoc} alt="Bao quát tiến độ" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="card h-100 p-4 rounded-4 bg-white border-0 shadow-sm d-flex flex-column">
                            <h5 className="fw-bold text-center mb-3" style={{ color: '#1e3a8a' }}>Không gian riêng tư</h5>
                            <p className="small text-secondary text-center mb-4">Góc an toàn để bạn tự do ghi chép, nhìn lại bản thân và giải tỏa áp lực</p>
                            <div className="rounded-3 overflow-hidden mt-auto" style={{ height: '128px', backgroundColor: '#f3f4f6' }}>
                                <img src={loopynguvakhoc} alt="Không gian riêng tư" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* NEWSLETTER SECTION */}
            <section className="py-5" style={{ backgroundColor: '#1e3a8a' }}>
                <div className="container text-center text-white" style={{ maxWidth: '600px' }}>
                    <h2 className="display-6 fw-bold mb-3">Nhận cập nhật mới nhất</h2>
                    <p className="lead mb-4" style={{ color: '#e0e7ff' }}>
                        Đăng ký email để nhận những mẹo, cập nhật tính năng và ưu đãi đặc biệt
                    </p>
                    
                    <form onSubmit={handleNewsletterSubmit} className="d-flex gap-2 flex-wrap">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Nhập email của bạn"
                            className="form-control form-control-lg rounded-3"
                            style={{ flex: 1, minWidth: '200px' }}
                            required
                            disabled={isLoadingEmail}
                        />
                        <button
                            type="submit"
                            className="btn btn-light fw-bold px-4 rounded-3"
                            disabled={isLoadingEmail}
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            {isLoadingEmail ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" style={{ display: 'inline-block' }} />
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <Mail size={20} className="me-2" style={{ display: 'inline' }} />
                                    Đăng ký
                                </>
                            )}
                        </button>
                    </form>

                    {/* Status Message */}
                    {emailStatus === 'success' && (
                        <div className="alert alert-success d-flex align-items-center gap-2 mt-3 mb-0">
                            <Check size={20} style={{ display: 'inline-flex' }} />
                            <span>✅ Cảm ơn! Vui lòng kiểm tra email xác nhận</span>
                        </div>
                    )}
                    {emailStatus === 'error' && (
                        <div className="alert alert-danger d-flex align-items-center gap-2 mt-3 mb-0">
                            <AlertCircle size={20} style={{ display: 'inline-flex' }} />
                            <span>❌ Lỗi. Vui lòng thử lại sau</span>
                        </div>
                    )}
                </div>
            </section>

            {/* TECHNICAL SPECS SECTION */}
            <section className="py-5 bg-white">
                <div className="container" style={{ maxWidth: '1140px' }}>
                    <h2 className="text-center fw-bold mb-5" style={{ color: '#1e3a8a', fontSize: '2.5rem' }}>
                        Tại sao chọn LifeTracker?
                    </h2>
                    
                    <div className="row g-4">
                        <div className="col-md-3 text-center">
                            <div className="display-6 fw-bold" style={{ color: '#2563eb' }}>1000+</div>
                            <p className="text-secondary">Người dùng tích cực</p>
                        </div>
                        <div className="col-md-3 text-center">
                            <div className="display-6 fw-bold" style={{ color: '#2563eb' }}>99.9%</div>
                            <p className="text-secondary">Tính khả dụng</p>
                        </div>
                        <div className="col-md-3 text-center">
                            <div className="display-6 fw-bold" style={{ color: '#2563eb' }}>50+</div>
                            <p className="text-secondary">Tính năng</p>
                        </div>
                        <div className="col-md-3 text-center">
                            <div className="display-6 fw-bold" style={{ color: '#2563eb' }}>24/7</div>
                            <p className="text-secondary">Hỗ trợ khách hàng</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-4 bg-dark text-white text-center">
                <div className="container">
                    <p className="mb-2">© 2024 LifeTracker. All rights reserved.</p>
                    <div className="d-flex justify-content-center gap-3 flex-wrap">
                        <a href="#" className="text-white text-decoration-none">Điều khoản</a>
                        <a href="#" className="text-white text-decoration-none">Chính sách</a>
                        <a href="#" className="text-white text-decoration-none">Liên hệ</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;