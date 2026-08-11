import { Alert, Button, Form, Input, QRCode, Segmented } from 'antd';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '@/features/auth/AuthContext';
import tuoiTreLogo from '@/assets/logo-tuoitre-2026-do-chu.svg';

interface LoginValues {
  username: string;
  password: string;
}

type LoginMethod = 'account' | 'qr';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm<LoginValues>();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [method, setMethod] = useState<LoginMethod>('account');
  const [qrCountdown, setQrCountdown] = useState(60);
  const [qrToken, setQrToken] = useState(() => `tuoitre-erp-qr-${Date.now()}`);

  // QR Code countdown timer
  useEffect(() => {
    if (method !== 'qr') return;
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
  }, [method]);

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

  const fillDemoAccount = (username: string) => {
    form.setFieldsValue({ username, password: '123456' });
    setError('');
  };

  const handleSimulateQrScan = async (role: 'admin' | 'nhanvien' = 'admin') => {
    setSubmitting(true);
    setError('');
    try {
      await login(role, '123456');
      navigate('/', { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể xác thực bằng mã QR.');
    } finally {
      setSubmitting(false);
    }
  };

  const refreshQr = () => {
    setQrToken(`tuoitre-erp-qr-${Date.now()}`);
    setQrCountdown(60);
  };

  return (
    <main className="login-page">
      <section className="login-intro" aria-label="Giới thiệu hệ thống">
        <div className="login-intro-header">
          <div className="brand brand-login">
            <img alt="Tuổi Trẻ" className="brand-logo login-brand-logo" src={tuoiTreLogo} />
          </div>
          <span className="login-badge-tag">Hệ thống Nội bộ</span>
        </div>

        <div className="login-intro-hero">
          <span className="intro-kicker">Hệ thống Quản trị</span>
          <h1>
            Không gian làm việc số<br />
            Báo điện tử Tuổi Trẻ
          </h1>
        </div>

        <small className="login-footer-copy">
          © 2026 Báo điện tử Tuổi Trẻ
        </small>
      </section>

      <section className="login-form-wrap">
        <div className="login-card">
          <header className="login-card-header">
            <h2>Đăng nhập hệ thống</h2>
            <p>Chọn phương thức để bắt đầu phiên làm việc</p>
          </header>

          {/* Login Method Segmented Switcher */}
          <div className="login-method-selector">
            <Segmented<LoginMethod>
              block
              options={[
                {
                  label: (
                    <span className="method-tab-item">
                      <svg fill="none" height="15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="15">
                        <rect height="11" rx="2" ry="2" width="18" x="3" y="11" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Tài khoản nội bộ
                    </span>
                  ),
                  value: 'account',
                },
                {
                  label: (
                    <span className="method-tab-item">
                      <svg fill="none" height="15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="15">
                        <rect height="7" width="7" x="3" y="3" />
                        <rect height="7" width="7" x="14" y="3" />
                        <rect height="7" width="7" x="14" y="14" />
                        <rect height="7" width="7" x="3" y="14" />
                      </svg>
                      Quét mã QR
                    </span>
                  ),
                  value: 'qr',
                },
              ]}
              value={method}
              onChange={(val) => {
                setMethod(val);
                setError('');
              }}
            />
          </div>

          {error && <Alert className="login-error-alert" message={error} role="alert" showIcon type="error" />}

          {/* METHOD 1: USERNAME & PASSWORD */}
          {method === 'account' ? (
            <Form<LoginValues>
              className="login-form-account"
              form={form}
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
                  placeholder="Mã nhân sự / Email nội bộ"
                  prefix={
                    <svg fill="none" height="17" stroke="#667085" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="17">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  }
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
                  placeholder="Nhập mật khẩu"
                  prefix={
                    <svg fill="none" height="17" stroke="#667085" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="17">
                      <rect height="11" rx="2" ry="2" width="18" x="3" y="11" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  }
                />
              </Form.Item>

              <Button block className="login-submit-btn" htmlType="submit" loading={submitting} size="large" type="primary">
                Đăng nhập
              </Button>
            </Form>
          ) : (
            /* METHOD 2: QR CODE SCANNING VIA MY TUỔI TRẺ APP */
            <div className="login-qr-container">
              <div className="qr-box-wrapper">
                <div className="qr-code-frame">
                  <QRCode
                    bordered={false}
                    icon={tuoiTreLogo}
                    iconSize={{ width: 46, height: 18 }}
                    size={160}
                    value={qrToken}
                  />
                  <div className="qr-scan-laser-line" />
                </div>
                <div className="qr-status-badge">
                  <span className="live-dot" />
                  <span>Mã QR đổi sau <strong>{qrCountdown}s</strong></span>
                  <button className="qr-refresh-btn" onClick={refreshQr} type="button">
                    ↻ Làm mới
                  </button>
                </div>
              </div>

              <div className="qr-instructions">
                <h4>📱 3 bước đăng nhập bằng My Tuổi Trẻ:</h4>
                <ol>
                  <li>Mở ứng dụng <strong>My Tuổi Trẻ</strong> trên điện thoại.</li>
                  <li>Chọn biểu tượng <strong>Quét mã QR</strong>.</li>
                  <li>Hướng camera vào màn hình để đăng nhập.</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
