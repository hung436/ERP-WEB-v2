import { Alert, Avatar, Button, Form, Input, Progress, Switch, Tag, message } from 'antd';
import {
  Award,
  BadgeCheck,
  Building,
  Camera,
  CheckCircle2,
  FileText,
  Headphones,
  HelpCircle,
  KeyRound,
  Laptop,
  Lock,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { useAuth } from '@/features/auth/AuthContext';
import { avatarTone } from '@/utils/avatar';
import '@/features/account/account-page.css';

export function AccountSettingsTab() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatarUrl);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'email-notifications' | 'support'>('profile');

  const [savingPassword, setSavingPassword] = useState(false);
  const [sendingSupport, setSendingSupport] = useState(false);

  const [passwordForm] = Form.useForm();
  const [supportForm] = Form.useForm();

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
      message.success('Đã cập nhật ảnh đại diện mới!');
    };
    reader.readAsDataURL(file);
  };

  const handleSavePassword = async () => {
    setSavingPassword(true);
    setTimeout(() => {
      passwordForm.resetFields();
      setSavingPassword(false);
      message.success('Đã đổi mật khẩu thành công!');
    }, 600);
  };

  const handleSendSupport = async () => {
    setSendingSupport(true);
    setTimeout(() => {
      supportForm.resetFields();
      setSendingSupport(false);
      message.success('Đã gửi yêu cầu hỗ trợ đến Bộ phận IT Báo Tuổi Trẻ!');
    }, 600);
  };

  return (
    <div className="account-page-shell">
      {/* 1. UNCROPPED UNBLURRED HERITAGE COVER PHOTO */}
      <div className="account-cover-frame">
        <img src="/images/tuoitre-cover.jpg" alt="Kỷ niệm 50 năm Báo Tuổi Trẻ" />
      </div>

      {/* 2. MODERN PROFILE HERO IDENTITY CARD */}
      <div className="account-identity-hero">
        <div className="account-hero-top">
          {/* User Identity Details */}
          <div className="account-user-meta">
            {/* Avatar Badge with Single Camera Trigger */}
            <div className="account-avatar-ring">
              <Avatar
                size={96}
                src={avatarPreview}
                className={`avatar-large ${avatarTone(user?.fullName ?? 'A')}`}
                style={{ fontSize: 32, fontWeight: 700, background: '#fff' }}
              >
                {user?.fullName?.slice(0, 2).toUpperCase()}
              </Avatar>

              <button
                type="button"
                className="avatar-upload-trigger"
                aria-label="Cập nhật ảnh đại diện"
                onClick={() => fileInputRef.current?.click()}
                title="Bấm để chọn ảnh đại diện mới"
              >
                <Camera size={16} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </div>

            {/* Names & Badges */}
            <div className="account-user-names">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1>{user?.fullName}</h1>
                <Tag color="error" style={{ borderRadius: 6, fontWeight: 700, padding: '2px 8px', margin: 0 }}>
                  {user?.position}
                </Tag>
                <Tag color="success" style={{ borderRadius: 6, fontWeight: 600, padding: '2px 8px', margin: 0, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={13} /> Đã xác minh
                </Tag>
              </div>

              <p>{user?.department} · Báo Tuổi Trẻ TP.HCM</p>
            </div>
          </div>

          {/* Quick Achievement Stats */}
          <div className="account-stats-row">
            <div className="account-stat-card">
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fef3f2', color: '#d92d20', display: 'grid', placeItems: 'center' }}>
                <Award size={18} />
              </div>
              <div>
                <strong>5+ Năm</strong>
                <small>Thâm niên công tác</small>
              </div>
            </div>

            <div className="account-stat-card">
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#e0f2fe', color: '#0284c7', display: 'grid', placeItems: 'center' }}>
                <FileText size={18} />
              </div>
              <div>
                <strong>248 Bài</strong>
                <small>Đã xuất bản</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. VERTICAL TABS LAYOUT STRUCTURE */}
      <div className="account-vertical-layout">
        {/* Left Sidebar: Vertical Navigation Tabs */}
        <div className="account-vertical-sidebar">
          <div style={{ marginBottom: 12, padding: '0 8px' }}>
            <small style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quản lý tài khoản</small>
          </div>

          <button
            type="button"
            className={`account-vertical-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <UserIcon size={18} /> Thông tin cá nhân
          </button>

          <button
            type="button"
            className={`account-vertical-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Lock size={18} /> Mật khẩu & Bảo mật
          </button>

          <button
            type="button"
            className={`account-vertical-btn ${activeTab === 'email-notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('email-notifications')}
          >
            <Mail size={18} /> Thông báo email
          </button>

          <button
            type="button"
            className={`account-vertical-btn ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            <Headphones size={18} /> Liên hệ hỗ trợ
          </button>
        </div>

        {/* Right Content Panel with Fixed Min-Height Wrapper */}
        <div className="account-tab-content-wrapper">
          {/* TAB 1: THÔNG TIN CÁ NHÂN */}
          {activeTab === 'profile' && (
            <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(0, 1fr)', gap: 20 }}>
              {/* Left Column Overview */}
              <div className="surface-panel" style={{ padding: 20, borderRadius: 18, border: '1px solid #eaecf0', background: '#fff', height: 'fit-content' }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={16} color="#d92d20" /> Tổng quan tài khoản
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ padding: 12, background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                    <small style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Mã số nhân sự</small>
                    <strong style={{ display: 'block', color: '#0284c7', fontSize: 14, marginTop: 2 }}>TT-2026-889</strong>
                  </div>

                  <div style={{ padding: 12, background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                    <small style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Phân quyền hệ thống</small>
                    <Tag color="volcano" style={{ marginTop: 4, fontWeight: 600 }}>Phóng viên Biên tập ERP</Tag>
                  </div>

                  <div style={{ padding: 12, background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                    <small style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Cơ quan xác thực</small>
                    <strong style={{ display: 'block', color: '#0f172a', fontSize: 13, marginTop: 2 }}>Ban Tổ chức Cán bộ</strong>
                  </div>

                  <div style={{ padding: 12, background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                    <small style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Hoàn thiện hồ sơ</small>
                    <div style={{ marginTop: 6 }}>
                      <Progress percent={100} strokeColor="#059669" size="small" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Data Grid */}
              <div className="surface-panel" style={{ padding: 28, borderRadius: 18, border: '1px solid #eaecf0', background: '#fff' }}>
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Hồ sơ nhân sự chính thức</h3>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>Dữ liệu nhân sự được xác minh bởi Ban Tổ chức - Cán bộ Báo Tuổi Trẻ</p>
                </div>

                <Alert
                  message="Quản lý dữ liệu tập trung"
                  description="Thông tin nhân sự cá nhân, bút danh, chức danh và đơn vị được lưu trữ chính thức trên CSDL Nhân sự Báo Tuổi Trẻ. Vui lòng liên hệ Phòng Tổ chức - Cán bộ khi cần cập nhật điều chỉnh."
                  type="info"
                  showIcon
                  icon={<Lock size={18} color="#0284c7" />}
                  style={{ marginBottom: 20, borderRadius: 12, background: '#f0f9ff', border: '1px solid #b9e6fe' }}
                />

                <div className="info-detail-grid">
                  <div className="info-detail-card">
                    <div className="info-detail-icon" style={{ background: '#fef3f2', color: '#d92d20' }}>
                      <UserIcon size={20} />
                    </div>
                    <div className="info-detail-body">
                      <small>Họ và tên khai sinh</small>
                      <strong>{user?.fullName}</strong>
                    </div>
                  </div>

                  <div className="info-detail-card">
                    <div className="info-detail-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
                      <FileText size={20} />
                    </div>
                    <div className="info-detail-body">
                      <small>Bút danh xuất bản</small>
                      <strong>{user?.penName || 'Minh Anh (Tuổi Trẻ)'}</strong>
                    </div>
                  </div>

                  <div className="info-detail-card">
                    <div className="info-detail-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                      <Mail size={20} />
                    </div>
                    <div className="info-detail-body">
                      <small>Email công vụ</small>
                      <strong>{user?.email}</strong>
                    </div>
                  </div>

                  <div className="info-detail-card">
                    <div className="info-detail-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                      <Phone size={20} />
                    </div>
                    <div className="info-detail-body">
                      <small>Điện thoại nội bộ</small>
                      <strong>0908 123 456 (Ext: 889)</strong>
                    </div>
                  </div>

                  <div className="info-detail-card">
                    <div className="info-detail-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                      <Building size={20} />
                    </div>
                    <div className="info-detail-body">
                      <small>Đơn vị công tác</small>
                      <strong>{user?.department}</strong>
                    </div>
                  </div>

                  <div className="info-detail-card">
                    <div className="info-detail-icon" style={{ background: '#fdf2f8', color: '#db2777' }}>
                      <BadgeCheck size={20} />
                    </div>
                    <div className="info-detail-body">
                      <small>Chức danh hiện tại</small>
                      <strong>{user?.position}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MẬT KHẨU & BẢO MẬT */}
          {activeTab === 'security' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="surface-panel" style={{ padding: 28, borderRadius: 18, border: '1px solid #eaecf0', background: '#fff' }}>
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <KeyRound size={18} color="#d92d20" /> Đổi mật khẩu truy cập
                  </h3>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>Mật khẩu cần tối thiểu 8 ký tự bao gồm chữ hoa, chữ thường và số</p>
                </div>

                <Form form={passwordForm} layout="vertical" onFinish={handleSavePassword}>
                  <Form.Item label="Mật khẩu hiện tại" name="currentPassword" rules={[{ required: true, message: 'Nhập mật khẩu hiện tại' }]}>
                    <Input.Password size="large" prefix={<Lock size={16} color="#94a3b8" />} placeholder="••••••••" style={{ borderRadius: 10 }} />
                  </Form.Item>

                  <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, message: 'Nhập mật khẩu mới' }]}>
                    <Input.Password size="large" prefix={<Lock size={16} color="#94a3b8" />} placeholder="••••••••" style={{ borderRadius: 10 }} />
                  </Form.Item>

                  <Form.Item label="Xác nhận mật khẩu mới" name="confirmPassword" rules={[{ required: true, message: 'Xác nhận lại mật khẩu' }]}>
                    <Input.Password size="large" prefix={<Lock size={16} color="#94a3b8" />} placeholder="••••••••" style={{ borderRadius: 10 }} />
                  </Form.Item>

                  <Button type="primary" htmlType="submit" loading={savingPassword} size="large" style={{ background: '#d92d20', borderColor: '#d92d20', borderRadius: 10, width: '100%', fontWeight: 600, marginTop: 8 }}>
                    Cập nhật mật khẩu
                  </Button>
                </Form>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="surface-panel" style={{ padding: 24, borderRadius: 18, border: '1px solid #eaecf0', background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: '#ecfdf5', color: '#059669', display: 'grid', placeItems: 'center' }}>
                        <ShieldCheck size={22} />
                      </div>
                      <div>
                        <strong style={{ display: 'block', fontSize: 15, color: '#0f172a' }}>Xác thực 2 yếu tố (2FA)</strong>
                        <p style={{ margin: 0, color: '#64748b', fontSize: 12 }}>Yêu cầu OTP khi đăng nhập thiết bị lạ</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="surface-panel" style={{ padding: 24, borderRadius: 18, border: '1px solid #eaecf0', background: '#fff' }}>
                  <h4 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Thiết bị đang hoạt động</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Laptop size={18} color="#0284c7" />
                        <div>
                          <strong style={{ display: 'block', fontSize: 13, color: '#0f172a' }}>Windows PC • Chrome</strong>
                          <small style={{ color: '#059669', fontSize: 11, fontWeight: 600 }}>Đang hoạt động</small>
                        </div>
                      </div>
                      <Tag color="green">Hiện tại</Tag>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Smartphone size={18} color="#64748b" />
                        <div>
                          <strong style={{ display: 'block', fontSize: 13, color: '#0f172a' }}>iPhone 15 Pro • Safari</strong>
                          <small style={{ color: '#64748b', fontSize: 11 }}>2 giờ trước</small>
                        </div>
                      </div>
                      <Button size="small" type="text" danger>Đăng xuất</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THÔNG BÁO EMAIL */}
          {activeTab === 'email-notifications' && (
            <div className="surface-panel" style={{ padding: 28, borderRadius: 18, border: '1px solid #eaecf0', background: '#fff' }}>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={18} color="#d92d20" /> Cài đặt Thông báo Email
                </h3>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>Quản lý các loại tin nhắn và thông báo được gửi về hòm thư công vụ {user?.email}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f8fafc', border: '1px solid #eaecf0', borderRadius: 14 }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: 14, color: '#0f172a' }}>Email tổng hợp nhiệm vụ cần xử lý 8h00 sáng</strong>
                    <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: 12 }}>Tóm tắt danh sách công việc, cuộc họp và tờ trình trong ngày</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f8fafc', border: '1px solid #eaecf0', borderRadius: 14 }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: 14, color: '#0f172a' }}>Email thông báo khi bài viết xuất bản thành công</strong>
                    <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: 12 }}>Gửi email xác nhận kèm đường dẫn liên kết bài viết đăng tải</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f8fafc', border: '1px solid #eaecf0', borderRadius: 14 }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: 14, color: '#0f172a' }}>Email nhắc hạn sắp hết hạn xử lý (Trước 24h)</strong>
                    <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: 12 }}>Cảnh báo khẩn cấp các công việc, đề tài bài viết sắp tới hạn chót</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f8fafc', border: '1px solid #eaecf0', borderRadius: 14 }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: 14, color: '#0f172a' }}>Email cảnh báo an toàn & Đăng nhập thiết bị mới</strong>
                    <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: 12 }}>Thông báo ngay lập tức khi phát hiện tài khoản đăng nhập ở vị trí khác</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LIÊN HỆ HỖ TRỢ */}
          {activeTab === 'support' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
              {/* Left Column: Direct Support Form */}
              <div className="surface-panel" style={{ padding: 28, borderRadius: 18, border: '1px solid #eaecf0', background: '#fff' }}>
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <HelpCircle size={18} color="#d92d20" /> Gửi Yêu cầu Hỗ trợ Kỹ thuật / Nhân sự
                  </h3>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>Gửi phiếu hỗ trợ trực tiếp đến Bộ phận CNTT và Phòng Tổ chức Cán bộ</p>
                </div>

                <Form form={supportForm} layout="vertical" onFinish={handleSendSupport}>
                  <Form.Item label="Chủ đề cần hỗ trợ" name="subject" rules={[{ required: true, message: 'Chọn chủ đề hỗ trợ' }]}>
                    <Input size="large" placeholder="Ví dụ: Đề xuất cập nhật lại bút danh bài viết..." style={{ borderRadius: 10 }} />
                  </Form.Item>

                  <Form.Item label="Chi tiết nội dung cần trợ giúp" name="content" rules={[{ required: true, message: 'Nhập nội dung yêu cầu' }]}>
                    <Input.TextArea rows={4} placeholder="Mô tả cụ thể vấn đề kỹ thuật hoặc thắc mắc nhân sự bạn đang gặp phải..." style={{ borderRadius: 10 }} />
                  </Form.Item>

                  <div style={{ textAlign: 'right' }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={sendingSupport}
                      size="large"
                      icon={<Send size={16} />}
                      style={{ background: '#d92d20', borderColor: '#d92d20', borderRadius: 10, minWidth: 160, fontWeight: 600 }}
                    >
                      Gửi yêu cầu hỗ trợ
                    </Button>
                  </div>
                </Form>
              </div>

              {/* Right Column: Contact Channels Card */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="surface-panel" style={{ padding: 24, borderRadius: 18, border: '1px solid #eaecf0', background: '#fff' }}>
                  <h4 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Headphones size={16} color="#0284c7" /> Trực ban Hỗ trợ Tuổi Trẻ
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ padding: 12, background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                      <small style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Hotline Phòng CNTT & Hệ thống ERP</small>
                      <strong style={{ display: 'block', color: '#d92d20', fontSize: 14, marginTop: 2 }}>028.3997.3838 (Ext: 115)</strong>
                    </div>

                    <div style={{ padding: 12, background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                      <small style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Hotline Phòng Tổ chức - Cán bộ (TCCB)</small>
                      <strong style={{ display: 'block', color: '#0284c7', fontSize: 14, marginTop: 2 }}>028.3997.3838 (Ext: 202)</strong>
                    </div>

                    <div style={{ padding: 12, background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                      <small style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Email tiếp nhận phản hồi</small>
                      <strong style={{ display: 'block', color: '#0f172a', fontSize: 13, marginTop: 2 }}>support.erp@tuoitre.com.vn</strong>
                    </div>
                  </div>
                </div>

                <div className="surface-panel" style={{ padding: 20, borderRadius: 18, border: '1px solid #eaecf0', background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <MapPin size={20} color="#d92d20" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <strong style={{ display: 'block', fontSize: 13, color: '#0f172a' }}>Tòa soạn Báo Tuổi Trẻ</strong>
                      <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: 12, lineHeight: 1.4 }}>
                        60A Hoàng Văn Thụ, Phường 9, Quận Phú Nhuận, TP. Hồ Chí Minh
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
