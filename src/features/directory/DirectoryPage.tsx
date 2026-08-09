import { Button, Input, Select, message } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ContentSkeleton, EmptyState, ErrorState } from '@/components/AsyncState';
import { ModuleIcon } from '@/components/ModuleIcon';
import { contactInitials, matchesDirectorySearch } from '@/features/directory/utils';
import { useAsyncData } from '@/hooks/useAsyncData';
import { chatApi, directoryApi } from '@/services/api';
import type { DirectoryContact } from '@/types/domain';
import { avatarTone } from '@/utils/avatar';

export function DirectoryPage() {
  const navigate = useNavigate();
  const state = useAsyncData(async () => (await directoryApi.list()).data);
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [chattingId, setChattingId] = useState('');
  const departments = useMemo(() => [...new Set((state.data ?? []).map((contact) => contact.department))].sort((a, b) => a.localeCompare(b, 'vi')), [state.data]);
  const contacts = useMemo(() => (state.data ?? []).filter((contact) => (!department || contact.department === department) && matchesDirectorySearch(contact, query)), [state.data, department, query]);
  const startChat = async (contact: DirectoryContact) => {
    setChattingId(contact.id);
    try {
      const conversation = (await chatApi.startDirect(contact)).data;
      navigate(`/chat?conversation=${encodeURIComponent(conversation.id)}`);
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Không thể mở cuộc trò chuyện.');
      setChattingId('');
    }
  };

  return <div className="module-page directory-module-page">
    <div className="directory-toolbar surface-panel">
      <Input aria-label="Tìm kiếm trong danh bạ" allowClear onChange={(event) => setQuery(event.target.value)} prefix={<ModuleIcon module="directory" size={18} />} placeholder="Tìm theo họ tên, điện thoại, email hoặc số nội bộ" value={query} />
      <Select aria-label="Lọc theo phòng ban" onChange={setDepartment} options={[{ value: '', label: 'Tất cả phòng ban' }, ...departments.map((item) => ({ value: item, label: item }))]} value={department} virtual={false} />
      <span className="directory-count"><strong>{contacts.length}</strong> nhân sự</span>
    </div>

    {state.loading ? <ContentSkeleton rows={9} /> : state.error ? <ErrorState message={state.error} onRetry={state.reload} /> : contacts.length === 0 ? <EmptyState description="Không tìm thấy nhân sự phù hợp" /> : <section aria-label="Danh sách nhân sự" className="directory-grid">{contacts.map((contact) => <article className="contact-card surface-panel" key={contact.id}>
      <div className="contact-card-header"><div className="contact-profile-trigger"><span className={`contact-avatar ${avatarTone(contact.fullName)}`}>{contactInitials(contact.fullName)}</span><span className="contact-identity"><strong>{contact.fullName}{contact.penName && <em>({contact.penName})</em>}</strong><span>{contact.department}</span></span></div><Button aria-label={`Chat với ${contact.fullName}`} icon={<ModuleIcon module="chat" size={17} />} loading={chattingId === contact.id} onClick={() => void startChat(contact)}>Chat</Button></div>
      <div className="contact-channels"><span><small>Điện thoại</small><strong title={contact.phone}>{contact.phone}</strong></span><span><small>Email</small><strong title={contact.email}>{contact.email}</strong></span></div>
      <footer>{contact.extension ? <span className="contact-extension">Máy lẻ {contact.extension}</span> : <span>Không có số nội bộ</span>}</footer>
    </article>)}</section>}
  </div>;
}
