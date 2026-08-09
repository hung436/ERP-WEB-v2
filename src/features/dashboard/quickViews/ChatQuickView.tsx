import { Modal, message } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { ContentSkeleton, EmptyState, ErrorState } from '@/components/AsyncState';
import { ChatComposer } from '@/features/chat/components/ChatComposer';
import { useAsyncData } from '@/hooks/useAsyncData';
import { chatApi } from '@/services/api';
import type { ChatConversation } from '@/types/domain';
import { avatarTone } from '@/utils/avatar';

export function ChatQuickView({ chat, onClose }: { chat: ChatConversation; onClose: () => void }) {
  const messagesState = useAsyncData(async () => (await chatApi.messages(chat.id)).data, chat.id);
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!messagesState.loading && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [messagesState.loading, messagesState.data?.length]);
  const send = async (content: string, file?: File) => {
    setSending(true);
    try {
      const attachment = file ? (await chatApi.uploadAttachment(chat.id, { name: file.name, size: file.size, type: file.type || 'application/octet-stream' })).data : undefined;
      await chatApi.sendMessage(chat.id, content, attachment);
      await messagesState.reload();
    } catch (error) { message.error(error instanceof Error ? error.message : 'Không thể gửi tin nhắn.'); }
    finally { setSending(false); }
  };

  const presence = chat.isGroup ? `${chat.members.length} thành viên` : chat.online ? 'Đang trực tuyến' : 'Không trực tuyến';
  return <Modal centered className="dashboard-preview workspace-preview chat-preview-modal" footer={null} onCancel={onClose} open title={<span className="chat-quick-title"><span className={`chat-preview-avatar ${avatarTone(chat.participantName)}`}>{chat.participantName.slice(0, 2).toUpperCase()}<i className={chat.online ? 'online' : ''} /></span><span><strong>{chat.participantName}</strong><small className={chat.online ? 'online' : ''}><i />{presence}</small></span>{chat.unreadCount > 0 && <b>{chat.unreadCount}</b>}</span>} width={700}>
    <div className="chat-preview-content"><div className="quick-chat-messages" ref={listRef}>{messagesState.loading ? <ContentSkeleton rows={4} /> : messagesState.error ? <ErrorState message={messagesState.error} onRetry={messagesState.reload} /> : messagesState.data?.length ? messagesState.data.slice(-8).map((item) => <div className={item.isMine ? 'quick-chat-message mine' : 'quick-chat-message'} key={item.id}><small>{item.senderName}</small><p>{item.content}</p>{item.attachment && <span>{item.attachment.name}</span>}<time>{new Date(item.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</time></div>) : <EmptyState description="Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện." />}</div><ChatComposer onCancelReply={() => undefined} onSend={send} sending={sending} /></div>
  </Modal>;
}
