import { Alert, Button, Checkbox, Form, Input, QRCode, message } from 'antd';
import { ArrowRight, Lock, QrCode, RefreshCw, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '@/features/auth/AuthContext';
import tuoiTreLogo from '@/assets/logo-tuoitre-2026-do-chu.svg';
import './login.css';

interface LoginValues {
  username: string;
  password: string;
  remember?: boolean;
}

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm<LoginValues>();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [qrCountdown, setQrCountdown] = useState(60);
  const [qrToken, setQrToken] = useState(() => `tuoitre-erp-qr-${Date.now()}`);

  // QR Code auto-refresh timer
  useEffect(() => {
    const interval = setInterval(() => {
      setQrCountdown((prev) => {
        if (prev <= 1) {
          setQrToken(`tuoitre-erp-qr-${Date.now()}`);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (user) return <Navigate replace to="/" />;

  const submit = async (values: LoginValues) => {
    setSubmitting(true);
    setError('');
    try {
      await login(values.username, values.password);
      navigate('/', { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Tên đăng nhập hoặc mật khẩu không đúng.');
    } finally {
      setSubmitting(false);
    }
  };

  const refreshQr = () => {
    setQrToken(`tuoitre-erp-qr-${Date.now()}`);
    setQrCountdown(60);
    message.success('Đã tạo mã QR đăng nhập mới');
  };

  // Quick Demo Account Autofill
  const fillDemoAccount = (username: string) => {
    form.setFieldsValue({
      username,
      password: '123456',
      remember: true,
    });
    setError('');
  };

  return (
    <main className="login-viewport-shell">
      {/* Background Ambience */}
      <div className="login-bg-texture" />
      <div className="login-bg-glow" />

      {/* Top Large Brand Logo Only */}
      <header className="login-masthead-center">
        <div className="masthead-large-logo">
          <img alt="Báo điện tử Tuổi Trẻ" src={tuoiTreLogo} />
        </div>
      </header>

      {/* Central Dual-Login Card */}
      <div className="login-dual-card">
        {/* LEFT COLUMN: ACCOUNT CREDENTIALS LOGIN */}
        <section className="login-left-section">
          <div className="login-form-heading">
            <h2>Đăng nhập</h2>
            <p>Sử dụng tài khoản nội bộ để truy cập hệ thống</p>
          </div>

          {error && (
            <Alert
              className="login-error-alert"
              message={error}
              role="alert"
              showIcon
              type="error"
            />
          )}

          <Form<LoginValues>
            className="login-fields-form"
            form={form}
            initialValues={{ remember: true }}
            layout="vertical"
            onFinish={submit}
            requiredMark={false}
          >
            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập.' }]}
            >
              <Input
                autoComplete="username"
                className="login-input-box"
                placeholder="Tên đăng nhập hoặc email nội bộ"
                prefix={<UserIcon color="#94a3b8" size={16} />}
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu.' },
                { min: 6, message: 'Mật khẩu có ít nhất 6 ký tự.' },
              ]}
            >
              <Input.Password
                autoComplete="current-password"
                className="login-input-box"
                placeholder="Nhập mật khẩu của bạn"
                prefix={<Lock color="#94a3b8" size={16} />}
                size="large"
              />
            </Form.Item>

            <div className="form-sub-options">
              <Form.Item name="remember" noStyle valuePropName="checked">
                <Checkbox style={{ fontSize: 13, color: '#475467' }}>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>
              <a
                className="btn-forgot-pass"
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  message.info('Vui lòng liên hệ Phòng CNTT (Ext: 101) để cấp lại mật khẩu.');
                }}
              >
                Quên mật khẩu?
              </a>
            </div>

            <Button
              block
              className="btn-submit-action"
              htmlType="submit"
              loading={submitting}
              size="large"
              type="primary"
            >
              <span>Đăng nhập</span>
              <ArrowRight size={16} />
            </Button>
          </Form>
        </section>

        {/* RIGHT COLUMN: INSTANT QR CODE LOGIN */}
        <section className="login-right-section">
          <div className="qr-masthead-title">
            <QrCode color="#d92d20" size={18} />
            <span>Quét mã QR qua App</span>
          </div>

          <div className="qr-box-frame">
            <QRCode
              bordered={false}
              icon={tuoiTreLogo}
              iconSize={{ width: 38, height: 14 }}
              size={152}
              value={qrToken}
            />
            <div className="qr-laser-scanner" />
          </div>

          <div className="qr-meta-status">
            <span className="qr-pulse-dot" />
            <span>Mã đổi sau <strong>{qrCountdown}s</strong></span>
            <button className="btn-qr-refresh" onClick={refreshQr} title="Lấy mã mới" type="button">
              <RefreshCw size={12} /> Làm mới
            </button>
          </div>

          <p className="qr-guide-text">
            Mở ứng dụng <strong>My Tuổi Trẻ</strong> trên điện thoại và quét mã để đăng nhập tức thì.
          </p>
        </section>
      </div>

      {/* Discreet Demo Quick Fill Bar */}
      <div className="demo-accounts-pill-row">
        <ShieldCheck size={15} />
        <span>Tài khoản mẫu:</span>
        <button
          className="demo-btn-chip"
          onClick={() => fillDemoAccount('nhanvien')}
          type="button"
        >
          👤 Phóng viên (nhanvien)
        </button>
        <button
          className="demo-btn-chip"
          onClick={() => fillDemoAccount('admin')}
          type="button"
        >
          👨‍💼 Quản trị (admin)
        </button>
      </div>

      {/* Footer */}
      <footer className="login-site-footer">
        <small>© 2026 Báo điện tử Tuổi Trẻ</small>
      </footer>
    </main>
  );
}
