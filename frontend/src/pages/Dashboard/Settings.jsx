import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Camera, User, Mail, Lock, ShieldCheck } from 'lucide-react';
import API_URL from '../../config/api';

const Settings = () => {
  // Lấy dữ liệu user hiện tại từ LocalStorage
  const currentUser = JSON.parse(localStorage.getItem('user'));
  
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    password: '' // Để trống, chỉ khi nào muốn đổi mới nhập
  });
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(currentUser?.avatar || null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const fileInputRef = useRef(null);

  // Xử lý khi chọn ảnh mới
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      // Tạo URL ảo để xem trước ảnh ngay lập tức
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Dùng FormData vì có đính kèm File upload
    const submitData = new FormData();
    submitData.append('user_id', currentUser.id);
    submitData.append('username', formData.username);
    submitData.append('email', formData.email);
    if (formData.password) submitData.append('password', formData.password);
    if (currentUser.avatar) submitData.append('current_avatar', currentUser.avatar);
    if (avatarFile) submitData.append('avatar', avatarFile);

    try {
      const response = await axios.post( API_URL + '/api/users/update_profile.php', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Cập nhật lại localStorage để toàn bộ web nhận diện ảnh/tên mới
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setMessage({ type: 'success', text: response.data.message });
      
      // Reload nhẹ trang để Header/Sidebar cập nhật ảnh mới
      setTimeout(() => window.location.reload(), 1500);

    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Có lỗi xảy ra!' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-4 p-md-5 mx-auto" style={{ maxWidth: '900px', fontFamily: 'sans-serif' }}>
      
      <div className="mb-5">
        <h1 className="fw-bold m-0" style={{ color: '#1e3a8a' }}>Cài đặt tài khoản</h1>
        <p className="text-secondary mt-1">Quản lý thông tin cá nhân và bảo mật của bạn</p>
      </div>

      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        
        {/* Banner trang trí phía trên */}
        <div className="w-100" style={{ height: '120px', backgroundColor: '#e0e7ff' }}></div>

        <div className="p-4 p-md-5 position-relative" style={{ marginTop: '-70px' }}>
          
          {message.text && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} py-2 mb-4 fw-medium shadow-sm`}>
                {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* KHU VỰC ĐỔI ẢNH ĐẠI DIỆN */}
            <div className="d-flex flex-column align-items-center mb-5">
              <div className="position-relative">
                {/* Hiển thị Ảnh hoặc Chữ cái đầu */}
                {previewAvatar ? (
                  <img src={previewAvatar} alt="Avatar" className="rounded-circle shadow bg-white border border-4 border-white" style={{ width: '120px', height: '120px', objectFit: 'cover' }} />
                ) : (
                  <div className="rounded-circle shadow bg-primary d-flex align-items-center justify-content-center text-white fw-bold border border-4 border-white" style={{ width: '120px', height: '120px', fontSize: '40px' }}>
                    {formData.username.substring(0, 2).toUpperCase()}
                  </div>
                )}
                
                {/* Nút bấm Camera */}
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current.click()} 
                  className="btn btn-light rounded-circle shadow-sm position-absolute d-flex align-items-center justify-content-center p-2 border"
                  style={{ bottom: '0', right: '0', color: '#2563eb' }}
                >
                  <Camera size={20} />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="d-none" />
              </div>
              <p className="small text-secondary mt-3 mb-0 fw-medium">Định dạng JPG, PNG. Tối đa 2MB.</p>
            </div>

            <hr className="text-secondary opacity-25 mb-4" />

            {/* KHU VỰC THAY ĐỔI THÔNG TIN */}
            <div className="row g-4 mb-4">
              <div className="col-12 col-md-6">
                <label className="fw-bold small mb-2 text-secondary d-flex align-items-center gap-2"><User size={16}/> Họ và tên</label>
                <input 
                  type="text" name="username" value={formData.username} onChange={handleChange} required
                  className="form-control bg-light border-0 px-3 py-2 rounded-3 text-dark fw-medium"
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="fw-bold small mb-2 text-secondary d-flex align-items-center gap-2"><Mail size={16}/> Địa chỉ Email</label>
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange} required
                  className="form-control bg-light border-0 px-3 py-2 rounded-3 text-dark fw-medium"
                />
              </div>

              <div className="col-12">
                <div className="p-4 rounded-3 border mt-2" style={{ backgroundColor: '#f8fafc' }}>
                  <label className="fw-bold small mb-2 text-secondary d-flex align-items-center gap-2"><Lock size={16}/> Đổi mật khẩu mới</label>
                  <input 
                    type="password" name="password" value={formData.password} onChange={handleChange}
                    placeholder="Bỏ trống nếu bạn không muốn đổi mật khẩu"
                    className="form-control bg-white px-3 py-2 rounded-3 text-dark"
                  />
                  <p className="small text-secondary mt-2 mb-0 d-flex align-items-center gap-1">
                    <ShieldCheck size={14}/> <span>Mật khẩu nên chứa ít nhất 6 ký tự để bảo mật tốt hơn.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* NÚT LƯU */}
            <div className="d-flex justify-content-end mt-5">
              <button 
                type="submit" 
                disabled={loading} 
                className="btn text-white fw-bold px-5 py-2 shadow-sm rounded-3 transition-all" 
                style={{ backgroundColor: '#2563eb' }}
              >
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;