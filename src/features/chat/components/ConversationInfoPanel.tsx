import { Button, Select } from 'antd';
import { useMemo, useState } from 'react';

import type { ChatConversation, ChatMember, ChatMessage } from '@/types/domain';
import { avatarTone } from '@/utils/avatar';

export function ConversationInfoPanel({ conversation, members, messages, updating, onClose, onAddMember, onRemoveMember }: { conversation: ChatConversation; members: ChatMember[]; messages: ChatMessage[]; updating: boolean; onClose: () => void; onAddMember: (memberId: string) => Promise<void>; onRemoveMember: (memberId: string) => Promise<void> }) {
  const [memberId, setMemberId] = useState<string>();
  const available = useMemo(() => members.filter((item) => !conversation.members.some((current) => current.id === item.id)), [conversation, members]);
  const files = messages.flatMap((item) => item.attachment ? [{ ...item.attachment, sentAt: item.sentAt }] : []);
  return <aside className="conversation-info-panel" aria-label="Thông tin hội thoại"><div className="info-panel-heading"><strong>Thông tin hội thoại</strong><button aria-label="Đóng thông tin hội thoại" onClick={onClose} type="button">×</button></div><div className="conversation-info">
    <header><span className={`conversation-info-avatar ${avatarTone(conversation.participantName)}`}>{conversation.participantName.slice(0, 2).toUpperCase()}</span><h2>{conversation.participantName}</h2><p>{conversation.isGroup ? `${conversation.members.length} thành viên` : conversation.online ? 'Đang trực tuyến' : 'Ngoại tuyến'}</p></header>
    <section><h3>{conversation.isGroup ? 'Thành viên nhóm' : 'Người tham gia'}</h3><div className="member-list">{conversation.members.map((member) => <div className="member-row" key={member.id}><span className={`member-avatar ${avatarTone(member.name)}`}>{member.name.slice(0, 2).toUpperCase()}<i className={member.online ? 'online' : ''} /></span><span><strong>{member.name}</strong><small>{member.department}</small></span>{conversation.isGroup && member.id !== 'user-001' && <Button danger disabled={updating} onClick={() => void onRemoveMember(member.id)} size="small">Xóa</Button>}</div>)}</div></section>
    {conversation.isGroup && <section className="add-member"><h3>Thêm thành viên</h3><div><Select aria-label="Chọn thành viên cần thêm" onChange={setMemberId} options={available.map((item) => ({ value: item.id, label: `${item.name} · ${item.department}` }))} placeholder="Chọn đồng nghiệp" value={memberId} /><Button disabled={!memberId} loading={updating} onClick={async () => { if (memberId) { await onAddMember(memberId); setMemberId(undefined); } }} type="primary">Thêm</Button></div></section>}
    <section><h3>Tệp đã chia sẻ</h3>{files.length ? <div className="shared-file-list">{files.map((file) => <div key={file.id}><span>📎</span><span><strong>{file.name}</strong><small>{(file.size / 1024).toFixed(1)} KB · {new Date(file.sentAt).toLocaleDateString('vi-VN')}</small></span></div>)}</div> : <p className="no-shared-files">Chưa có tệp được chia sẻ.</p>}</section>
  </div></aside>;
}
