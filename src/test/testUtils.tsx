import { render } from '@testing-library/react';

import { App } from '@/App';

export function renderApp(path: string, authenticated: boolean | 'admin' = false) {
  window.sessionStorage.clear();
  window.localStorage.removeItem('erp-session');
  if (authenticated) {
    const token = authenticated === 'admin' ? 'mock-admin-token' : 'mock-token';
    const userId = authenticated === 'admin' ? 'user-admin' : 'user-001';
    window.sessionStorage.setItem('erp-session', token);
    window.sessionStorage.setItem(`tuoitre_bday_welcomed_${userId}_` + new Date().toDateString(), 'true');
    window.sessionStorage.setItem(`birthday_modal_shown_${userId}`, 'true');
  }
  window.history.pushState({}, '', path);
  return render(<App />);
}
