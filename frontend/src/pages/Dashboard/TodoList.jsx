import { useState, useEffect, useMemo } from "react";
import axios from 'axios';
import { Trash2, Plus, ChevronRight, Search, Filter, Check, Circle, X } from 'lucide-react';
import API_URL from "../../config/api";

const TodoList = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const today = new Date().toISOString().split('T')[0];
  const todayFormat = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  const API_BASE_URL = API_URL + '/api';

  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [tasks, setTasks] = useState([]); 
  const [categories, setCategories] = useState([]);
  const [fetching, setFetching] = useState(true);

  // --- STATE CHO BỘ LỌC (FILTERS) ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [tabStatus, setTabStatus] = useState('all'); // 'all' hoặc 'pending'

  // --- STATE THÊM TASK MỚI ---
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState(3); // Mặc định là Low

  // --- STATE MODAL THÊM NHÃN MỚI ---
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('bg-primary text-white');

  // Bảng màu gợi ý cho Nhãn mới (Dùng class của Bootstrap/Custom)
  const colorOptions = [
    { label: 'Xanh dương', class: 'bg-primary text-white' },
    { label: 'Đỏ', class: 'bg-danger text-white' },
    { label: 'Xanh lá', class: 'bg-success text-white' },
    { label: 'Vàng', class: 'bg-warning text-dark' },
    { label: 'Tím', class: 'bg-secondary text-white' },
    { label: 'Cam', class: 'bg-orange-400 text-dark' }, // Có thể tự định nghĩa
  ];

  // ==========================================
  // 1. FETCH DATA (Tasks & Categories)
  // ==========================================
  const loadData = async () => {
    if (!user) return;
    try {
      const [resTasks, resCats] = await Promise.all([
        axios.get(`${API_BASE_URL}/tasks/read_all.php?user_id=${user.id}`),
        axios.get(`${API_BASE_URL}/categories/read.php?user_id=${user.id}`)
      ]);
      
      if (resTasks.data?.data) {
        setTasks(resTasks.data.data.map(t => ({ ...t, isDone: t.status === 'done' })));
      } else setTasks([]);

      if (resCats.data && Array.isArray(resCats.data)) {
        setCategories(resCats.data);
      } else setCategories([]);

    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ==========================================
  // 2. LOGIC LỌC DỮ LIỆU (FILTERING)
  // ==========================================
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // 1. Lọc theo chữ
      const matchSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      // 2. Lọc trạng thái (Tab)
      const matchTab = tabStatus === 'all' ? true : !task.isDone;
      // 3. Lọc danh mục
      const matchCat = filterCategory === 'all' ? true : task.category_id == filterCategory;
      // 4. Lọc ưu tiên
      const matchPrio = filterPriority === 'all' ? true : task.priority == filterPriority;
      
      return matchSearch && matchTab && matchCat && matchPrio;
    });
  }, [tasks, searchTerm, filterCategory, filterPriority, tabStatus]);

  // ==========================================
  // 3. CÁC HÀM XỬ LÝ TASK
  // ==========================================
  const handleToggleTask = async (task) => {
    const newStatus = task.isDone ? 'pending' : 'done';
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus, isDone: !task.isDone } : t));
    try {
      await axios.put(`${API_BASE_URL}/tasks/update_status.php`, { id: task.id, user_id: user.id, status: newStatus });
    } catch (e) { loadData(); }
  };

  const handleUpdateTaskField = async (taskId, field, value) => {
    // Cập nhật UI liền cho mượt
    setTasks(tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t));
    try {
      await axios.put(`${API_BASE_URL}/tasks/update.php`, { id: taskId, user_id: user.id, [field]: value });
    } catch (e) { loadData(); }
  };

  const handleDeleteTask = async (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    try {
      await axios.delete(`${API_BASE_URL}/tasks/delete.php`, { data: { id: taskId, user_id: user.id } });
    } catch (e) { loadData(); }
  };

  const handleAddTask = async (e) => {
    if (e.key === 'Enter' && newTaskTitle.trim() !== '') {
      try {
        await axios.post(`${API_BASE_URL}/tasks/create.php`, {
          user_id: user.id,
          title: newTaskTitle.trim(),
          category_id: newTaskCategory || null,
          priority: newTaskPriority,
          start_at: today
        });
        setNewTaskTitle('');
        loadData(); 
      } catch (error) { console.error("Lỗi thêm việc:", error); }
    }
  };

  // ==========================================
  // 4. HÀM XỬ LÝ NHÃN (TAG)
  // ==========================================
  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      await axios.post(`${API_BASE_URL}/categories/create.php`, {
        user_id: user.id, name: newCatName.trim(), color: newCatColor
      });
      setNewCatName('');
      setShowCatModal(false);
      loadData(); // Tải lại để có nhãn mới
    } catch (error) { console.error(error); }
  };

  const getPriorityStyle = (priority) => {
    if (priority == 1) return { bg: '#fef2f2', text: '#ef4444', label: 'Cao' };
    if (priority == 2) return { bg: '#fffbeb', text: '#f59e0b', label: 'Trung bình' };
    return { bg: '#f3f4f6', text: '#6b7280', label: 'Thấp' };
  };

  return (
    <div className="container-fluid p-4 p-md-5 mx-auto" style={{ maxWidth: '1400px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <div className="d-flex align-items-center gap-3">
            <h1 className="fw-bold m-0" style={{ color: '#1e3a8a' }}>Công việc</h1>
            <span className="text-secondary fw-medium fs-6 mt-2">To-do List</span>
          </div>
          <p className="text-secondary small m-0 mt-1">{todayFormat}</p>
        </div>
      </div>

      {/* THANH TÌM KIẾM & BỘ LỌC */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 p-3" style={{ backgroundColor: '#ffffff' }}>
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-4 position-relative">
            <Search size={18} className="position-absolute" style={{ top: '12px', left: '24px', color: '#94a3b8' }} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control border-0 shadow-none py-2" 
              style={{ backgroundColor: '#f8fafc', paddingLeft: '40px', borderRadius: '8px', color: '#1e293b' }} 
              placeholder="Tìm kiếm công việc..." 
            />
          </div>
          <div className="col-12 col-md-8 d-flex gap-3 justify-content-md-end align-items-center flex-wrap">
            <Filter size={18} className="text-secondary" />
            
            {/* Lọc Nhãn */}
            <select 
               className="form-select border-0 shadow-none py-2 fw-medium" 
               style={{ backgroundColor: '#f8fafc', width: 'auto', borderRadius: '8px', color: '#334155' }}
               value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Tất cả Nhãn</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            {/* Lọc Ưu tiên */}
            <select 
               className="form-select border-0 shadow-none py-2 fw-medium" 
               style={{ backgroundColor: '#f8fafc', width: 'auto', borderRadius: '8px', color: '#334155' }}
               value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">Mọi độ ưu tiên</option>
              <option value="1">Cao</option>
              <option value="2">Trung bình</option>
              <option value="3">Thấp</option>
            </select>
          </div>
        </div>
      </div>

      {/* DANH SÁCH CÔNG VIỆC */}
      <div className="card border-0 shadow-sm rounded-4 p-4" style={{ backgroundColor: '#ffffff' }}>
        
        {/* Tabs */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <h5 className="fw-bold m-0" style={{ color: '#1e3a8a' }}>Toàn bộ công việc</h5>
          <div className="d-flex rounded-pill p-1 border" style={{ backgroundColor: '#f8fafc' }}>
            <button 
               onClick={() => setTabStatus('all')}
               className={`btn btn-sm rounded-pill px-3 fw-bold ${tabStatus === 'all' ? 'bg-white shadow-sm' : 'border-0 text-secondary'}`} 
               style={{ color: tabStatus === 'all' ? '#2563eb' : '', fontSize: '13px' }}>
               Tất cả
            </button>
            <button 
               onClick={() => setTabStatus('pending')}
               className={`btn btn-sm rounded-pill px-3 fw-bold ${tabStatus === 'pending' ? 'bg-white shadow-sm' : 'border-0 text-secondary'}`} 
               style={{ color: tabStatus === 'pending' ? '#2563eb' : '', fontSize: '13px' }}>
               Chưa hoàn thành
            </button>
          </div>
          <span className="badge rounded-circle border text-dark bg-white d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
            {filteredTasks.length}
          </span>
        </div>

        {/* Bảng */}
        <div className="table-responsive" style={{ minHeight: '300px' }}>
          <table className="table table-borderless align-middle mb-0">
            <thead className="border-bottom text-secondary" style={{ fontSize: '13px' }}>
              <tr>
                <th style={{ width: '50px' }}></th>
                <th className="fw-normal pb-3">Công việc</th>
                <th className="fw-normal pb-3" style={{ width: '250px' }}>Nhãn (Tag)</th>
                <th className="fw-normal pb-3" style={{ width: '180px' }}>Ưu tiên</th>
                <th className="fw-normal pb-3 text-center" style={{ width: '80px' }}>Xóa</th>
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                <tr><td colSpan="5" className="text-center py-5 text-secondary">Đang tải công việc...</td></tr>
              ) : filteredTasks.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-5 text-secondary">Không tìm thấy công việc nào!</td></tr>
              ) : (
                filteredTasks.map(task => {
                  const prioStyle = getPriorityStyle(task.priority);
                  return (
                    <tr key={task.id} className="border-bottom">
                      
                      {/* Cột Checkbox */}
                      <td className="text-center py-3">
                         <button onClick={() => handleToggleTask(task)} className="btn p-0 border-0">
                           {task.isDone 
                             ? <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '22px', height: '22px', backgroundColor: '#2563eb' }}><Check size={14} color="white" strokeWidth={3} /></div>
                             : <Circle size={22} color="#cbd5e1" />
                           }
                         </button>
                      </td>

                      {/* Cột Tiêu đề */}
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-3">
                          <ChevronRight size={18} className="text-secondary" />
                          <input 
                             type="text"
                             className={`form-control shadow-none border-0 bg-transparent px-0 fw-medium ${task.isDone ? 'text-decoration-line-through text-secondary' : 'text-dark'}`}
                             style={{ fontSize: '15px' }}
                             defaultValue={task.title}
                             onBlur={(e) => { if(e.target.value !== task.title) handleUpdateTaskField(task.id, 'title', e.target.value) }}
                          />
                        </div>
                      </td>

                      {/* Cột Tag (Select) */}
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-2">
                          <select 
                             className="form-select form-select-sm border-0 fw-bold shadow-none" 
                             style={{ backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '8px', width: 'auto' }}
                             value={task.category_id || ''}
                             onChange={(e) => handleUpdateTaskField(task.id, 'category_id', e.target.value || null)}
                          >
                            <option value="">-- Chưa có nhãn --</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                          
                          {/* Nút thêm Nhãn */}
                          <button 
                             onClick={() => setShowCatModal(true)}
                             className="btn btn-sm btn-light border d-flex align-items-center justify-content-center p-1" 
                             style={{ color: '#2563eb', borderRadius: '6px' }} title="Thêm nhãn mới">
                            <Plus size={16} />
                          </button>
                        </div>
                      </td>

                      {/* Cột Ưu tiên */}
                      <td className="py-3">
                        <select 
                           className="form-select form-select-sm border-0 fw-bold shadow-none" 
                           style={{ backgroundColor: prioStyle.bg, color: prioStyle.text, borderRadius: '8px', width: 'auto' }}
                           value={task.priority}
                           onChange={(e) => handleUpdateTaskField(task.id, 'priority', e.target.value)}
                        >
                          <option value="1" style={{ color: '#ef4444' }}>Cao</option>
                          <option value="2" style={{ color: '#f59e0b' }}>Trung bình</option>
                          <option value="3" style={{ color: '#6b7280' }}>Thấp</option>
                        </select>
                      </td>

                      {/* Cột Xóa */}
                      <td className="text-center py-3">
                        <button className="btn btn-link p-0 text-danger" onClick={() => handleDeleteTask(task.id)}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}

              {/* DÒNG: THÊM CÔNG VIỆC MỚI */}
              <tr>
                <td></td>
                <td colSpan="4" className="pt-3">
                  <div className="d-flex align-items-center gap-3">
                    <Plus size={20} style={{ color: '#2563eb' }} />
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      onKeyDown={handleAddTask}
                      placeholder="Thêm công việc... (Nhập tên & Nhấn Enter để lưu)"
                      className="form-control border-0 shadow-none fw-bold w-50"
                      style={{ backgroundColor: 'transparent', color: '#2563eb' }}
                    />
                    
                    {/* Setup Tag mặc định cho Task mới */}
                    <select 
                       className="form-select form-select-sm border-0 shadow-none text-secondary" 
                       style={{ backgroundColor: '#f8fafc', width: 'auto', borderRadius: '8px' }}
                       value={newTaskCategory} onChange={e => setNewTaskCategory(e.target.value)}
                    >
                      <option value="">Chọn Nhãn</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>

                    {/* Setup Prio mặc định cho Task mới */}
                    <select 
                       className="form-select form-select-sm border-0 shadow-none text-secondary" 
                       style={{ backgroundColor: '#f8fafc', width: 'auto', borderRadius: '8px' }}
                       value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value)}
                    >
                      <option value="1">Ưu tiên Cao</option>
                      <option value="2">Trung bình</option>
                      <option value="3">Thấp</option>
                    </select>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================
          MODAL: THÊM NHÃN MỚI (BOOTSTRAP THUẦN)
      ========================================== */}
      {showCatModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
           <div className="card border-0 shadow-lg rounded-4 p-4" style={{ width: '400px' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                 <h5 className="fw-bold m-0" style={{ color: '#1e3a8a' }}>Thêm Nhãn Mới</h5>
                 <button onClick={() => setShowCatModal(false)} className="btn btn-link text-secondary p-0"><X size={20}/></button>
              </div>
              
              <div className="mb-3">
                 <label className="fw-bold small mb-2">Tên nhãn</label>
                 <input 
                    type="text" 
                    className="form-control" 
                    placeholder="VD: Học tập, Thể thao..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                 />
              </div>

              <div className="mb-4">
                 <label className="fw-bold small mb-2">Chọn màu sắc</label>
                 <div className="d-flex gap-2 flex-wrap">
                    {colorOptions.map((color, idx) => (
                       <button 
                          key={idx}
                          onClick={() => setNewCatColor(color.class)}
                          className={`btn btn-sm ${color.class} ${newCatColor === color.class ? 'border-dark border-2' : 'border-0'}`}
                          style={{ borderRadius: '8px' }}
                       >
                          {color.label}
                       </button>
                    ))}
                 </div>
              </div>

              <button onClick={handleAddCategory} className="btn w-100 fw-bold text-white" style={{ backgroundColor: '#2563eb' }}>Lưu Nhãn</button>
           </div>
        </div>
      )}

    </div>
  );
};

export default TodoList;