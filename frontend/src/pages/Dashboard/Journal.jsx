import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Type, Edit2, Image as ImageIcon, Mic, Trash2 } from 'lucide-react';
// IMPORT BẢN MỚI HỖ TRỢ REACT 19
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import API_URL from '../../config/api';
import { Helmet } from 'react-helmet-async';


const Journal = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [journals, setJournals] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // State lưu trữ dữ liệu đang gõ
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');

    const API_BASE_URL = API_URL + '/api';
    const todayFormat = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

    // Định dạng ngày hiển thị (VD: Thứ 3, 05/05)
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const days = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        return `${days[d.getDay()]}, ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    };

    // 1. Tải danh sách Nhật ký
    const fetchJournals = async () => {
        if (!user) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/journals/read.php?user_id=${user.id}`);
            if (Array.isArray(res.data)) {
                setJournals(res.data);
                if (res.data.length > 0 && !activeId) setActiveId(res.data[0].id);
            }
        } catch (e) { console.error("Lỗi:", e); }
    };

    useEffect(() => { fetchJournals(); }, []);

    // 2. Khi chọn bài viết khác, cập nhật lại màn hình Editor
    const activeJournal = journals.find(j => j.id === activeId);
    useEffect(() => {
        if (activeJournal) {
            setEditTitle(activeJournal.title);
            setEditContent(activeJournal.content || '');
        }
    }, [activeJournal?.id]);

    // 3. Tạo bài mới
    const handleCreate = async () => {
        try {
            const res = await axios.post(`${API_BASE_URL}/journals/create.php`, {
                user_id: user.id, title: 'Nhật ký mới', content: ''
            });
            if (res.data.id) {
                // Cập nhật UI ngay lập tức
                const newJournal = { id: res.data.id, user_id: user.id, title: 'Nhật ký mới', content: '', created_at: new Date().toISOString() };
                setJournals([newJournal, ...journals]);
                setActiveId(res.data.id);
                setSearchQuery('');
            }
        } catch (e) { console.error(e); }
    };

    // 4. Lưu tự động khi Blur (Click ra ngoài)
    const handleSave = async () => {
        if (!activeId || !activeJournal) return;
        // Ngăn chặn lưu thừa nếu không có gì thay đổi
        if (activeJournal.title === editTitle && activeJournal.content === editContent) return;

        setJournals(prev => prev.map(j => j.id === activeId ? { ...j, title: editTitle, content: editContent } : j));
        try {
            await axios.put(`${API_BASE_URL}/journals/update.php`, {
                id: activeId, user_id: user.id, title: editTitle, content: editContent
            });
        } catch (e) { console.error(e); }
    };

    // 5. Xóa bài viết
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa vĩnh viễn trang nhật ký này?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/journals/delete.php`, { data: { id, user_id: user.id } });
            const newList = journals.filter(j => j.id !== id);
            setJournals(newList);
            if (activeId === id) setActiveId(newList.length > 0 ? newList[0].id : null);
        } catch (e) { console.error(e); }
    };

    const filteredJournals = journals.filter(j =>
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (j.content && j.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <><Helmet>
            <title>LifeTracker | Nhật ký</title>
            <meta name="description" content="Nhật ký lưu trữ những kỉ niệm của bạn ngày hôm nay" />
        </Helmet>

            <div className="container-fluid p-4 p-md-5 mx-auto h-100 d-flex flex-column" style={{ maxWidth: '1400px', fontFamily: 'sans-serif' }}>

                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-end mb-4 flex-shrink-0">
                    <div>
                        <div className="d-flex align-items-center gap-3">
                            <h1 className="fw-bold m-0" style={{ color: '#1e3a8a' }}>Nhật ký</h1>
                            <span className="text-secondary fw-medium fs-6 mt-2">Journal</span>
                        </div>
                        <p className="text-secondary small m-0 mt-1">{todayFormat}</p>
                    </div>

                    <div>
                        <button onClick={handleCreate} className="btn text-white fw-bold d-flex align-items-center gap-2 px-4 py-2 shadow-sm" style={{ backgroundColor: '#2563eb', borderRadius: '8px' }}>
                            <Plus size={18} /> Bài mới
                        </button>
                    </div>
                </div>

                {/* MAIN CONTENT ROW */}
                <div className="row g-4 flex-grow-1 overflow-hidden pb-4">

                    {/* CỘT TRÁI: DANH SÁCH TÌM KIẾM */}
                    <div className="col-12 col-lg-4 h-100">
                        <div className="card border-0 shadow-sm rounded-4 h-100 bg-white p-3 d-flex flex-column">

                            <div className="position-relative mb-4 flex-shrink-0">
                                <Search size={18} className="position-absolute text-secondary" style={{ top: '12px', left: '16px' }} />
                                <input
                                    type="text"
                                    className="form-control border-0 shadow-none py-2"
                                    style={{ backgroundColor: '#f1f5f9', paddingLeft: '44px', borderRadius: '12px', color: '#1e293b' }}
                                    placeholder="Tìm nhật ký..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="d-flex flex-column gap-2 overflow-y-auto flex-grow-1 pe-2" style={{ scrollbarWidth: 'thin' }}>
                                {filteredJournals.length === 0 ? (
                                    <div className="text-center text-secondary small fst-italic py-4">Không tìm thấy bài viết nào.</div>
                                ) : (
                                    filteredJournals.map(journal => {
                                        const isActive = journal.id === activeId;
                                        return (
                                            <div
                                                key={journal.id}
                                                onClick={() => setActiveId(journal.id)}
                                                className={`p-3 rounded-4 transition-all ${isActive ? 'border' : 'border border-transparent hover-bg-light'}`}
                                                style={{
                                                    cursor: 'pointer',
                                                    backgroundColor: isActive ? '#eff6ff' : 'transparent',
                                                    borderColor: isActive ? '#bfdbfe' : 'transparent'
                                                }}
                                            >
                                                <div className={`small fw-medium mb-1 ${isActive ? 'text-secondary' : 'text-secondary'}`} style={{ fontSize: '13px' }}>
                                                    {formatDate(journal.created_at)}
                                                </div>
                                                <h6 className="fw-bold mb-1 text-truncate text-dark" style={{ fontSize: '15px' }}>{journal.title}</h6>
                                                <p className="small text-secondary m-0 text-truncate">
                                                    {/* Xóa thẻ HTML bằng regex đơn giản để hiển thị Text trơn */}
                                                    {journal.content ? journal.content.replace(/<[^>]+>/g, '') : 'Chưa có nội dung...'}
                                                </p>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI: TRÌNH SOẠN THẢO (EDITOR) */}
                    <div className="col-12 col-lg-8 h-100">
                        {activeJournal ? (
                            <div className="card border-0 shadow-sm rounded-4 h-100 bg-white p-4 d-flex flex-column">

                                {/* Khối Title */}
                                <div className="rounded-4 p-3 mb-3 border border-light position-relative" style={{ backgroundColor: '#f8fafc' }}>
                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                        <div className="text-secondary small fw-medium">{formatDate(activeJournal.created_at)}</div>
                                        <button onClick={() => handleDelete(activeJournal.id)} className="btn btn-link text-danger p-0" title="Xóa bài này">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        className="form-control border-0 bg-transparent shadow-none px-0 fw-bold fs-5"
                                        style={{ color: '#1e293b' }}
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        onBlur={handleSave}
                                        placeholder="Tiêu đề nhật ký..."
                                    />
                                </div>

                                {/* Khối Textarea */}
                                <div className="rounded-4 p-3 flex-grow-1 d-flex flex-column border border-light mb-3 bg-white" style={{ minHeight: '400px' }}>
                                    <ReactQuill
                                        theme="snow"
                                        value={editContent}
                                        onChange={setEditContent}
                                        onBlur={handleSave}
                                        placeholder="Hôm nay của bạn thế nào?..."
                                        className="h-100 d-flex flex-column custom-quill"
                                        modules={{
                                            toolbar: [
                                                [{ 'header': [1, 2, 3, false] }],
                                                ['bold', 'italic', 'underline', 'strike'],
                                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                ['image', 'link'],
                                                ['clean']
                                            ]
                                        }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="card border-0 shadow-sm rounded-4 h-100 bg-white d-flex align-items-center justify-content-center text-secondary fst-italic">
                                Chọn hoặc tạo một nhật ký mới để bắt đầu.
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
};

export default Journal;