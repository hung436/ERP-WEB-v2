import { render } from '@testing-library/react';

import { App } from '@/App';

export function renderApp(path: string, authenticated = false) {
  window.sessionStorage.clear();
  if (authenticated) {
    window.sessionStorage.setItem('erp-session', 'mock-token');
    window.sessionStorage.setItem('tuoitre_bday_welcomed_user-001_' + new Date().toDateString(), 'true');
    window.sessionStorage.setItem('birthday_modal_shown_user-001', 'true');
  }
  window.history.pushState({}, '', path);
  return render(<App />);
}
