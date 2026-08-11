import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { BrowserRouter } from 'react-router-dom';

import { antdTheme } from '@/config/theme';
import { AuthProvider } from '@/features/auth/AuthContext';
import { AppRoutes } from '@/routes/AppRoutes';

export function App() {
  return (
    <ConfigProvider locale={viVN} theme={antdTheme}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}
