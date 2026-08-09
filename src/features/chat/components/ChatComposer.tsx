import { Button, Input, Popover, Tooltip, message } from 'antd';
import { useEffect, useRef, useState } from 'react';

import type { ChatReply } from '@/types/domain';
import { ChatActionIcon } from '@/features/chat/components/ChatActionIcon';

const emojis = ['😀', '😂', '😍', '👍', '👏', '🎉', '❤️', '🙏'];

export function ChatComposer({ disabled, sending, replyTo, onCancelReply, onSend }: { disabled?: boolean; sending: boolean; replyTo?: ChatReply; onCancelReply: () => void; onSend: (content: string, file?: File) => Promise<void> }) {
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | undefined>();
  const fileInput = useRef<HTMLInputElement>(null);
  const messageInput = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (replyTo) messageInput.current?.focus();
  }, [replyTo]);

  const selectFile = (selected?: File) => {
    if (!selected) return;
    if (selected.size > 10 * 1024 * 1024) { message.error('Tệp đính kèm không được vượt quá 10 MB'); return; }
    setFile(selected);
  };
  const submit = async () => {
    if (!content.trim() && !file) return;
    await onSend(content.trim(), file);
    setContent(''); setFile(undefined);
    if (fileInput.current) fileInput.current.value = '';
  };

  return <footer className="chat-composer">
    {replyTo && <div className="composer-reply"><span><small>Đang trả lời {replyTo.senderName}</small><strong>{replyTo.content}</strong></span><button aria-label="Hủy trả lời" onClick={onCancelReply} type="button">×</button></div>}
    {file && <div className="composer-file"><i><ChatActionIcon name="attachment" /></i><span><strong>{file.name}</strong><small>{(file.size / 1024).toFixed(1)} KB · Tệp đính kèm</small></span><button aria-label="Bỏ tệp đính kèm" onClick={() => setFile(undefined)} type="button">×</button></div>}
    <div className="composer-row"><input aria-label="Chọn tệp đính kèm" hidden onChange={(event) => selectFile(event.target.files?.[0])} ref={fileInput} type="file" /><Tooltip title="Đính kèm tệp"><Button aria-label="Đính kèm tệp" disabled={disabled || sending} icon={<ChatActionIcon name="attachment" />} onClick={() => fileInput.current?.click()} /></Tooltip><Popover content={<div className="emoji-picker">{emojis.map((emoji) => <button aria-label={`Chèn ${emoji}`} key={emoji} onClick={() => { setContent((current) => `${current}${emoji}`); messageInput.current?.focus(); }} type="button">{emoji}</button>)}</div>} placement="top" trigger="click"><Tooltip title="Chèn biểu tượng cảm xúc"><Button aria-label="Chọn biểu tượng cảm xúc" disabled={disabled} icon={<ChatActionIcon name="emoji" />} /></Tooltip></Popover><Input.TextArea aria-label="Soạn tin nhắn" disabled={disabled} onChange={(event) => setContent(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void submit(); } }} placeholder="Nhập tin nhắn…" ref={messageInput} rows={1} value={content} /><Tooltip title="Gửi tin nhắn"><Button aria-label="Gửi" disabled={disabled || (!content.trim() && !file)} icon={<ChatActionIcon name="send" />} loading={sending} onClick={() => void submit()} type="primary" /></Tooltip></div>
    <small>Enter để gửi · Shift + Enter để xuống dòng · Tệp tối đa 10 MB</small>
  </footer>;
}
