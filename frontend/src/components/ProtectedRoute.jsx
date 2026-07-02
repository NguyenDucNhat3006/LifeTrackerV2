import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
    const userStr = localStorage.getItem('user');
    
    // 1. Nếu chưa đăng nhập -> Đuổi về trang Login
    if (!userStr) {
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(userStr);
        // Xác định xem người dùng hiện tại có phải là admin không
        const isAdmin = user.role === 'admin' || user.email === 'admin';
        
        // 2. Nếu trang yêu cầu quyền Admin, nhưng người dùng là User bình thường -> Đẩy về /app
        if (allowedRole === 'admin' && !isAdmin) {
            return <Navigate to="/app" replace />;
        }
        
        // 3. Nếu trang yêu cầu quyền User, nhưng người dùng là Admin -> Đẩy về /admin
        if (allowedRole === 'user' && isAdmin) {
            return <Navigate to="/admin" replace />;
        }

        // Nếu qua được hết các trạm kiểm soát -> Cho phép vào trang
        return children;
        
    } catch (error) {
        // Nếu dữ liệu localStorage bị lỗi/sửa bậy -> Xóa và đuổi về Login
        localStorage.removeItem('user');
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;