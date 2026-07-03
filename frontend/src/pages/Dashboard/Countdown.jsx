import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Calendar as CalendarIcon, Trash2, X } from 'lucide-react';
import API_URL from '../../config/api';
import { Helmet } from 'react-helmet-async';


const Countdown = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [countdowns, setCountdowns] = useState([]);

  // State Modal
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', targetDate: '', color: '#2563eb' });

  const API_BASE_URL = API_URL + '/api';
  const todayFormat = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

  // Thuật toán tính số ngày còn lại
  const calculateDaysLeft = (targetDate) => {
    const target = new Date(targetDate);
    const today = new Date();
    // Đưa về cùng thời điểm 00:00:00 để trừ cho chuẩn xác
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Lấy dữ liệu
  const fetchCountdowns = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/countdowns/read.php?user_id=${user.id}`);
      if (Array.isArray(res.data)) setCountdowns(res.data);
    } catch (e) { console.error("Lỗi tải dữ liệu:", e); }
  };

  useEffect(() => { fetchCountdowns(); }, []);

  // Thêm sự kiện mới
  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.targetDate) {
      alert("Vui lòng nhập đủ thông tin!"); return;
    }
    try {
      await axios.post(`${API_BASE_URL}/countdowns/create.php`, {
        user_id: user.id,
        title: newEvent.title,
        target_date: newEvent.targetDate,
        color: newEvent.color
      });
      setShowModal(false);
      setNewEvent({ title: '', targetDate: '', color: '#2563eb' });
      fetchCountdowns();
    } catch (e) { alert("Lỗi khi thêm sự kiện!"); }
  };

  // Xóa sự kiện
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa đếm ngược này?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/countdowns/delete.php`, { data: { id, user_id: user.id } });
      fetchCountdowns();
    } catch (e) { console.error(e); }
  };

  return (
    <><Helmet>
      <title>LifeTracker | Đếm ngược</title>
      <meta name="description" content="Theo dõi lịch trình sắp tới của bạn nhé" />
    </Helmet>

      <div className="container-fluid p-4 p-md-5 mx-auto h-100 position-relative" style={{ maxWidth: '1400px', fontFamily: 'sans-serif' }}>

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-end mb-5 flex-shrink-0">
          <div>
            <div className="d-flex align-items-center gap-3">
              <h1 className="fw-bold m-0" style={{ color: '#1e3a8a' }}>Đếm ngược</h1>
              <span className="text-secondary fw-medium fs-6 mt-2">Countdown</span>
            </div>
            <p className="text-secondary small m-0 mt-1">{todayFormat}</p>
          </div>

          <div>
            <button
              onClick={() => setShowModal(true)}
              className="btn text-white fw-bold d-flex align-items-center gap-2 px-4 py-2 shadow-sm"
              style={{ backgroundColor: '#2563eb', borderRadius: '8px' }}
            >
              <Plus size={18} /> Thêm sự kiện
            </button>
          </div>
        </div>

        {/* KHU VỰC GRID THẺ ĐẾM NGƯỢC */}
        <div className="row g-4">
          {countdowns.length === 0 ? (
            <div className="col-12 text-center text-secondary fst-italic py-5">
              Bạn chưa có sự kiện đếm ngược nào. Bấm "Thêm sự kiện" để bắt đầu nhé!
            </div>
          ) : (
            countdowns.map((item) => {
              const daysLeft = calculateDaysLeft(item.target_date);
              const isPast = daysLeft < 0;

              return (
                <div key={item.id} className="col-12 col-md-6 col-lg-4">
                  <div
                    className="card border-0 shadow-sm rounded-4 h-100 bg-white position-relative overflow-hidden transition-all hover-shadow-lg"
                    style={{ borderTop: `6px solid ${item.color || '#2563eb'}` }}
                  >
                    <div className="p-4 d-flex flex-column h-100">

                      {/* Ngày tháng & Nút Xóa */}
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center gap-2 text-secondary small fw-medium">
                          <CalendarIcon size={16} /> <span>{item.target_date}</span>
                        </div>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="btn btn-link text-secondary p-0 opacity-50 hover-opacity-100 transition-all"
                          title="Xóa đếm ngược"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Tiêu đề sự kiện */}
                      <h5 className="fw-bold mb-4" style={{ color: '#1e3a8a' }}>{item.title}</h5>

                      {/* Vùng số đếm ngược khổng lồ */}
                      <div className="mt-auto d-flex flex-column align-items-center justify-content-center text-center pb-3">
                        <div
                          className="fw-bold"
                          style={{ fontSize: '3.5rem', lineHeight: '1.1', color: isPast ? '#94a3b8' : (item.color || '#2563eb') }}
                        >
                          {isPast ? 0 : daysLeft}
                        </div>
                        <span className="text-secondary small fw-medium mt-1">
                          {isPast ? 'Đã diễn ra' : 'ngày còn lại'}
                        </span>
                      </div>

                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* ==========================================
          MODAL: THÊM SỰ KIỆN MỚI
      ========================================== */}
        {showModal && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="card border-0 shadow-lg rounded-4 p-4" style={{ width: '400px' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold m-0" style={{ color: '#1e3a8a' }}>Sự kiện đếm ngược</h5>
                <button onClick={() => setShowModal(false)} className="btn btn-link text-secondary p-0"><X size={20} /></button>
              </div>

              <form onSubmit={handleAddEvent}>
                <div className="mb-3">
                  <label className="fw-bold small mb-2 text-secondary">Tên sự kiện</label>
                  <input
                    type="text" className="form-control" placeholder="VD: Sinh nhật mẹ, Thi cuối kỳ..." required
                    value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="fw-bold small mb-2 text-secondary">Ngày mục tiêu</label>
                  <input
                    type="date" className="form-control" required
                    value={newEvent.targetDate} onChange={e => setNewEvent({ ...newEvent, targetDate: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label className="fw-bold small mb-2 text-secondary">Màu sắc viền thẻ</label>
                  <div className="d-flex gap-2">
                    {['#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map(c => (
                      <div key={c} onClick={() => setNewEvent({ ...newEvent, color: c })} className="rounded-circle cursor-pointer transition-all"
                        style={{ width: '28px', height: '28px', backgroundColor: c, border: newEvent.color === c ? '3px solid #1e293b' : '2px solid transparent' }}></div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn w-100 fw-bold text-white py-2" style={{ backgroundColor: '#2563eb', borderRadius: '8px' }}>
                  Tạo đếm ngược
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default Countdown;