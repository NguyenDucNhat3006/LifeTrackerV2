import { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { Bell, Check, Circle, CalendarDays, Calendar as CalendarIcon, ListTodo } from 'lucide-react';
import API_URL from '../../config/api';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  const [allTasks, setAllTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [countdowns, setCountdowns] = useState([]);
  const [todaySubjects, setTodaySubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho thông báo và Lịch thông minh
  const [showNotifications, setShowNotifications] = useState(false);
  const [now, setNow] = useState(new Date());

  const API_BASE_URL = API_URL + '/api';

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return {
        dateStr: d.toISOString().split('T')[0],
        dayName: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()]
      };
    });
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayFormat = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const displayHours = useMemo(() => {
    let start = now.getHours() - 1; 
    let end = start + 5; 
    if (start < 0) { start = 0; end = 5; }
    if (end > 23) { end = 23; start = 18; }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [now]);

  const startGridHour = displayHours[0];

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      const [resTasks, resHabits, resCountdowns, resSubjects] = await Promise.all([
        axios.get(`${API_BASE_URL}/tasks/read_all.php?user_id=${user.id}`),
        axios.get(`${API_BASE_URL}/habits/read_data.php?user_id=${user.id}&start_date=${last7Days[0].dateStr}&end_date=${last7Days[6].dateStr}`),
        axios.get(`${API_BASE_URL}/countdowns/read.php?user_id=${user.id}`),
        axios.get(`${API_BASE_URL}/subjects/read.php?user_id=${user.id}`)
      ]);

      if (resTasks.data && Array.isArray(resTasks.data.data)) {
        const tasksData = resTasks.data.data.map(t => ({
          ...t, isDone: t.status === 'done', priority_label: t.priority == 1 ? 'high' : t.priority == 2 ? 'med' : 'low',
        }));
        setAllTasks(tasksData);
        setTodayTasks(tasksData.filter(t => t.start_at && t.start_at.includes(todayStr)));
      }

      if (resHabits.data && Array.isArray(resHabits.data)) setHabits(resHabits.data);
      if (resCountdowns.data && Array.isArray(resCountdowns.data)) setCountdowns(resCountdowns.data);

      if (resSubjects.data && Array.isArray(resSubjects.data)) {
        const currentDayOfWeek = new Date().getDay();
        const classesToday = resSubjects.data.filter(sub => {
            const isCorrectDay = parseInt(sub.day_of_week) === currentDayOfWeek;
            const isInSemester = todayStr >= sub.start_date && todayStr <= sub.end_date;
            if (!isCorrectDay || !isInSemester) return false;

            const interval = parseInt(sub.interval_weeks) || 1;
            if (interval > 1) {
                const startDate = new Date(sub.start_date);
                const currentDate = new Date(todayStr);
                startDate.setHours(0,0,0,0); currentDate.setHours(0,0,0,0);
                const diffWeeks = Math.round(Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24)) / 7);
                if (diffWeeks % interval !== 0) return false; 
            }
            return true;
        });
        setTodaySubjects(classesToday);
      }
    } catch (error) {
      console.error("Lỗi đồng bộ Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const completedToday = todayTasks.filter(t => t.isDone).length;
  const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0)) : 0;
  
  const upcomingEvents = useMemo(() => {
    return countdowns.map(c => {
      const target = new Date(c.target_date); target.setHours(0,0,0,0);
      const today = new Date(); today.setHours(0,0,0,0);
      return { ...c, daysLeft: Math.ceil((target - today) / (1000 * 60 * 60 * 24)) };
    }).filter(c => c.daysLeft >= 0).sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 4);
  }, [countdowns]);

  // GOM THÔNG BÁO TỪ TASK VÀ SỰ KIỆN
  const notifications = useMemo(() => {
    let notifs = [];
    todayTasks.filter(t => !t.isDone).forEach(t => {
      notifs.push({ id: `task-${t.id}`, type: 'task', title: t.title, time: t.start_at ? t.start_at.substring(11, 16) : 'Hôm nay' });
    });
    upcomingEvents.forEach(e => {
      notifs.push({ id: `event-${e.id}`, type: 'event', title: e.title, time: `Còn ${e.daysLeft} ngày` });
    });
    return notifs;
  }, [todayTasks, upcomingEvents]);

  const performanceData = useMemo(() => {
    return last7Days.map(day => {
      const dayTasks = allTasks.filter(t => t.start_at && t.start_at.startsWith(day.dateStr));
      const completed = dayTasks.filter(t => t.isDone).length;
      const pending = dayTasks.length - completed;
      const total = dayTasks.length || 1;
      return {
        day: day.dateStr.substring(8, 10) + '/' + day.dateStr.substring(5, 7),
        h1: `${(completed / total) * 100}%`, 
        h2: `${(pending / total) * 100}%`    
      };
    });
  }, [last7Days, allTasks]);

  const heatmapSums = last7Days.map(day => {
    let sum = 0;
    habits.forEach(h => {
      if ((Array.isArray(h.completed_dates) ? h.completed_dates : []).includes(day.dateStr)) sum++;
    });
    return sum;
  });

  const pieStats = useMemo(() => {
    if (allTasks.length === 0) return { percent: 0 };
    const onTime = allTasks.filter(t => t.isDone).length;
    return { percent: Math.round((onTime / allTasks.length) * 100) };
  }, [allTasks]);

  const handleToggleTask = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'done' ? 'pending' : 'done';
    setTodayTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: nextStatus, isDone: nextStatus === 'done' } : t));
    try {
      await axios.put(`${API_BASE_URL}/tasks/update_status.php`, { id: taskId, user_id: user.id, status: nextStatus });
      fetchDashboardData();
    } catch (error) { console.error(error); }
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center h-100 text-secondary">Đang tải dữ liệu...</div>;

  return (
    <div className="container-fluid p-4 p-md-5 mx-auto" style={{ maxWidth: '1400px' }}>
      
      {/* HEADER: Ép sát lề, tối ưu khoảng trống */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-end gap-3">
          <h1 className="fw-bold m-0" style={{ color: '#1e293b', fontSize: '28px' }}>Tổng quan</h1>
          <span className="text-secondary fw-medium fs-6 mb-1">Bảng điều khiển</span>
          <span className="text-secondary small ms-2 mb-1 border-start ps-3 d-none d-md-block">{todayFormat}</span>
        </div>
        
        <div className="d-flex align-items-center gap-3">
          
          {/* KHU VỰC THÔNG BÁO CÓ DROPDOWN */}
          <div className="position-relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              className="btn border-0 position-relative text-secondary p-2 rounded-circle hover-bg-light transition-all"
            >
              <Bell size={22} />
              {notifications.length > 0 && (
                <span className="position-absolute bg-danger rounded-circle border border-white" style={{ width: '10px', height: '10px', top: '4px', right: '4px' }}></span>
              )}
            </button>

            {/* Bảng Dropdown Thông Báo */}
            {showNotifications && (
              <div className="position-absolute bg-white shadow-lg rounded-4 border p-3" style={{ top: '45px', right: '0', width: '320px', zIndex: 1050 }}>
                <h6 className="fw-bold mb-3" style={{ color: '#1e3a8a' }}>Thông báo ({notifications.length})</h6>
                <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '300px' }}>
                  {notifications.length === 0 ? (
                    <div className="text-center text-secondary small py-3 fst-italic">Bạn đã hoàn thành mọi việc!</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="d-flex align-items-start gap-3 p-2 rounded-3 hover-bg-light transition-all border-bottom border-light">
                        <div className={`p-2 rounded-circle ${n.type === 'task' ? 'bg-primary bg-opacity-10 text-primary' : 'bg-warning bg-opacity-10 text-warning'}`}>
                          {n.type === 'task' ? <ListTodo size={16} /> : <CalendarIcon size={16} />}
                        </div>
                        <div>
                          <p className="m-0 fw-medium text-dark text-truncate" style={{ fontSize: '13px', maxWidth: '200px' }}>{n.title}</p>
                          <p className="m-0 text-secondary" style={{ fontSize: '11px' }}>{n.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* AVATAR NGƯỜI DÙNG THẬT */}
          <div className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold shadow-sm overflow-hidden border border-2 border-white" style={{ width: '40px', height: '40px', backgroundColor: '#2563eb', cursor: 'pointer' }}>
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user?.username?.substring(0, 2).toUpperCase() || 'NA'
            )}
          </div>
        </div>
      </div>

      {/* BLUE BANNER */}
      <div className="rounded-4 p-4 p-md-5 text-white d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 shadow-sm" style={{ backgroundColor: '#2563eb' }}>
        <div className="mb-4 mb-md-0">
          <h2 className="fw-bold mb-2">Xin chào, {user?.username || 'bạn'} 👋</h2>
          <p className="m-0" style={{ color: '#dbeafe' }}>Hôm nay bạn có {todayTasks.length} công việc và {habits.length} thói quen cần hoàn thành.</p>
        </div>
        <div className="d-flex gap-3 overflow-auto">
          <div className="p-3 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)', minWidth: '120px' }}>
            <p className="small m-0 mb-1" style={{ color: '#dbeafe' }}>Tasks hoàn thành</p>
            <p className="fs-4 fw-bold m-0">{completedToday}/{todayTasks.length}</p>
          </div>
          <div className="p-3 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)', minWidth: '120px' }}>
            <p className="small m-0 mb-1" style={{ color: '#dbeafe' }}>Streak dài nhất</p>
            <p className="fs-4 fw-bold m-0">{maxStreak} ngày</p>
          </div>
          <div className="p-3 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)', minWidth: '120px' }}>
            <p className="small m-0 mb-1" style={{ color: '#dbeafe' }}>Habits đang giữ</p>
            <p className="fs-4 fw-bold m-0">{habits.length}</p>
          </div>
        </div>
      </div>

      {/* ROW 1: Lịch & Heatmap */}
      <div className="row g-4 mb-4">
        {/* LỊCH HÔM NAY - THU NHỎ HIỂN THỊ 6 TIẾNG */}
        <div className="col-12 col-lg-4">
          <div className="card border border-light shadow-sm rounded-4 h-100 p-4 d-flex flex-column">
            <h5 className="fw-bold d-flex align-items-center gap-2 mb-1" style={{ color: '#1e3a8a' }}>
               <CalendarDays size={18}/> Lịch hôm nay
            </h5>
            <p className="text-secondary small mb-3 pb-2 border-bottom flex-shrink-0">{todayFormat}</p>
            
            <div className="position-relative flex-grow-1 overflow-hidden" style={{ minHeight: `${displayHours.length * 60}px` }}>
              <div className="d-flex position-relative w-100 h-100">
                
                {/* Trục thời gian bên trái */}
                <div style={{ width: '45px' }} className="d-flex flex-column text-secondary text-end pe-2 z-1 bg-white">
                  {displayHours.map((h, i) => (
                    <div key={i} className="position-absolute w-100" style={{ top: `${i * 60 - 8}px`, right: '5px' }}>
                      <span className="fw-medium" style={{ fontSize: '11px' }}>{h}:00</span>
                    </div>
                  ))}
                </div>

                {/* Khu vực Lưới (Grid) của Môn học */}
                <div className="flex-grow-1 position-relative border-start border-light overflow-hidden" style={{ width: 'calc(100% - 45px)' }}>
                  
                  {/* Đường kẻ ngang */}
                  {displayHours.map((h, i) => (
                    <div key={h} className="border-bottom border-light w-100 position-absolute" style={{ height: '1px', top: `${i * 60}px` }}></div>
                  ))}

                  {/* Thanh thời gian thực màu đỏ */}
                  <div 
                    className="position-absolute w-100 pointer-events-none" 
                    style={{ 
                      top: `${(now.getHours() - startGridHour) * 60 + now.getMinutes()}px`, 
                      left: 0, 
                      borderTop: '2px solid #ef4444', 
                      zIndex: 20 
                    }}
                  >
                    <div className="position-absolute bg-danger rounded-circle shadow-sm" style={{ width: '8px', height: '8px', top: '-5px', left: '-4px' }}></div>
                  </div>

                  {/* Render các khối Môn học */}
                  {todaySubjects.map((sub) => {
                    const sTime = sub.start_time.split(':');
                    const eTime = sub.end_time.split(':');
                    
                    const startHour = parseInt(sTime[0]);
                    const startMin = startHour * 60 + parseInt(sTime[1]);
                    const endMin = parseInt(eTime[0]) * 60 + parseInt(eTime[1]);

                    const topPos = (startHour - startGridHour) * 60 + parseInt(sTime[1]);
                    const height = endMin - startMin;

                    if (topPos + height < 0 || topPos > displayHours.length * 60) return null;

                    return (
                      <div 
                        key={sub.id} 
                        className="position-absolute rounded-3 p-2 text-white shadow-sm overflow-hidden border border-white" 
                        title={sub.description}
                        style={{ 
                          top: `${topPos + 1}px`, 
                          height: `${height - 2}px`, 
                          backgroundColor: sub.color || '#3b82f6', 
                          left: '4px', 
                          width: 'calc(100% - 8px)', 
                          cursor: 'pointer', 
                          zIndex: 10 
                        }}
                      >
                        <div className="fw-bold text-truncate" style={{ fontSize: '11px' }}>{sub.title}</div>
                        <div style={{ fontSize: '9px', opacity: 0.9 }}>
                          {sub.start_time.substring(0,5)} - {sub.end_time.substring(0,5)}
                        </div>
                      </div>
                    )
                  })}

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HEATMAP */}
        <div className="col-12 col-lg-8">
          <div className="card border border-light shadow-sm rounded-4 h-100 p-4 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold m-0" style={{ color: '#1e3a8a' }}>Heatmap hoạt động trong tuần</h5>
                <div className="d-flex align-items-center gap-2 small text-secondary">
                   <span>Ít</span>
                   <div className="d-flex gap-1">
                      <div className="rounded-1" style={{ width: '12px', height: '12px', backgroundColor: '#f3f4f6' }}></div>
                      <div className="rounded-1" style={{ width: '12px', height: '12px', backgroundColor: '#bfdbfe' }}></div>
                      <div className="rounded-1" style={{ width: '12px', height: '12px', backgroundColor: '#60a5fa' }}></div>
                      <div className="rounded-1" style={{ width: '12px', height: '12px', backgroundColor: '#2563eb' }}></div>
                   </div>
                   <span>Nhiều</span>
                </div>
            </div>

            <div className="flex-grow-1 overflow-y-auto pe-2" style={{ scrollbarWidth: 'thin' }}>
              <div className="d-flex mb-2">
                <div style={{ width: '130px' }}></div>
                <div className="flex-grow-1 d-flex justify-content-between text-center small text-secondary fw-medium">
                  {last7Days.map((d, i) => <div key={i} style={{ width: '12%' }}>{d.dayName}</div>)}
                </div>
              </div>
              
              <div className="d-flex flex-column gap-2">
                {habits.length === 0 ? (
                  <div className="text-center text-secondary py-4">Chưa có dữ liệu thói quen.</div>
                ) : (
                  habits.map((habit, idx) => (
                    <div key={idx} className="d-flex align-items-center" style={{ height: '24px' }}>
                      <div className="text-secondary text-truncate pe-2" style={{ width: '130px', fontSize: '14px' }} title={habit.title}>{habit.title}</div>
                      <div className="flex-grow-1 d-flex justify-content-between">
                        {last7Days.map((day, i) => {
                           const dates = Array.isArray(habit.completed_dates) ? habit.completed_dates : [];
                           const isCompleted = dates.includes(day.dateStr);
                           return <div key={i} className="rounded" style={{ width: '12%', height: '24px', backgroundColor: isCompleted ? '#3b82f6' : '#f3f4f6' }}></div>;
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-top d-flex align-items-center">
              <div className="fw-bold" style={{ width: '130px', fontSize: '14px', color: '#1e3a8a' }}>Tổng hoạt động</div>
              <div className="flex-grow-1 d-flex justify-content-between text-center text-white fw-bold" style={{ fontSize: '12px' }}>
                {heatmapSums.map((num, i) => (
                  <div key={i} className="rounded py-1" style={{ width: '12%', backgroundColor: num > 2 ? '#2563eb' : (num > 0 ? '#60a5fa' : '#e5e7eb'), color: num === 0 ? '#9ca3af' : 'white' }}>{num}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: Tasks & Sự kiện đếm ngược */}
      <div className="row g-4 mb-4">
        {/* CÔNG VIỆC HÔM NAY */}
        <div className="col-12 col-lg-8">
          <div className="card border border-light shadow-sm rounded-4 p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold m-0" style={{ color: '#1e3a8a' }}>Công việc hôm nay</h5>
              <button className="btn btn-link text-decoration-none fw-bold p-0" style={{ fontSize: '14px' }} onClick={() => navigate('/todo')}>
                Xem tất cả
              </button>
            </div>
            
            <div className="flex-grow-1 overflow-y-auto pe-2 d-flex flex-column gap-2" style={{ scrollbarWidth: 'thin' }}>
              {todayTasks.length === 0 ? (
                <div className="text-center text-secondary py-5">Không có công việc nào hôm nay.</div>
              ) : (
                todayTasks.map(task => (
                  <div key={task.id} className="d-flex justify-content-between align-items-center p-3 rounded-3 border" style={{ backgroundColor: task.isDone ? 'white' : '#f8fafc' }}>
                    <div className="d-flex align-items-center gap-3">
                      <button onClick={() => handleToggleTask(task.id, task.status)} className="btn p-0 border-0">
                        {task.isDone 
                          ? <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', backgroundColor: '#2563eb' }}><Check size={14} color="white" strokeWidth={3} /></div>
                          : <Circle size={24} color="#d1d5db" />
                        }
                      </button>
                      <div>
                        <p className={`fw-medium m-0 ${task.isDone ? 'text-decoration-line-through text-secondary' : ''}`} style={{ fontSize: '15px', color: '#1e293b' }}>{task.title}</p>
                        <p className="m-0 fw-medium" style={{ fontSize: '12px', color: '#3b82f6' }}>Chưa phân loại</p>
                      </div>
                    </div>
                    {task.priority_label === 'high' && <span className="badge rounded-pill" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>high</span>}
                    {task.priority_label === 'med' && <span className="badge rounded-pill" style={{ backgroundColor: '#fffbeb', color: '#f59e0b' }}>med</span>}
                    {task.priority_label === 'low' && <span className="badge rounded-pill" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>low</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* SỰ KIỆN SẮP TỚI ĐỒNG BỘ */}
        <div className="col-12 col-lg-4">
          <div className="card border border-light shadow-sm rounded-4 p-4 h-100">
            <h5 className="fw-bold mb-4" style={{ color: '#1e3a8a' }}>Sự kiện đếm ngược</h5>
            <div className="flex-grow-1 overflow-y-auto pe-2 d-flex flex-column gap-3" style={{ scrollbarWidth: 'thin' }}>
              {upcomingEvents.length === 0 ? (
                <div className="text-center text-secondary py-5">Không có sự kiện nào sắp tới.</div>
              ) : (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="d-flex align-items-center gap-3">
                    <div className="rounded-3 text-white d-flex flex-column align-items-center justify-content-center shadow-sm flex-shrink-0" style={{ width: '48px', height: '48px', backgroundColor: event.color || '#2563eb' }}>
                      <span className="fw-bold lh-1" style={{ fontSize: '18px' }}>{event.daysLeft}</span>
                      <span className="fw-medium" style={{ fontSize: '10px' }}>ngày</span>
                    </div>
                    <div>
                      <p className="fw-bold m-0 text-truncate" style={{ fontSize: '14px', color: '#1e293b', maxWidth: '160px' }}>{event.title}</p>
                      <p className="text-secondary m-0" style={{ fontSize: '12px' }}>{event.target_date}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: BIỂU ĐỒ TỰ ĐỘNG */}
      <div className="row g-4">
        {/* Biểu đồ hiệu suất */}
        <div className="col-12 col-lg-7">
           <div className="card border border-light shadow-sm rounded-4 p-4 h-100">
             <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold m-0" style={{ color: '#1e3a8a' }}>Biểu đồ hiệu suất (7 ngày)</h5>
             </div>
             
             <div className="w-100 d-flex align-items-end justify-content-between position-relative pb-4" style={{ height: '160px' }}>
                <div className="position-absolute w-100 h-100 d-flex flex-column justify-content-between pb-4" style={{ top: 0, left: 0, zIndex: 0 }}>
                   <div className="border-bottom border-secondary border-opacity-25" style={{ borderStyle: 'dashed !important' }}></div>
                   <div className="border-bottom border-secondary border-opacity-25" style={{ borderStyle: 'dashed !important' }}></div>
                   <div className="border-bottom border-secondary border-opacity-25" style={{ borderStyle: 'dashed !important' }}></div>
                </div>
                
                {performanceData.map((col, i) => (
                   <div key={i} className="d-flex flex-column align-items-center w-100 position-relative z-1">
                      <div className="d-flex align-items-end justify-content-center w-100 gap-1 mb-2" style={{ height: '100px' }}>
                         <div className="rounded-top" title="Đã hoàn thành" style={{ width: '12px', height: col.h1, backgroundColor: '#a7f3d0' }}></div>
                         <div className="rounded-top" title="Chưa hoàn thành" style={{ width: '12px', height: col.h2, backgroundColor: '#059669' }}></div>
                      </div>
                      <span className="text-secondary" style={{ fontSize: '10px' }}>{col.day}</span>
                   </div>
                ))}
             </div>
             
             <div className="d-flex justify-content-center gap-4 mt-2 text-secondary" style={{ fontSize: '12px' }}>
                <div className="d-flex align-items-center gap-2"><span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#a7f3d0' }}></span> Đã hoàn thành</div>
                <div className="d-flex align-items-center gap-2"><span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#059669' }}></span> Chưa hoàn thành</div>
             </div>
           </div>
        </div>

        {/* Tỉ lệ hoàn thành */}
        <div className="col-12 col-lg-5">
           <div className="card border border-light shadow-sm rounded-4 p-4 h-100">
             <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold m-0" style={{ color: '#1e3a8a' }}>Tỉ lệ hoàn thành Task</h5>
             </div>
             
             <div className="d-flex align-items-center justify-content-between h-100">
                <div className="d-flex flex-column gap-3" style={{ fontSize: '14px', color: '#334155' }}>
                   <div className="d-flex align-items-center gap-2"><span className="rounded-circle" style={{ width: '12px', height: '12px', backgroundColor: '#34d399' }}></span> Đã hoàn thành</div>
                   <div className="d-flex align-items-center gap-2"><span className="rounded-circle" style={{ width: '12px', height: '12px', backgroundColor: '#ef4444' }}></span> Chưa hoàn thành</div>
                </div>
                
                <div className="rounded-circle position-relative d-flex align-items-center justify-content-center" 
                     style={{ width: '130px', height: '130px', background: `conic-gradient(#34d399 0% ${pieStats.percent}%, #ef4444 ${pieStats.percent}% 100%)` }}>
                   <div className="bg-white rounded-circle d-flex align-items-center justify-content-center z-1 shadow-sm" style={{ width: '80px', height: '80px' }}>
                      <span className="fw-bold fs-5" style={{ color: '#10b981' }}>{pieStats.percent}%</span>
                   </div>
                   <div className="position-absolute w-100 h-100 rounded-circle border border-4 border-white pointer-events-none"></div>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;