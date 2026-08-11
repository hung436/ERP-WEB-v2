import { Button, Input, Modal, Tooltip, message } from 'antd';
import { useState } from 'react';

import { ModuleIcon } from '@/components/ModuleIcon';
import { MailActionIcon } from '@/features/mail/components/MailActionIcon';
import { MailFileIcon } from '@/features/mail/components/MailFileIcon';
import { mailApi } from '@/services/api';
import type { MailAttachment, MailItem } from '@/types/domain';
import { avatarTone } from '@/utils/avatar';

type QuickMode = 'reply' | 'reply-all' | 'forward';

export function MailQuickView({ mail, onClose }: { mail: MailItem; onClose: () => void }) {
  const [currentMail, setCurrentMail] = useState(mail);
  const [mode, setMode] = useState<QuickMode | null>(null);
  const [content, setContent] = useState('');
  const [recipient, setRecipient] = useState('');
  const [sending, setSending] = useState(false);
  const [acting, setActing] = useState('');
  const [attachments, setAttachments] = useState<MailAttachment[]>([]);
  const begin = (nextMode: QuickMode) => {
    setMode(nextMode);
    setRecipient(nextMode === 'forward' ? '' : [currentMail.senderEmail, ...(nextMode === 'reply-all' ? currentMail.recipients ?? [] : [])].filter(Boolean).join(', '));
    setContent(nextMode === 'forward' ? `\n\n---------- Thư được chuyển tiếp ----------\n${currentMail.body}` : '');
  };
  const send = async () => {
    if (!mode || !content.trim() || (mode === 'forward' && !recipient.trim())) return;
    setSending(true);
    try {
      if (mode === 'forward') await mailApi.send({ recipients: recipient.split(/[,;]/).map((item) => item.trim()).filter(Boolean), subject: `Fwd: ${currentMail.subject}`, content, attachments: [...(currentMail.attachments ?? []), ...attachments] });
      else await mailApi.reply(currentMail.id, content, mode === 'reply-all', attachments);
      setContent(''); setAttachments([]); setMode(null); message.success(mode === 'forward' ? 'Đã chuyển tiếp Mail' : mode === 'reply-all' ? 'Đã trả lời tất cả' : 'Đã gửi trả lời');
    } catch (error) { message.error(error instanceof Error ? error.message : 'Không thể gửi Mail.'); }
    finally { setSending(false); }
  };
  const attachFiles = (files: FileList | null) => setAttachments(files ? Array.from(files).map((file, index) => ({ id: `quick-mail-file-${Date.now()}-${index}`, name: file.name, size: file.size, type: file.type || 'application/octet-stream' })) : []);
  const runAction = async (action: Parameters<typeof mailApi.action>[1]) => {
    setActing(action);
    try { const updated = (await mailApi.action(currentMail.id, action)).data; setCurrentMail(updated); message.success('Đã cập nhật Mail'); if (action === 'trash' || action === 'archive') onClose(); }
    catch (error) { message.error(error instanceof Error ? error.message : 'Không thể cập nhật Mail.'); }
    finally { setActing(''); }
  };

  return <Modal centered className="dashboard-preview workspace-preview mail-preview-modal" footer={null} onCancel={onClose} open title={<span className="preview-title"><span className="section-icon mail"><ModuleIcon module="mail" size={20} /></span><strong>{currentMail.subject}</strong></span>} width={760}>
    <article className="mail-preview-content">
      <div className="quick-mail-toolbar"><Tooltip title="Lưu trữ"><Button aria-label="Lưu trữ Mail" icon={<MailActionIcon name="archive" />} loading={acting === 'archive'} onClick={() => void runAction('archive')} /></Tooltip><Tooltip title={currentMail.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}><Button aria-label={currentMail.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'} icon={<MailActionIcon name="unread" />} onClick={() => void runAction(currentMail.isRead ? 'mark-unread' : 'mark-read')} /></Tooltip><Tooltip title="Xóa"><Button danger aria-label="Xóa Mail" icon={<MailActionIcon name="trash" />} onClick={() => void runAction('trash')} /></Tooltip></div>
      <header><span className={`mail-preview-avatar ${avatarTone(currentMail.senderName)}`}>{currentMail.senderName.slice(0, 2).toUpperCase()}</span><span><strong>{currentMail.senderName}</strong><small>{currentMail.senderEmail} · tới {currentMail.recipients?.join(', ') || 'tôi'}</small></span><time>{new Date(currentMail.sentAt).toLocaleString('vi-VN')}</time></header><div className="mail-preview-body">{currentMail.body}</div>
      {Boolean(currentMail.attachments?.length) && <div className="quick-mail-files">{currentMail.attachments?.map((file) => <span key={file.id}><MailFileIcon compact file={file} /><span><strong>{file.name}</strong><small>{(file.size / 1024).toFixed(0)} KB</small></span></span>)}</div>}
      <div className="quick-mail-actions"><Button icon={<MailActionIcon name="reply" />} onClick={() => begin('reply')}>Trả lời</Button><Button icon={<MailActionIcon name="replyAll" />} onClick={() => begin('reply-all')}>Trả lời tất cả</Button><Button icon={<MailActionIcon name="forward" />} onClick={() => begin('forward')}>Chuyển tiếp</Button></div>
      {mode && <section className="mail-inline-reply" aria-label={mode === 'forward' ? 'Chuyển tiếp thư' : 'Trả lời thư'}><div><strong>{mode === 'reply' ? 'Trả lời' : mode === 'reply-all' ? 'Trả lời tất cả' : 'Chuyển tiếp'}</strong><button className="inline-compose-close" onClick={() => { setMode(null); setAttachments([]); }} type="button">Đóng</button></div>{mode === 'forward' && <Input aria-label="Người nhận chuyển tiếp" onChange={(event) => setRecipient(event.target.value)} placeholder="Email người nhận" value={recipient} />}<Input.TextArea aria-label="Nội dung Mail" onChange={(event) => setContent(event.target.value)} placeholder="Nhập nội dung…" rows={5} value={content} /><label className="quick-mail-attachment"><MailActionIcon name="attachment" /><span>Đính kèm tệp</span><input multiple onChange={(event) => attachFiles(event.target.files)} type="file" /></label>{attachments.length > 0 && <div className="quick-mail-compose-files">{attachments.map((file) => <span key={file.id}><MailFileIcon compact file={file} /><span><strong>{file.name}</strong><small>{(file.size / 1024).toFixed(0)} KB</small></span><button aria-label={`Bỏ tệp ${file.name}`} onClick={() => setAttachments((current) => current.filter((item) => item.id !== file.id))} type="button">×</button></span>)}</div>}<footer><small>{attachments.length ? `${attachments.length} tệp đính kèm` : 'Tệp tối đa 10 MB'}</small><Button onClick={() => { setMode(null); setAttachments([]); }}>Hủy</Button><Button disabled={!content.trim() || (mode === 'forward' && !recipient.trim())} loading={sending} onClick={() => void send()} type="primary">Gửi</Button></footer></section>}
    </article>
  </Modal>;
}
