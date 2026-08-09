import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#D92D20', colorLink: '#B42318', colorText: '#1D2939', colorTextSecondary: '#475467',
    colorBorder: '#E4E7EC', colorBgLayout: '#F5F7FA', borderRadius: 10, fontFamily: 'Inter, system-ui, sans-serif',
    controlHeight: 38,
  },
  components: {
    Button: { primaryShadow: 'none', fontWeight: 600 },
    Menu: { itemBorderRadius: 8, itemSelectedBg: '#FEF3F2', itemSelectedColor: '#B42318' },
    Table: { headerBg: '#F9FAFB', headerColor: '#475467' },
  },
};
