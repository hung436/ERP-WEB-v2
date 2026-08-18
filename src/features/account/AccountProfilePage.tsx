import { Avatar, Button, Form, Input, Progress, Switch, Table, Tag, message } from 'antd';
import {
  AtSign,
  Bell,
  Briefcase,
  Building2,
  Camera,
  CheckCircle2,
  Eye,
  Feather,
  Globe,
  Info,
  Layers,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  Smartphone,
  User as UserIcon,
  Volume2,
} from 'lucide-react';
import React, { useRef, useState } from 'react';

import { useAuth } from '@/features/auth/AuthContext';
import { avatarTone } from '@/utils/avatar';
import './account-page.css';

type ActiveTab = 'profile' | 'security' | 'preferences';

export function AccountProfilePage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read-only user data
  const phone = '0908 123 456';
  const penName = 'Minh Anh, M.A';
  const workplace = 'Tòa soạn Báo Tuổi Trẻ, 60A Hoàng Văn Thụ, Q. Phú Nhuận, TP.HCM';

  // Multi-assignment list (1 person can have multiple positions/departments)
  const assignments = [
    {
      key: 'assign-1',
      department: user?.department || 'Ban Nội dung',
      position: user?.position || 'Phóng viên',
      isPrimary: true,
    },
    {
      key: 'assign-2',
      department: 'Ban Thư ký Tòa soạn',
      position: 'Biên tập viên Chuyên đề Số',
      isPrimary: false,
    },
    {
      key: 'assign-3',
      department: 'Chi hội Nhà báo Báo điện tử Tuổi Trẻ',
      position: 'Ủy viên Ban Thư ký Chi hội',
      isPrimary: false,
    },
  ];

  // Password State
  const [passwordForm] = Form.useForm();
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  // Security & Preferences State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [prefBrowserPush, setPrefBrowserPush] = useState(true);
  const [prefEmailDigest, setPrefEmailDigest] = useState(true);
  const [prefSoundAlert, setPrefSoundAlert] = useState(true);
  const [viewDensity, setViewDensity] = useState('standard');
  const [language, setLanguage] = useState('vi');

  // Handle Avatar Change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      message.error('Dung lượng ảnh tối đa là 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      updateUser({ avatarUrl: result });
      message.success('Đã cập nhật ảnh đại diện thành công!');
    };
    reader.readAsDataURL(file);
  };

  // Handle Password Strength Calc
  const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) setPasswordStrength(0);
    else if (val.length < 6) setPasswordStrength(25);
    else if (val.length < 10) setPasswordStrength(65);
    else setPasswordStrength(100);
  };

  // Handle Password Submit
  const handleSavePassword = async () => {
    setSavingPassword(true);
    setTimeout(() => {
      passwordForm.resetFields();
      setPasswordStrength(0);
      setSavingPassword(false);
      message.success('Đã cập nhật mật khẩu mới thành công!');
    }, 550);
  };

  return (
    <div className="account-page-wrapper">
      {/* 1. UNCROPPED COVER BANNER */}
      <div className="account-cover-banner">
        <img alt="Kỷ niệm 50 năm Báo điện tử Tuổi Trẻ" src="/images/tuoitre-cover.jpg" />
      </div>

      {/* 2. ELEGANT & CLEAN PROFILE HERO */}
      <div className="account-profile-hero">
        <div className="hero-top-row">
          {/* Avatar */}
          <div className="hero-avatar-wrapper">
            <Avatar
              className={`hero-avatar ${avatarTone(user?.fullName ?? 'A')}`}
              size={80}
              src={avatarPreview}
              style={{ fontSize: 26, fontWeight: 700, background: '#fff' }}
            >
              {user?.fullName?.slice(0, 2).toUpperCase()}
            </Avatar>
            <button
              aria-label="Đổi ảnh đại diện"
              className="hero-avatar-badge"
              onClick={() => fileInputRef.current?.click()}
              title="Đổi ảnh đại diện mới"
              type="button"
            >
              <Camera size={13} />
            </button>
            <input
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
              ref={fileInputRef}
              type="file"
            />
          </div>

          {/* Core Info */}
          <div className="hero-info-wrapper">
            <div className="hero-name-row">
              <h1>{user?.fullName || 'Nguyễn Minh Anh'}</h1>
              <span className="live-status-pill">
                <span className="live-dot" />
                Đang hoạt động
              </span>
            </div>
            <p className="hero-subtext">
              {user?.position || 'Phóng viên'} · {user?.department || 'Ban Nội dung'} · {user?.email || 'minhanh@noibo.vn'}
            </p>
          </div>
        </div>

        {/* 3-Tab Underline Navigation */}
        <div className="hero-tabs-bar">
          <button
            className={`hero-tab-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
            type="button"
          >
            <UserIcon size={16} />
            <span>Thông tin cá nhân</span>
          </button>

          <button
            className={`hero-tab-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
            type="button"
          >
            <Lock size={16} />
            <span>Mật khẩu & Bảo mật</span>
          </button>

          <button
            className={`hero-tab-item ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
            type="button"
          >
            <Bell size={16} />
            <span>Cài đặt & Tùy chọn</span>
          </button>
        </div>
      </div>

      {/* 4. ACTIVE TAB CONTENT */}
      <div className="account-content-container">
        {/* =========================================================
            TAB 1: THÔNG TIN CÁ NHÂN (REDESIGNED & STRUCTURED)
            ========================================================= */}
        {activeTab === 'profile' && (
          <div className="cards-stack-layout">
            {/* THẺ 1: HỒ SƠ VIÊN CHỨC & LIÊN HỆ CÔNG VỤ */}
            <div className="account-card-panel">
              <div className="card-panel-header">
                <div>
                  <h2>Hồ sơ cá nhân & Liên hệ</h2>
                  <p>Thông tin định danh nhân sự và phương thức liên lạc công vụ</p>
                </div>
              </div>

              <div className="spec-info-grid">
                {/* Họ và tên */}
                <div className="spec-item-card">
                  <div className="spec-icon-box">
                    <UserIcon size={18} />
                  </div>
                  <div className="spec-content">
                    <span className="spec-label">Họ và tên khai sinh</span>
                    <strong className="spec-value">{user?.fullName}</strong>
                  </div>
                </div>

                {/* Tên đăng nhập */}
                <div className="spec-item-card">
                  <div className="spec-icon-box spec-icon-blue">
                    <AtSign size={18} />
                  </div>
                  <div className="spec-content">
                    <span className="spec-label">Tên tài khoản nội bộ</span>
                    <strong className="spec-value" style={{ color: '#0284c7' }}>
                      @{user?.username || 'minhanh'}
                    </strong>
                  </div>
                </div>

                {/* Email */}
                <div className="spec-item-card">
                  <div className="spec-icon-box spec-icon-red">
                    <Mail size={18} />
                  </div>
                  <div className="spec-content">
                    <span className="spec-label">Email công vụ (@noibo.vn)</span>
                    <strong className="spec-value">{user?.email}</strong>
                  </div>
                </div>

                {/* Số điện thoại */}
                <div className="spec-item-card">
                  <div className="spec-icon-box spec-icon-green">
                    <Phone size={18} />
                  </div>
                  <div className="spec-content">
                    <span className="spec-label">Số điện thoại liên hệ</span>
                    <strong className="spec-value">{phone}</strong>
                  </div>
                </div>

                {/* Bút danh */}
                <div className="spec-item-card">
                  <div className="spec-icon-box spec-icon-purple">
                    <Feather size={18} />
                  </div>
                  <div className="spec-content">
                    <span className="spec-label">Bút danh tác nghiệp</span>
                    <strong className="spec-value">{penName}</strong>
                  </div>
                </div>

                {/* Nơi làm việc */}
                <div className="spec-item-card">
                  <div className="spec-icon-box spec-icon-amber">
                    <MapPin size={18} />
                  </div>
                  <div className="spec-content">
                    <span className="spec-label">Địa điểm làm việc chính</span>
                    <strong className="spec-value">{workplace}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* THẺ 2: CHỨC VỤ & ĐƠN VỊ CÔNG TÁC */}
            <div className="account-card-panel">
              <div className="card-panel-header">
                <div>
                  <h2>Chức vụ & Đơn vị công tác</h2>
                  <p>Danh sách các phòng ban, chức danh chính thức và nhiệm vụ kiêm nhiệm</p>
                </div>
              </div>

              <Table
                className="assignments-styled-table"
                columns={[
                  {
                    title: 'Phòng ban / Đơn vị',
                    dataIndex: 'department',
                    key: 'department',
                    render: (text: string) => (
                      <div className="table-dept-cell">
                        <Building2 className="table-cell-icon" size={16} />
                        <strong>{text}</strong>
                      </div>
                    ),
                  },
                  {
                    title: 'Chức danh / Vị trí',
                    dataIndex: 'position',
                    key: 'position',
                    render: (text: string) => (
                      <div className="table-role-cell">
                        <Briefcase className="table-cell-icon" size={15} />
                        <span>{text}</span>
                      </div>
                    ),
                  },
                  {
                    title: 'Nhiệm vụ',
                    dataIndex: 'isPrimary',
                    key: 'isPrimary',
                    width: 140,
                    render: (isPrimary: boolean) => (
                      <Tag
                        className={isPrimary ? 'tag-primary-assignment' : 'tag-secondary-assignment'}
                      >
                        {isPrimary ? 'Đơn vị chính' : 'Kiêm nhiệm'}
                      </Tag>
                    ),
                  },
                ]}
                dataSource={assignments}
                pagination={false}
                size="middle"
              />

              {/* Notice Banner */}
              <div className="hr-notice-callout">
                <Info size={16} />
                <span>
                  Hồ sơ nhân sự và phân công công tác được quản lý tập trung bởi <strong>Phòng Tổ chức - Hành chính</strong>.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: MẬT KHẨU & BẢO MẬT
            ========================================================= */}
        {activeTab === 'security' && (
          <div className="cards-stack-layout">
            {/* Change Password Card */}
            <div className="account-card-panel">
              <div className="card-panel-header">
                <div>
                  <h2>Đổi mật khẩu</h2>
                  <p>Mật khẩu an toàn nên có tối thiểu 8 ký tự, bao gồm chữ hoa, số và ký hiệu</p>
                </div>
              </div>

              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handleSavePassword}
                style={{ maxWidth: 520, marginTop: 4 }}
              >
                <Form.Item
                  label="Mật khẩu hiện tại"
                  name="currentPassword"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                >
                  <Input.Password
                    placeholder="Nhập mật khẩu đang dùng"
                    prefix={<Lock color="#94a3b8" size={16} />}
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>

                <Form.Item
                  label="Mật khẩu mới"
                  name="newPassword"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                    { min: 6, message: 'Mật khẩu phải có tối thiểu 6 ký tự' },
                  ]}
                >
                  <Input.Password
                    onChange={handlePasswordInput}
                    placeholder="Nhập mật khẩu mới"
                    prefix={<Lock color="#94a3b8" size={16} />}
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>

                {passwordStrength > 0 && (
                  <div className="password-strength-box">
                    <div className="strength-header">
                      <span>Độ an toàn:</span>
                      <strong>
                        {passwordStrength < 50
                          ? 'Yếu'
                          : passwordStrength < 80
                          ? 'Trung bình'
                          : 'Rất mạnh'}
                      </strong>
                    </div>
                    <Progress
                      percent={passwordStrength}
                      showInfo={false}
                      size="small"
                      status={
                        passwordStrength < 50
                          ? 'exception'
                          : passwordStrength < 80
                          ? 'normal'
                          : 'success'
                      }
                      strokeColor={
                        passwordStrength < 50
                          ? '#ef4444'
                          : passwordStrength < 80
                          ? '#f59e0b'
                          : '#10b981'
                      }
                    />
                  </div>
                )}

                <Form.Item
                  dependencies={['newPassword']}
                  label="Xác nhận mật khẩu mới"
                  name="confirmPassword"
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    placeholder="Nhập lại mật khẩu mới"
                    prefix={<Lock color="#94a3b8" size={16} />}
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>

                <Button
                  loading={savingPassword}
                  size="large"
                  style={{
                    borderRadius: 8,
                    fontWeight: 600,
                    marginTop: 8,
                    background: '#d92d20',
                    borderColor: '#d92d20',
                  }}
                  type="primary"
                >
                  Lưu mật khẩu mới
                </Button>
              </Form>
            </div>

            {/* 2-Factor Authentication Card */}
            <div className="account-card-panel">
              <div className="card-panel-header">
                <div>
                  <h2>Xác thực hai yếu tố (2FA)</h2>
                  <p>Bảo vệ tài khoản với lớp bảo mật bổ sung qua OTP hoặc ứng dụng My Tuổi Trẻ</p>
                </div>
                <Switch checked={twoFactorEnabled} onChange={setTwoFactorEnabled} />
              </div>

              <div className="twofa-callout-card">
                <div className="security-icon-circle">
                  <Shield size={20} />
                </div>
                <div>
                  <strong>
                    {twoFactorEnabled ? '2FA Đang được kích hoạt' : '2FA Đang tắt'}
                  </strong>
                  <p>
                    {twoFactorEnabled
                      ? 'Mỗi khi đăng nhập từ thiết bị lạ, hệ thống sẽ gửi mã xác thực OTP về điện thoại hoặc yêu cầu xác nhận trên ứng dụng My Tuổi Trẻ.'
                      : 'Kích hoạt 2FA giúp bảo vệ tài khoản tác nghiệp của bạn trước các nguy cơ tấn công mạng.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 3: CÀI ĐẶT & TÙY CHỌN
            ========================================================= */}
        {activeTab === 'preferences' && (
          <div className="cards-stack-layout">
            {/* Notifications Card */}
            <div className="account-card-panel">
              <div className="card-panel-header">
                <div>
                  <h2>Thông báo hệ thống</h2>
                  <p>Tùy chọn nhận thông báo về tin bài, phân công và văn bản điều hành</p>
                </div>
              </div>

              <div className="settings-list-container">
                <div className="setting-toggle-item">
                  <div className="setting-text-block">
                    <div className="setting-heading-row">
                      <Smartphone size={16} />
                      <strong>Thông báo đẩy trên trình duyệt</strong>
                    </div>
                    <p>Nhận thông báo tức thì khi có phân công tin bài mới hoặc văn bản cần xử lý</p>
                  </div>
                  <Switch checked={prefBrowserPush} onChange={setPrefBrowserPush} />
                </div>

                <div className="setting-toggle-item">
                  <div className="setting-text-block">
                    <div className="setting-heading-row">
                      <Mail size={16} />
                      <strong>Bản tin tổng hợp email</strong>
                    </div>
                    <p>Nhận email tổng hợp công việc và lịch họp hàng ngày vào 7:30 sáng</p>
                  </div>
                  <Switch checked={prefEmailDigest} onChange={setPrefEmailDigest} />
                </div>

                <div className="setting-toggle-item">
                  <div className="setting-text-block">
                    <div className="setting-heading-row">
                      <Volume2 size={16} />
                      <strong>Âm thanh thông báo</strong>
                    </div>
                    <p>Phát âm thanh nhẹ khi có tin nhắn chat hoặc thông báo khẩn</p>
                  </div>
                  <Switch checked={prefSoundAlert} onChange={setPrefSoundAlert} />
                </div>
              </div>
            </div>

            {/* Display & Language Preferences */}
            <div className="account-card-panel">
              <div className="card-panel-header">
                <div>
                  <h2>Hiển thị & Ngôn ngữ</h2>
                  <p>Tùy chỉnh giao diện làm việc cá nhân</p>
                </div>
              </div>

              <div className="info-cards-grid">
                <div className="pref-dropdown-card">
                  <div className="pref-dropdown-header">
                    <Layers size={16} />
                    <strong>Mật độ hiển thị</strong>
                  </div>
                  <p>Tiêu chuẩn (Khuyên dùng cho màn hình làm việc)</p>
                </div>

                <div className="pref-dropdown-card">
                  <div className="pref-dropdown-header">
                    <Globe size={16} />
                    <strong>Ngôn ngữ giao diện</strong>
                  </div>
                  <p>Tiếng Việt (Mặc định toàn hệ thống)</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
