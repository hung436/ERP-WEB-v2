import { render } from '@testing-library/react';

import { App } from '@/App';

export function renderApp(path: string, authenticated = false) {
  window.sessionStorage.clear();
  if (authenticated) window.sessionStorage.setItem('erp-session', 'mock-token');
  window.history.pushState({}, '', path);
  return render(<App />);
}
