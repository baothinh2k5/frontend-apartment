import React from 'react';
import { Link } from 'react-router-dom';
import robotImg from '../assets/illustrations/robot_404.png';
import './NotFoundPage.css';

const GearIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97s-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1s.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.58 1.69-.98l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64L19.43 12.97z" />
  </svg>
);

const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-page" id="not-found-page">
      <div className="not-found-container">
        {/* Left Content */}
        <div className="not-found-content">
          <div className="not-found-subtitle">
            <span className="status-dot" />
            Trang không tìm thấy
          </div>

          <h1 className="not-found-title">Rất tiếc!</h1>
          <p className="not-found-apologize">
            Chúng tôi thành thật xin lỗi.
          </p>
          <p className="not-found-description">
            Chúng tôi không thể tìm thấy trang mà bạn đang tìm kiếm. 
            Trang này có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
          </p>

          <Link to="/" className="not-found-btn" id="not-found-go-home-btn">
            <span className="btn-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </span>
            Quay về Trang chủ
          </Link>
        </div>

        {/* Right Illustration */}
        <div className="not-found-illustration">
          {/* Background 404 */}
          <span className="not-found-code-bg">404</span>

          {/* Floating Badges */}
          <div className="not-found-oops-badge">
            <span>Oops!</span>
          </div>
          <div className="not-found-error-badge">
            <span>Lỗi</span>
          </div>

          {/* Decorative Gears */}
          <div className="not-found-gear not-found-gear--1" style={{ color: '#0d9488' }}>
            <GearIcon size={28} />
          </div>
          <div className="not-found-gear not-found-gear--2" style={{ color: '#0d9488' }}>
            <GearIcon size={20} />
          </div>
          <div className="not-found-gear not-found-gear--3" style={{ color: '#0d9488' }}>
            <GearIcon size={16} />
          </div>

          {/* Robot Image */}
          <img
            src={robotImg}
            alt="Robot lỗi 404"
            className="not-found-robot"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
