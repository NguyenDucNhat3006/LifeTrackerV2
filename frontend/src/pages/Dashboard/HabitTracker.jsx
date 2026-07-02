import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Flame, Check, Plus } from 'lucide-react';
import API_URL from '../../config/api';

const COLOR_PALETTES = [
    { bg: '#3b82f6', border: '#2563eb', lightBg: '#eff6ff' }, // Xanh dương
    { bg: '#06b6d4', border: '#0891b2', lightBg: '#cffafe' }, // Cyan
    { bg: '#10b981', border: '#059669', lightBg: '#d1fae5' }, // Xanh lá
    { bg: '#f59e0b', border: '#d97706', lightBg: '#fef3c7' }, // Vàng
    { bg: '#f97316', border: '#ea580c', lightBg: '#ffedd5' }, // Cam
    { bg: '#ec4899', border: '#db2777', lightBg: '#fce7f3' }, // Hồng
    { bg: '#8b5cf6', border: '#7c3aed', lightBg: '#ede9fe' }, // Tím
];

const HabitTracker = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [habitsList, setHabitsList] = useState([]);

    const [selectedHabitId, setSelectedHabitId] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newHabitTitle, setNewHabitTitle] = useState('');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const todayFormat = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

    // Tính 7 ngày của tuần hiện tại (Bắt đầu từ Thứ 2)
    const [currentWeekStart] = useState(() => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    });

    const weekDates = useMemo(() => {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(currentWeekStart);
            d.setDate(currentWeekStart.getDate() + i);
            dates.push(d);
        }
        return dates;
    }, [currentWeekStart]);

    const formatDateForAPI = (date) => {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().split('T')[0];
    };

    // ==========================================
    // LOGIC CHO HEATMAP NĂM (MỚI THÊM)
    // ==========================================
    
    // 1. Tính tổng số thói quen hoàn thành mỗi ngày
    const heatmapData = useMemo(() => {
        const data = {};
        habitsList.forEach(habit => {
            if (Array.isArray(habit.completed_dates)) {
                habit.completed_dates.forEach(dateStr => {
                    data[dateStr] = (data[dateStr] || 0) + 1;
                });
            }
        });
        return data;
    }, [habitsList]);

    // 2. Tạo mảng 12 tháng của năm hiện tại
    const monthsData = useMemo(() => {
        const year = new Date().getFullYear();
        const currentMonthIdx = new Date().getMonth();
        const months = [];
        
        for (let m = 0; m < 12; m++) {
            const firstDay = new Date(year, m, 1);
            const lastDay = new Date(year, m + 1, 0);
            
            const days = [];
            // Xác định ngày bắt đầu của tháng (Thứ 2 = 0, Chủ nhật = 6)
            let startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
            
            for (let i = 0; i < startDayOfWeek; i++) { days.push(null); } // Các ô trống đầu tháng
            for (let i = 1; i <= lastDay.getDate(); i++) { days.push(new Date(year, m, i)); }
            
            months.push({
                name: `Tháng ${m + 1}`,
                days: days,
                isCurrentMonth: m === currentMonthIdx
            });
        }
        return months;
    }, []);

    // ==========================================
    // API CALLS
    // ==========================================
    const fetchHabitsData = async () => {
        if (!user) return;
        try {
            const response = await axios.get(
                `${API_URL}/api/habits/read_data.php`,
                { params: { user_id: user.id } }
            );
            const data = Array.isArray(response.data) ? response.data : [];
            setHabitsList(data);
            if (data.length > 0 && !selectedHabitId) {
                setSelectedHabitId(data[0].id);
            }
        } catch (error) {
            console.error('Lỗi API:', error);
        }
    };

    useEffect(() => { fetchHabitsData(); }, []);

    const handleAddHabit = async (e) => {
        e.preventDefault();
        if (!newHabitTitle.trim()) return;
        try {
            await axios.post(API_URL + '/api/habits/create.php', {
                user_id: user.id, title: newHabitTitle, weekly_goal: 7
            });
            setNewHabitTitle('');
            setIsAdding(false);
            fetchHabitsData();
        } catch (error) {
            console.error("Lỗi thêm thói quen:", error);
        }
    };

    const handleToggleHabit = async (habitId, dateObj) => {
        const dateStr = formatDateForAPI(dateObj);
        if (dateObj > new Date()) return;

        setHabitsList(prevList => prevList.map(habit => {
            if (habit.id === habitId) {
                const isCompleted = habit.completed_dates.includes(dateStr);
                const newDates = isCompleted
                    ? habit.completed_dates.filter(d => d !== dateStr)
                    : [...habit.completed_dates, dateStr];

                return {
                    ...habit,
                    completed_dates: newDates,
                    total_days: isCompleted ? habit.total_days - 1 : habit.total_days + 1
                };
            }
            return habit;
        }));

        try {
            await axios.post( API_URL + '/api/habits/toggle.php', {
                user_id: user.id, habit_id: habitId, date: dateStr
            });
            fetchHabitsData();
        } catch (error) { fetchHabitsData(); }
    };

    // ==========================================
    // CALENDAR ENGINE
    // ==========================================
    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        let startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

        const days = [];
        for (let i = 0; i < startDayOfWeek; i++) { days.push(null); }
        for (let i = 1; i <= lastDay.getDate(); i++) { days.push(new Date(year, month, i)); }
        return days;
    }, [currentMonth]);

    const changeMonth = (offset) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(currentMonth.getMonth() + offset);
        setCurrentMonth(newMonth);
    };

    const activeHabit = habitsList.find(h => h.id === selectedHabitId) || null;
    const activeColor = COLOR_PALETTES[habitsList.findIndex(h => h.id === selectedHabitId) % COLOR_PALETTES.length] || COLOR_PALETTES[0];

    return (
        <div className="container-fluid p-4 p-md-5 mx-auto" style={{ maxWidth: '1400px', fontFamily: 'sans-serif' }}>
            
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-end mb-4">
                <div>
                    <div className="d-flex align-items-center gap-3">
                        <h1 className="fw-bold m-0" style={{ color: '#1e3a8a' }}>Thói quen</h1>
                        <span className="text-secondary fw-medium fs-6 mt-2">Habit Tracker</span>
                    </div>
                    <p className="text-secondary small m-0 mt-1">{todayFormat}</p>
                </div>
                <div>
                    <button 
                        onClick={() => setIsAdding(!isAdding)}
                        className="btn text-white fw-bold d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
                        style={{ backgroundColor: '#2563eb', borderRadius: '8px' }}
                    >
                        <Plus size={18} /> Thêm thói quen
                    </button>
                </div>
            </div>

            {/* Form Thêm Mới */}
            {isAdding && (
                <form onSubmit={handleAddHabit} className="card border-0 shadow-sm rounded-4 p-3 mb-4 d-flex flex-row align-items-center gap-3">
                    <input 
                        autoFocus type="text" value={newHabitTitle} onChange={(e) => setNewHabitTitle(e.target.value)}
                        placeholder="Ví dụ: Đọc sách 30 phút, Chạy bộ 5km..."
                        className="form-control border-0 shadow-none flex-grow-1 fw-medium py-2"
                        style={{ backgroundColor: '#f8fafc', borderRadius: '8px', color: '#1e293b' }}
                    />
                    <button type="submit" className="btn text-white fw-bold px-4" style={{ backgroundColor: '#2563eb', borderRadius: '8px' }}>Lưu</button>
                    <button type="button" onClick={() => setIsAdding(false)} className="btn btn-light fw-bold px-4 text-secondary" style={{ borderRadius: '8px' }}>Hủy</button>
                </form>
            )}

            {/* ROW 1: DANH SÁCH & LỊCH CHI TIẾT */}
            <div className="row g-4 mb-4">
                
                {/* CỘT TRÁI: DANH SÁCH THÓI QUEN (MASTER) */}
                <div className="col-12 col-lg-7 col-xl-8">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                        <h5 className="fw-bold mb-4" style={{ color: '#1e3a8a' }}>Habit Tracker — 7 ngày gần nhất</h5>
                        
                        <div className="d-flex mb-3">
                            <div style={{ width: '160px' }}></div>
                            <div className="flex-grow-1 d-flex justify-content-between text-center small text-secondary fw-bold px-3">
                                {['T2','T3','T4','T5','T6','T7','CN'].map((d, i) => (
                                    <div key={i} style={{ width: '36px' }}>{d}</div>
                                ))}
                            </div>
                            <div style={{ width: '80px' }}></div>
                        </div>

                        <div className="d-flex flex-column gap-3">
                            {habitsList.length === 0 && !isAdding ? (
                                <div className="text-center py-5 text-secondary fst-italic">Chưa có thói quen nào.</div>
                            ) : (
                                habitsList.map((habit, index) => {
                                    const colors = COLOR_PALETTES[index % COLOR_PALETTES.length];
                                    const isSelected = selectedHabitId === habit.id;

                                    return (
                                        <div 
                                            key={habit.id}
                                            onClick={() => setSelectedHabitId(habit.id)}
                                            className="d-flex align-items-center p-2 rounded-4 transition-all border"
                                            style={{ 
                                                cursor: 'pointer',
                                                backgroundColor: isSelected ? colors.lightBg : 'transparent',
                                                borderColor: isSelected ? colors.border : 'transparent',
                                            }}
                                        >
                                            <div className="d-flex align-items-center gap-2 ps-2" style={{ width: '160px' }}>
                                                <div className="rounded-circle flex-shrink-0" style={{ width: '8px', height: '8px', backgroundColor: colors.bg }}></div>
                                                <span className="fw-medium text-dark text-truncate" style={{ fontSize: '14px' }}>{habit.title}</span>
                                            </div>

                                            <div className="flex-grow-1 d-flex justify-content-between px-3">
                                                {weekDates.map(date => {
                                                    const dateStr = formatDateForAPI(date);
                                                    const isCompleted = habit.completed_dates.includes(dateStr);
                                                    const isFuture = date > new Date();

                                                    return (
                                                        <button
                                                            key={dateStr}
                                                            onClick={(e) => { e.stopPropagation(); handleToggleHabit(habit.id, date); }}
                                                            disabled={isFuture}
                                                            className="btn p-0 border-0 rounded-3 transition-all"
                                                            style={{ 
                                                                width: '36px', height: '36px',
                                                                backgroundColor: isFuture ? '#f8fafc' : (isCompleted ? colors.bg : '#f1f5f9'),
                                                                cursor: isFuture ? 'not-allowed' : 'pointer'
                                                            }}
                                                        ></button>
                                                    )
                                                })}
                                            </div>

                                            <div className="d-flex align-items-center justify-content-end gap-3 pe-2" style={{ width: '80px', fontSize: '13px' }}>
                                                <div className="d-flex align-items-center gap-1" style={{ color: '#f97316' }}>
                                                    <Flame size={14} /> <span className="fw-bold">{habit.streak}</span>
                                                </div>
                                                <div className="d-flex align-items-center gap-1" style={{ color: '#3b82f6' }}>
                                                    <Check size={14} strokeWidth={3} /> <span className="fw-bold">{habit.total_days}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: LỊCH THÁNG (DETAIL) */}
                <div className="col-12 col-lg-5 col-xl-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4 pb-2">
                            <h5 className="fw-bold m-0 text-truncate" style={{ color: '#1e3a8a', maxWidth: '160px' }}>
                                {activeHabit ? activeHabit.title : 'Chi tiết'}
                            </h5>
                            <div className="d-flex align-items-center gap-2">
                                <button onClick={() => changeMonth(-1)} className="btn btn-sm btn-light rounded-circle p-1 text-secondary"><ChevronLeft size={16}/></button>
                                <span className="fw-medium small" style={{ color: '#475569' }}>
                                    {(currentMonth.getMonth() + 1).toString().padStart(2, '0')}/{currentMonth.getFullYear()}
                                </span>
                                <button onClick={() => changeMonth(1)} className="btn btn-sm btn-light rounded-circle p-1 text-secondary"><ChevronRight size={16}/></button>
                            </div>
                        </div>

                        <div className="d-flex justify-content-between text-center small text-secondary fw-medium mb-3 px-1">
                            {['T2','T3','T4','T5','T6','T7','CN'].map(d => <div key={d} style={{ width: '38px' }}>{d}</div>)}
                        </div>

                        <div className="d-flex flex-wrap gap-2 justify-content-between px-1">
                            {calendarDays.map((dateObj, idx) => {
                                if (!dateObj) return <div key={`blank-${idx}`} style={{ width: '38px', height: '38px' }}></div>;

                                const dateStr = formatDateForAPI(dateObj);
                                const isCompleted = activeHabit?.completed_dates.includes(dateStr);
                                const isFuture = dateObj > new Date();
                                const isToday = dateStr === formatDateForAPI(new Date());

                                let btnStyle = {
                                    width: '38px', height: '38px',
                                    backgroundColor: 'transparent',
                                    color: '#64748b',
                                    border: '1px solid transparent'
                                };

                                if (isCompleted) {
                                    btnStyle.backgroundColor = activeColor.bg;
                                    btnStyle.color = 'white';
                                } else if (isFuture) {
                                    btnStyle.color = '#cbd5e1';
                                } else {
                                    btnStyle.border = '1px solid #e2e8f0';
                                }

                                if (isToday && !isCompleted) {
                                    btnStyle.border = `2px solid ${activeColor.bg}`;
                                    btnStyle.color = activeColor.bg;
                                    btnStyle.fontWeight = 'bold';
                                }

                                return (
                                    <button
                                        key={dateStr}
                                        onClick={() => activeHabit && handleToggleHabit(activeHabit.id, dateObj)}
                                        disabled={!activeHabit || isFuture}
                                        className="btn p-0 rounded-pill d-flex align-items-center justify-content-center transition-all"
                                        style={btnStyle}
                                    >
                                        <span style={{ fontSize: '13px', fontWeight: isCompleted ? 'bold' : '500' }}>{dateObj.getDate()}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 2: HEATMAP NĂM CỦA TẤT CẢ THÓI QUEN */}
            <div className="row">
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        
                        {/* Header Heatmap */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold m-0" style={{ color: '#1e3a8a' }}>Heatmap năm — tất cả thói quen</h5>
                            <div className="d-flex align-items-center gap-2 small text-secondary">
                                <span>Ít</span>
                                <div className="d-flex gap-1">
                                    <div className="rounded-1" style={{ width: '12px', height: '12px', backgroundColor: '#f1f5f9' }}></div>
                                    <div className="rounded-1" style={{ width: '12px', height: '12px', backgroundColor: '#bfdbfe' }}></div>
                                    <div className="rounded-1" style={{ width: '12px', height: '12px', backgroundColor: '#60a5fa' }}></div>
                                    <div className="rounded-1" style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6' }}></div>
                                    <div className="rounded-1" style={{ width: '12px', height: '12px', backgroundColor: '#1d4ed8' }}></div>
                                </div>
                                <span>Nhiều</span>
                            </div>
                        </div>

                        {/* Vùng Cuộn Chứa 12 Tháng */}
                        <div className="d-flex gap-3 overflow-x-auto pb-3" style={{ scrollbarWidth: 'thin' }}>
                            {monthsData.map((month, mIdx) => (
                                <div 
                                    key={mIdx} 
                                    className={`p-3 rounded-4 flex-shrink-0 transition-all ${month.isCurrentMonth ? 'border border-2' : 'border border-light'}`}
                                    style={{ 
                                        width: '240px', 
                                        backgroundColor: '#ffffff',
                                        borderColor: month.isCurrentMonth ? '#60a5fa' : '#f8fafc' 
                                    }}
                                >
                                    <h6 className="fw-bold mb-3" style={{ fontSize: '14px', color: month.isCurrentMonth ? '#2563eb' : '#475569' }}>
                                        {month.name}
                                    </h6>
                                    <div className="d-flex flex-wrap gap-1">
                                        {month.days.map((dateObj, dIdx) => {
                                            if (!dateObj) return <div key={`empty-${dIdx}`} style={{ width: '25px', height: '25px' }}></div>;
                                            
                                            const dateStr = formatDateForAPI(dateObj);
                                            const count = heatmapData[dateStr] || 0;
                                            
                                            // Phân cấp màu sắc dựa trên số lượng thói quen đã hoàn thành
                                            let bgColor = '#f1f5f9';
                                            if (count === 1) bgColor = '#bfdbfe';
                                            else if (count === 2) bgColor = '#60a5fa';
                                            else if (count === 3) bgColor = '#3b82f6';
                                            else if (count >= 4) bgColor = '#1d4ed8';

                                            return (
                                                <div 
                                                    key={dIdx} 
                                                    className="rounded-2" 
                                                    title={`${dateStr}: Hoàn thành ${count} thói quen`}
                                                    style={{ width: '25px', height: '25px', backgroundColor: bgColor }}
                                                ></div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
};

export default HabitTracker;