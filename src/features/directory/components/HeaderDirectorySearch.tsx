import { AutoComplete, Input } from 'antd';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { ModuleIcon } from '@/components/ModuleIcon';
import { contactInitials, matchesDirectorySearch } from '@/features/directory/utils';
import { useAsyncData } from '@/hooks/useAsyncData';
import { directoryApi } from '@/services/api';
import type { DirectoryContact } from '@/types/domain';
import { avatarTone } from '@/utils/avatar';

export function HeaderDirectorySearch({ onSelect }: { onSelect: (contact: DirectoryContact) => void }) {
  const state = useAsyncData(async () => (await directoryApi.list()).data);
  const [query, setQuery] = useState('');
  const results = useMemo(() => (state.data ?? []).filter((contact) => matchesDirectorySearch(contact, query)).slice(0, 6), [state.data, query]);
  const options = query.trim() ? results.map((contact) => ({
    value: contact.id,
    label: <span className="directory-search-option"><span className={`contact-avatar compact ${avatarTone(contact.fullName)}`}>{contactInitials(contact.fullName)}</span><span className="directory-option-copy"><strong>{contact.fullName}{contact.penName && <em>({contact.penName})</em>}</strong><small>{contact.department}</small><span>{contact.email}</span></span><span className="directory-option-contact"><strong>{contact.phone}</strong>{contact.extension && <small>Máy lẻ {contact.extension}</small>}</span></span>,
  })) : [];

  return <div className="header-directory-search">
    <span className="header-directory-icon"><ModuleIcon module="directory" size={19} /></span>
    <AutoComplete notFoundContent={state.loading ? 'Đang tải…' : 'Không tìm thấy nhân sự'} onSearch={setQuery} onSelect={(id) => { const contact = state.data?.find((item) => item.id === id); if (contact) { onSelect(contact); setQuery(''); } }} options={options} popupClassName="header-directory-dropdown" popupMatchSelectWidth={560} value={query}>
      <Input aria-label="Tìm kiếm danh bạ toàn cục" allowClear placeholder="Tìm tên, email, số điện thoại, máy lẻ…" variant="borderless" />
    </AutoComplete>
    <Link aria-label="Mở toàn bộ Danh bạ" to="/directory">Danh bạ <span aria-hidden="true">→</span></Link>
  </div>;
}
