import { message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Maximize2, Minus, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ContentSkeleton, EmptyState, ErrorState } from '@/components/AsyncState';
import { useAsyncData } from '@/hooks/useAsyncData';
import { chatApi } from '@/services/api';
import type { ChatConversation } from '@/types/domain';
import { avatarTone } from '@/utils/avatar';

export function ChatQuickView({ chat, onClose }: { chat: ChatConversation; onClose: () => void }) {
  const navigate = useNavigate();
  const messagesState = useAsyncData(async () => (await chatApi.messages(chat.id)).data, chat.id);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState('');
  const [minimized, setMinimized] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!messagesState.loading && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messagesState.loading, messagesState.data?.length]);

  const handleOpenFullChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    navigate(`/chat?conversation=${encodeURIComponent(chat.id)}`);
  };

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;
    const content = inputText.trim();
    setInputText('');
    setSending(true);
    try {
      await chatApi.sendMessage(chat.id, content);
      await messagesState.reload();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Không thể gửi tin nhắn.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const presence = chat.isGroup
    ? `${chat.members.length} thành viên`
    : chat.online
    ? 'Đang hoạt động'
    : 'Không hoạt động';

  return (
    <div className={`messenger-quick-chat ${minimized ? 'minimized' : ''}`}>
      {/* Messenger Header */}
      <div className="fb-chat-header" onClick={() => minimized && setMinimized(false)}>
        <div className="fb-user-info">
          <div className="fb-avatar-wrap">
            <span className={`fb-avatar ${avatarTone(chat.participantName)}`}>
              {chat.participantName.slice(0, 2).toUpperCase()}
            </span>
            {chat.online && <span className="fb-online-badge" />}
          </div>
          <div className="fb-name-meta">
            <strong>{chat.participantName}</strong>
            <small>{presence}</small>
          </div>
        </div>

        <div className="fb-chat-controls">
          <button
            aria-label="Mở trang Chat đầy đủ"
            className="fb-control-btn"
            onClick={handleOpenFullChat}
            title="Mở module Chat đầy đủ"
            type="button"
          >
            <Maximize2 size={15} />
          </button>
          <button
            aria-label="Thu gọn chat"
            className="fb-control-btn"
            onClick={(e) => {
              e.stopPropagation();
              setMinimized(!minimized);
            }}
            title={minimized ? 'Mở rộng' : 'Thu gọn'}
            type="button"
          >
            <Minus size={16} />
          </button>
          <button
            aria-label="Đóng chat"
            className="fb-control-btn close-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            title="Đóng chat"
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messenger Body */}
      {!minimized && (
        <>
          <div className="fb-chat-body" ref={listRef}>
            {messagesState.loading ? (
              <ContentSkeleton rows={4} />
            ) : messagesState.error ? (
              <ErrorState message={messagesState.error} onRetry={messagesState.reload} />
            ) : messagesState.data?.length ? (
              messagesState.data.slice(-12).map((item) => (
                <div className={`fb-message-row ${item.isMine ? 'mine' : 'other'}`} key={item.id}>
                  {!item.isMine && (
                    <span className={`fb-msg-avatar ${avatarTone(item.senderName)}`}>
                      {item.senderName.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <div className="fb-msg-content">
                    <p>{item.content}</p>
                    {item.attachment && (
                      <div className="fb-attachment-tag">📎 {item.attachment.name}</div>
                    )}
                    <time>{new Date(item.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</time>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState description="Hãy gửi tin nhắn..." />
            )}
          </div>

          {/* Messenger Footer Input */}
          <div className="fb-chat-footer">
            <input
              className="fb-chat-input"
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn..."
              value={inputText}
            />
            <button
              aria-label="Gửi tin nhắn"
              className={`fb-send-btn ${inputText.trim() ? 'active' : ''}`}
              disabled={!inputText.trim() || sending}
              onClick={() => void handleSend()}
              type="button"
            >
              <Send size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
