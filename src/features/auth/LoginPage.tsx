import { Alert, Button, Form, Input } from 'antd';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '@/features/auth/AuthContext';
import tuoiTreLogo from '@/assets/logo-tuoitre-2026-do-chu.svg';

interface LoginValues { username: string; password: string }

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (user) return <Navigate replace to="/" />;

  const submit = async (values: LoginValues) => {
    setSubmitting(true); setError('');
    try { await login(values.username, values.password); navigate('/', { replace: true }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể đăng nhập.'); }
    finally { setSubmitting(false); }
  };

  return <main className="login-page">
    <section className="login-intro" aria-label="Giới thiệu hệ thống">
      <div className="brand brand-login"><img alt="Tuổi Trẻ" className="brand-logo login-brand-logo" src={tuoiTreLogo} /><span><strong>Không gian làm việc</strong><small>ERP nội bộ</small></span></div>
      <div><span className="intro-kicker">Làm việc tập trung</span><h1>Mọi công việc quan trọng trong một không gian.</h1><p>Theo dõi nhiệm vụ, họp trực tuyến và thông tin nội bộ rõ ràng, đúng lúc.</p></div>
      <small>Hệ thống dành cho cán bộ, nhân viên cơ quan</small>
    </section>
    <section className="login-form-wrap">
      <div className="login-card">
        <div><span className="eyebrow">Chào mừng trở lại</span><h2>Đăng nhập</h2><p>Sử dụng tài khoản nội bộ để tiếp tục.</p></div>
        {error && <Alert message={error} role="alert" showIcon type="error" />}
        <Form<LoginValues> layout="vertical" onFinish={submit} requiredMark={false}>
          <Form.Item label="Tên đăng nhập" name="username" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập.' }]}><Input autoComplete="username" placeholder="Nhập tên đăng nhập" /></Form.Item>
          <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu.' }, { min: 6, message: 'Mật khẩu có ít nhất 6 ký tự.' }]}><Input.Password autoComplete="current-password" placeholder="Nhập mật khẩu" /></Form.Item>
          <Button block htmlType="submit" loading={submitting} size="large" type="primary">Đăng nhập</Button>
        </Form>
        <div className="demo-account"><span>Tài khoản dùng thử</span><code>nhanvien</code><span>/</span><code>123456</code></div>
      </div>
    </section>
  </main>;
}
