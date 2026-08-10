import { Button, Input, Popover, Segmented, Tooltip, message } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ContentSkeleton, EmptyState, ErrorState } from '@/components/AsyncState';
import { CountedTabLabel } from '@/components/CountedTabLabel';
import { ChatComposer } from '@/features/chat/components/ChatComposer';
import { ChatActionIcon } from '@/features/chat/components/ChatActionIcon';
import { ConversationInfoPanel } from '@/features/chat/components/ConversationInfoPanel';
import { CreateGroupModal } from '@/features/chat/components/CreateGroupModal';
import { useAsyncData } from '@/hooks/useAsyncData';
import { chatApi } from '@/services/api';
import type { ChatMessage, ChatReply } from '@/types/domain';
import { avatarTone, nameInitials } from '@/utils/avatar';

const reactionOptions = ['👍', '❤️', '😂', '😮', '😢', '👏'];

export function ChatPage() {
  const [searchParams] = useSearchParams();
  const conversationsState = useAsyncData(async () => (await chatApi.conversations()).data);
  const membersState = useAsyncData(async () => (await chatApi.members()).data);
  const [selectedId, setSelectedId] = useState(() => searchParams.get('conversation') ?? '');
  const [search, setSearch] = useState('');
  const [conversationFilter, setConversationFilter] = useState<'all' | 'unread'>('all');
  const [messageSearch, setMessageSearch] = useState('');
  const [messageSearchOpen, setMessageSearchOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatReply>();
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updatingMembers, setUpdatingMembers] = useState(false);
  const [pendingAction, setPendingAction] = useState('');
  const messageListRef = useRef<HTMLDivElement>(null);

  const effectiveId = selectedId || conversationsState.data?.[0]?.id || '';
  const messagesState = useAsyncData(async () => effectiveId ? (await chatApi.messages(effectiveId)).data : [], effectiveId);
  const selected = conversationsState.data?.find((item) => item.id === effectiveId);
  const filtered = useMemo(() => (conversationsState.data ?? [])
    .filter((item) => item.participantName.toLowerCase().includes(search.toLowerCase()))
    .filter((item) => conversationFilter === 'all' || item.unreadCount > 0)
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || b.lastMessageAt.localeCompare(a.lastMessageAt)), [conversationsState.data, search, conversationFilter]);
  const visibleMessages = useMemo(() => (messagesState.data ?? []).filter((item) => !messageSearch || `${item.senderName} ${item.content} ${item.attachment?.name ?? ''}`.toLowerCase().includes(messageSearch.toLowerCase())), [messagesState.data, messageSearch]);
  const unreadConversations = (conversationsState.data ?? []).filter((item) => item.unreadCount > 0).length;

  useEffect(() => {
    if (!messagesState.loading && !messageSearch) {
      const messageList = messageListRef.current;
      if (messageList) messageList.scrollTop = messageList.scrollHeight;
    }
  }, [effectiveId, messagesState.loading, visibleMessages.length, messageSearch]);

  const sendMessage = async (content: string, file?: File) => {
    if (!effectiveId) return;
    setSending(true);
    try {
      const attachment = file ? (await chatApi.uploadAttachment(effectiveId, { name: file.name, size: file.size, type: file.type || 'application/octet-stream' })).data : undefined;
      await chatApi.sendMessage(effectiveId, content, attachment, replyTo);
      setReplyTo(undefined);
      await Promise.all([messagesState.reload(), conversationsState.reload()]);
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Không thể gửi tin nhắn.');
    } finally {
      setSending(false);
    }
  };

  const createGroup = async (name: string, memberIds: string[]) => {
    setCreating(true);
    try {
      const created = (await chatApi.createGroup(name, memberIds)).data;
      setSelectedId(created.id);
      await conversationsState.reload();
      setGroupOpen(false);
      message.success('Đã tạo nhóm mới');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Không thể tạo nhóm.');
    } finally {
      setCreating(false);
    }
  };

  const updateMember = async (action: 'add' | 'remove', memberId: string) => {
    if (!effectiveId) return;
    setUpdatingMembers(true);
    try {
      if (action === 'add') await chatApi.addMember(effectiveId, memberId);
      else await chatApi.removeMember(effectiveId, memberId);
      await conversationsState.reload();
      message.success(action === 'add' ? 'Đã thêm thành viên' : 'Đã xóa thành viên');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Không thể cập nhật thành viên.');
    } finally {
      setUpdatingMembers(false);
    }
  };

  const react = async (item: ChatMessage, emoji: string) => {
    setPendingAction(`reaction-${item.id}`);
    try {
      await chatApi.react(effectiveId, item.id, emoji);
      await messagesState.reload();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Không thể thả cảm xúc.');
    } finally {
      setPendingAction('');
    }
  };

  const deleteMessage = async (item: ChatMessage) => {
    setPendingAction(`delete-${item.id}`);
    try {
      await chatApi.deleteMessage(effectiveId, item.id);
      await Promise.all([messagesState.reload(), conversationsState.reload()]);
      message.success('Đã xóa tin nhắn');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Không thể xóa tin nhắn.');
    } finally {
      setPendingAction('');
    }
  };

  const togglePin = async () => {
    if (!selected) return;
    setPendingAction('pin');
    try {
      const updated = (await chatApi.togglePin(selected.id)).data;
      await conversationsState.reload();
      message.success(updated.pinned ? 'Đã ghim hội thoại' : 'Đã bỏ ghim hội thoại');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Không thể ghim hội thoại.');
    } finally {
      setPendingAction('');
    }
  };

  if (conversationsState.loading) return <div className="module-page"><ContentSkeleton rows={10} /></div>;
  if (conversationsState.error) return <ErrorState message={conversationsState.error} onRetry={conversationsState.reload} />;
  if (!conversationsState.data?.length) return <EmptyState description="Chưa có cuộc trò chuyện" />;

  return <div className="module-page chat-page">
    <section className={`messaging-shell chat-workspace surface-panel${infoOpen ? ' with-info' : ''}`}>
      <aside className="conversation-pane">
        <div className="chat-list-heading">
          <div><h2>Tin nhắn</h2><span>{conversationsState.data.length}</span></div>
          <Tooltip title="Tạo nhóm"><Button aria-label="Tạo nhóm" icon={<ChatActionIcon name="group" />} onClick={() => setGroupOpen(true)} /></Tooltip>
        </div>
        <div className="chat-list-tools">
          <Input aria-label="Tìm cuộc trò chuyện" allowClear onChange={(event) => setSearch(event.target.value)} placeholder="Tìm kiếm" value={search} />
          <Segmented block onChange={(value) => setConversationFilter(value as 'all' | 'unread')} options={[{ label: <CountedTabLabel count={conversationsState.data.length} label="Tất cả" />, value: 'all' }, { label: <CountedTabLabel count={unreadConversations} label="Chưa đọc" />, value: 'unread' }]} value={conversationFilter} />
        </div>
        <div className="conversation-list">
          {filtered.length ? filtered.map((item) => <button className={item.id === effectiveId ? 'conversation active' : 'conversation'} key={item.id} onClick={() => { setSelectedId(item.id); setReplyTo(undefined); setMessageSearch(''); setMessageSearchOpen(false); }} type="button">
            <span className={`avatar neutral ${avatarTone(item.participantName)}`}>{item.participantName.slice(0, 2).toUpperCase()}<i className={item.online ? 'online' : ''} /></span>
            <span><strong>{item.participantName}{item.pinned && <i className="pin-indicator" aria-label="Đã ghim">●</i>}</strong><small>{item.isGroup ? `${item.members.length} thành viên · ` : ''}{item.lastMessage}</small></span>
            <span><time>{new Date(item.lastMessageAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</time>{item.unreadCount > 0 && <b>{item.unreadCount}</b>}</span>
          </button>) : <EmptyState description="Không tìm thấy hội thoại" />}
        </div>
      </aside>

      <div className="message-pane">
        <header>
          <span className={`avatar neutral ${avatarTone(selected?.participantName ?? 'Hội thoại')}`}>{selected?.participantName.slice(0, 2).toUpperCase()}</span>
          <span className="chat-identity"><strong>{selected?.participantName}</strong><small className={selected?.online ? 'chat-presence online' : 'chat-presence'}><i />{selected?.isGroup ? `${selected.members.length} thành viên` : selected?.online ? 'Đang hoạt động' : 'Ngoại tuyến'}</small></span>
          <div className="chat-header-actions">
            <Tooltip title="Tìm trong hội thoại"><Button aria-label="Tìm trong hội thoại" icon={<ChatActionIcon name="search" />} onClick={() => setMessageSearchOpen((current) => !current)} /></Tooltip>
            <Tooltip title={selected?.pinned ? 'Bỏ ghim hội thoại' : 'Ghim hội thoại'}><Button aria-label={selected?.pinned ? 'Bỏ ghim hội thoại' : 'Ghim hội thoại'} icon={<ChatActionIcon name="pin" />} loading={pendingAction === 'pin'} onClick={() => void togglePin()} /></Tooltip>
            <Tooltip title="Thông tin hội thoại"><Button aria-label="Xem thông tin hội thoại" icon={<ChatActionIcon name="info" />} onClick={() => setInfoOpen((current) => !current)} /></Tooltip>
          </div>
        </header>

        {messageSearchOpen && <div className="message-search"><Input aria-label="Tìm trong tin nhắn" allowClear onChange={(event) => setMessageSearch(event.target.value)} placeholder="Tìm nội dung hoặc tên tệp" value={messageSearch} /><span>{visibleMessages.length} kết quả</span></div>}

        <div className="message-list" ref={messageListRef}>
          {messagesState.loading ? <ContentSkeleton rows={6} /> : messagesState.error ? <ErrorState message={messagesState.error} onRetry={messagesState.reload} /> : visibleMessages.length ? visibleMessages.map((item, index) => <div className="message-block" key={item.id}>
            {(index === 0 || new Date(visibleMessages[index - 1].sentAt).toDateString() !== new Date(item.sentAt).toDateString()) && <div className="message-day">{new Date(item.sentAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>}
            <div className={item.isMine ? 'message mine' : 'message'}>
              {!item.isMine && selected?.isGroup && (
                <span className={`avatar group-msg-avatar ${avatarTone(item.senderName)}`} title={item.senderName}>
                  {nameInitials(item.senderName)}
                </span>
              )}
              <div className="message-wrapper">
                {!item.isMine && selected?.isGroup && (
                  <small className="message-sender-name">{item.senderName}</small>
                )}
                <div className="message-bubble">
                  {item.replyTo && <div className="message-reply"><small>{item.replyTo.senderName}</small><strong>{item.replyTo.content}</strong></div>}
                  <span className="message-content">{item.content}</span>
                  {item.attachment && <span className="message-attachment"><strong>{item.attachment.name}</strong><small>{(item.attachment.size / 1024).toFixed(1)} KB · {item.attachment.type}</small></span>}
                  {Boolean(item.reactions?.length) && <span className="message-reactions">{item.reactions?.map((reaction) => <button aria-label={`${reaction.reacted ? 'Bỏ' : 'Thả'} cảm xúc ${reaction.emoji}`} className={reaction.reacted ? 'reacted' : ''} disabled={pendingAction === `reaction-${item.id}`} key={reaction.emoji} onClick={() => void react(item, reaction.emoji)} type="button">{reaction.emoji} {reaction.count}</button>)}</span>}
                </div>
              </div>
              <time>{new Date(item.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</time>
              <div className="message-actions" aria-label="Thao tác tin nhắn">
                <Tooltip title="Trả lời"><button aria-label={`Trả lời tin nhắn của ${item.senderName}`} onClick={() => setReplyTo({ id: item.id, senderName: item.senderName, content: item.content })} type="button"><ChatActionIcon name="reply" /></button></Tooltip>
                <Popover content={<div className="reaction-picker">{reactionOptions.map((emoji) => <button aria-label={`Thả cảm xúc ${emoji}`} disabled={pendingAction === `reaction-${item.id}`} key={emoji} onClick={() => void react(item, emoji)} type="button">{emoji}</button>)}</div>} placement="top" trigger="click">
                  <Tooltip title="Thả cảm xúc"><button aria-label="Chọn cảm xúc" type="button"><ChatActionIcon name="reaction" /></button></Tooltip>
                </Popover>
                {item.isMine && <Tooltip title="Xóa tin nhắn"><button aria-label="Xóa tin nhắn" disabled={pendingAction === `delete-${item.id}`} onClick={() => void deleteMessage(item)} type="button"><ChatActionIcon name="trash" /></button></Tooltip>}
              </div>
            </div>
          </div>) : <EmptyState description={messageSearch ? 'Không tìm thấy tin nhắn phù hợp' : 'Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện.'} />}
        </div>

        <ChatComposer disabled={!selected} onCancelReply={() => setReplyTo(undefined)} onSend={sendMessage} replyTo={replyTo} sending={sending} />
      </div>

      {infoOpen && selected && <ConversationInfoPanel conversation={selected} members={membersState.data ?? []} messages={messagesState.data ?? []} onAddMember={(id) => updateMember('add', id)} onClose={() => setInfoOpen(false)} onRemoveMember={(id) => updateMember('remove', id)} updating={updatingMembers} />}
    </section>
    <CreateGroupModal creating={creating} members={membersState.data ?? []} onClose={() => setGroupOpen(false)} onCreate={createGroup} open={groupOpen} />
  </div>;
}
