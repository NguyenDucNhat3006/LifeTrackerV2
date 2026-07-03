import { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { Upload, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

import API_URL from '../../config/api';

const Calendar = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [subjects, setSubjects] = useState([]);

  // STATE THỜI GIAN THỰC (Current Time Indicator)
  const [now, setNow] = useState(new Date());

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  });

  // STATE MODAL THÊM SỰ KIỆN
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', startTime: '', endTime: '', color: '#3b82f6' });

  const fileInputRef = useRef(null);
  const API_BASE_URL = API_URL + 'api';

  const todayFormat = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  const weekDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
  const startGridHour = 0;
  const hours = Array.from({ length: 24 }, (_, i) => i + startGridHour);

  const weekDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(currentWeekStart.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [currentWeekStart]);

  // Cập nhật giờ hiện tại mỗi 1 phút để thanh màu đỏ tự động trôi xuống
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchSubjects = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/subjects/read.php?user_id=${user.id}`);
      if (Array.isArray(response.data)) setSubjects(response.data);
    } catch (error) { console.error("Lỗi:", error); }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const changeWeek = (offset) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + (offset * 7));
    setCurrentWeekStart(newDate);
  };

  const handleImportClick = () => fileInputRef.current.click();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', user.id);

    try {
      const response = await axios.post(`${API_BASE_URL}/subjects/import_ics.php`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(response.data.message || "Import thành công!");
      fetchSubjects();
    } catch (error) { alert("Lỗi khi import file!"); }
    event.target.value = null;
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.startTime || !newEvent.endTime) {
      alert("Vui lòng điền đủ thông tin!"); return;
    }
    try {
      // Map đúng tên biến mà PHP đang chờ đợi (start_time và end_time)
      await axios.post(`${API_BASE_URL}/subjects/create.php`, {
        user_id: user.id,
        title: newEvent.title,
        date: newEvent.date,
        start_time: newEvent.startTime,
        end_time: newEvent.endTime,
        color: newEvent.color
      });

      setShowModal(false);
      setNewEvent({ title: '', date: '', startTime: '', endTime: '', color: '#3b82f6' });
      fetchSubjects();
    } catch (error) {
      // Hiển thị chi tiết lỗi từ server để dễ debug hơn
      alert(error.response?.data?.message || "Lỗi tạo sự kiện!");
      console.error(error);
    }
  };

  return (
    <><Helmet>
      <title>LifeTracker | Lịch</title>
      <meta name="description" content="Theo dõi lịch trình của bạn ngay nào" />
    </Helmet>
      <div className="container-fluid p-4 p-md-5 mx-auto relative" style={{ maxWidth: '1400px', fontFamily: 'sans-serif' }}>

        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <div className="d-flex align-items-center gap-3">
              <h1 className="fw-bold m-0" style={{ color: '#1e3a8a' }}>Lịch & Thời khóa biểu</h1>
            </div>
            <p className="text-secondary small m-0 mt-1">{todayFormat}</p>
          </div>

          <div className="d-flex gap-3">
            <input type="file" accept=".ics" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
            <button onClick={handleImportClick} className="btn btn-light border fw-bold d-flex align-items-center gap-2 px-3 py-2 shadow-sm text-secondary" style={{ borderRadius: '8px' }}>
              <Upload size={18} /> Import Lịch (.ics)
            </button>
            <button onClick={() => setShowModal(true)} className="btn text-white fw-bold d-flex align-items-center gap-2 px-3 py-2 shadow-sm" style={{ backgroundColor: '#2563eb', borderRadius: '8px' }}>
              <Plus size={18} /> Thêm sự kiện
            </button>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3 mb-4">
          <button onClick={() => changeWeek(-1)} className="btn btn-light border rounded-circle p-2 text-secondary"><ChevronLeft size={20} /></button>
          <h5 className="fw-bold m-0" style={{ color: '#1e293b' }}>Tháng {currentWeekStart.getMonth() + 1}, Năm {currentWeekStart.getFullYear()}</h5>
          <button onClick={() => changeWeek(1)} className="btn btn-light border rounded-circle p-2 text-secondary"><ChevronRight size={20} /></button>
          <button onClick={() => setCurrentWeekStart(new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)))} className="btn btn-outline-primary btn-sm ms-2 fw-medium rounded-pill px-3">Hôm nay</button>
        </div>

        <div className="card border border-light shadow-sm rounded-4 bg-white overflow-hidden">
          <div style={{ height: '700px', overflowY: 'auto', overflowX: 'auto' }} className="d-flex flex-column">

            {/* Header */}
            <div className="d-flex border-bottom position-sticky top-0 z-3" style={{ backgroundColor: '#f8fafc', minWidth: '800px' }}>
              <div style={{ minWidth: '80px', width: '80px' }} className="border-end"></div>
              {weekDates.map((d, i) => {
                const isToday = d.toDateString() === now.toDateString();
                return (
                  <div key={i} className="flex-grow-1 text-center py-2 border-end" style={{ flexBasis: 0 }}>
                    <div className="text-secondary fw-medium" style={{ fontSize: '13px' }}>{weekDays[i]}</div>
                    <div className={`fw-bold fs-5 ${isToday ? 'text-primary' : 'text-dark'}`}>{d.getDate()}</div>
                  </div>
                )
              })}
            </div>

            {/* Body */}
            <div className="d-flex position-relative flex-grow-1" style={{ minWidth: '800px' }}>
              <div style={{ minWidth: '80px', width: '80px' }} className="border-end bg-white z-1">
                {hours.map(h => (
                  <div key={h} className="position-relative" style={{ height: '80px' }}>
                    <span className="position-absolute w-100 text-secondary small text-center" style={{ top: '-10px', left: 0 }}>{h}:00</span>
                  </div>
                ))}
              </div>

              {weekDates.map((dateObj, dayIndex) => {
                const dateStr = dateObj.toISOString().split('T')[0];
                const currentDayOfWeek = dateObj.getDay();
                const isToday = dateObj.toDateString() === now.toDateString();

                const daySubjects = subjects.filter(sub => {
                  const isCorrectDay = parseInt(sub.day_of_week) === currentDayOfWeek;
                  const isInSemester = dateStr >= sub.start_date && dateStr <= sub.end_date;
                  if (!isCorrectDay || !isInSemester) return false;

                  const interval = parseInt(sub.interval_weeks) || 1;
                  if (interval > 1) {
                    const startDate = new Date(sub.start_date);
                    const currentDate = new Date(dateStr);
                    startDate.setHours(0, 0, 0, 0); currentDate.setHours(0, 0, 0, 0);
                    const diffWeeks = Math.round(Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24)) / 7);
                    if (diffWeeks % interval !== 0) return false;
                  }
                  return true;
                });

                return (
                  <div key={dayIndex} className="flex-grow-1 border-end position-relative" style={{ flexBasis: 0 }}>
                    {/* Lưới ngang */}
                    {hours.map(h => <div key={h} className="border-bottom w-100" style={{ height: '80px', borderColor: '#f1f5f9' }}></div>)}

                    {/* THANH THỜI GIAN THỰC (Chỉ hiển thị ở cột Hôm Nay và trong khung giờ) */}
                    {isToday && now.getHours() >= startGridHour && now.getHours() <= 21 && (
                      <div
                        className="position-absolute w-100 pointer-events-none"
                        style={{
                          top: `${(now.getHours() - startGridHour) * 80 + (now.getMinutes() / 60) * 80}px`,
                          left: 0,
                          borderTop: '2px solid #ef4444', // Vạch đỏ chuẩn iPhone
                          zIndex: 20
                        }}
                      >
                        <div className="position-absolute bg-danger rounded-circle shadow-sm" style={{ width: '10px', height: '10px', top: '-6px', left: '-5px' }}></div>
                      </div>
                    )}

                    {/* Render Môn học */}
                    {daySubjects.map((sub) => {
                      const sTime = sub.start_time.split(':');
                      const eTime = sub.end_time.split(':');

                      const startHour = parseInt(sTime[0]); const startMinute = parseInt(sTime[1]);
                      const endHour = parseInt(eTime[0]); const endMinute = parseInt(eTime[1]);

                      const durationInHours = (endHour + endMinute / 60) - (startHour + startMinute / 60);
                      if (startHour < startGridHour) return null;

                      const topPosition = (startHour - startGridHour) * 80 + (startMinute / 60) * 80;
                      const height = durationInHours * 80;

                      return (
                        <div key={sub.id} className="position-absolute rounded-3 p-2 text-white shadow-sm overflow-hidden border border-white" title={sub.description}
                          style={{ top: `${topPosition + 2}px`, height: `${height - 4}px`, backgroundColor: sub.color, left: '4px', width: 'calc(100% - 8px)', cursor: 'pointer', zIndex: 10 }}>
                          <div className="fw-bold text-truncate" style={{ fontSize: '12px' }}>{sub.title}</div>
                          <div style={{ fontSize: '10px', opacity: 0.9 }}>
                            {sub.start_time.substring(0, 5)} - {sub.end_time.substring(0, 5)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ==========================================
          MODAL: THÊM SỰ KIỆN MỚI
      ========================================== */}
        {showModal && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="card border-0 shadow-lg rounded-4 p-4" style={{ width: '400px' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold m-0" style={{ color: '#1e3a8a' }}>Sự kiện mới</h5>
                <button onClick={() => setShowModal(false)} className="btn btn-link text-secondary p-0"><X size={20} /></button>
              </div>

              <form onSubmit={handleAddEvent}>
                <div className="mb-3">
                  <label className="fw-bold small mb-2 text-secondary">Tên sự kiện</label>
                  <input type="text" className="form-control" placeholder="VD: Đi uống cà phê, Họp nhóm..." required value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} />
                </div>

                <div className="mb-3">
                  <label className="fw-bold small mb-2 text-secondary">Ngày</label>
                  <input type="date" className="form-control" required value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} />
                </div>

                <div className="row mb-3">
                  <div className="col-6">
                    <label className="fw-bold small mb-2 text-secondary">Giờ bắt đầu</label>
                    <input type="time" className="form-control" required value={newEvent.startTime} onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })} />
                  </div>
                  <div className="col-6">
                    <label className="fw-bold small mb-2 text-secondary">Giờ kết thúc</label>
                    <input type="time" className="form-control" required value={newEvent.endTime} onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })} />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="fw-bold small mb-2 text-secondary">Màu sắc</label>
                  <div className="d-flex gap-2">
                    {['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map(c => (
                      <div key={c} onClick={() => setNewEvent({ ...newEvent, color: c })} className="rounded-circle cursor-pointer"
                        style={{ width: '24px', height: '24px', backgroundColor: c, border: newEvent.color === c ? '3px solid #1e293b' : 'none' }}></div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn w-100 fw-bold text-white" style={{ backgroundColor: '#2563eb' }}>Lưu sự kiện</button>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default Calendar;