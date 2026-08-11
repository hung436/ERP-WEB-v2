import { Button, Form, Input, Modal, Select, Tooltip, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ContentSkeleton, EmptyState, ErrorState } from '@/components/AsyncState';
import { ModuleIcon } from '@/components/ModuleIcon';
import { RichTextEditor } from '@/components/RichTextEditor';
import { MailActionIcon } from '@/features/mail/components/MailActionIcon';
import { MailFileIcon } from '@/features/mail/components/MailFileIcon';
import { useAsyncData } from '@/hooks/useAsyncData';
import { mailApi } from '@/services/api';
import type { MailAttachment, MailComposePayload } from '@/types/domain';
import { AlertOctagon, Archive, FileText, Inbox, Send, Trash2 } from 'lucide-react';
import { avatarTone } from '@/utils/avatar';

type Folder = 'inbox' | 'sent' | 'drafts' | 'archive' | 'spam' | 'trash';
type ComposeMode = 'compose' | 'reply' | 'reply-all' | 'forward';
type MailFilter = 'all' | 'unread' | 'read' | 'attachments';
interface ComposeValues { recipients: string; cc?: string; bcc?: string; subject: string; content: string }

const folders: { key: Folder; label: string; icon: JSX.Element }[] = [
  { key: 'inbox', label: 'Hộp thư đến', icon: <Inbox size={18} /> },
  { key: 'sent', label: 'Đã gửi', icon: <Send size={18} /> },
  { key: 'drafts', label: 'Bản nháp', icon: <FileText size={18} /> },
  { key: 'archive', label: 'Lưu trữ', icon: <Archive size={18} /> },
  { key: 'spam', label: 'Thư rác', icon: <AlertOctagon size={18} /> },
  { key: 'trash', label: 'Thùng rác', icon: <Trash2 size={18} /> },
];
const getFormattedSender = (emailOrName: string) => {
  if (!emailOrName) return 'Người gửi';
  if (emailOrName.includes('@')) {
    const user = emailOrName.split('@')[0];
    const match = user.match(/dongnghiep(\d+)/i);
    if (match) return `Đồng nghiệp ${match[1]}`;
    return user.charAt(0).toUpperCase() + user.slice(1);
  }
  return emailOrName;
};

const getAvatarInitials = (name: string) => {
  const formatted = getFormattedSender(name);
  const words = formatted.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return formatted.slice(0, 2).toUpperCase();
};

const splitAddresses = (value?: string) => (value ?? '').split(/[,;]/).map((item) => item.trim()).filter(Boolean);

export function MailPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [folder, setFolder] = useState<Folder>('inbox');
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [mailFilter, setMailFilter] = useState<MailFilter>('all');
  const [composer, setComposer] = useState<ComposeMode | null>(null);
  const [showCarbonCopy, setShowCarbonCopy] = useState(false);
  const [attachments, setAttachments] = useState<MailAttachment[]>([]);
  const [sending, setSending] = useState(false);
  const [acting, setActing] = useState('');
  const [editingDraftId, setEditingDraftId] = useState<string>();
  const [form] = Form.useForm<ComposeValues>();
  const state = useAsyncData(async () => (await mailApi.list()).data);
  const rows = useMemo(() => (state.data ?? [])
    .filter((mail) => (mail.folder ?? 'inbox') === folder)
    .filter((mail) => `${mail.senderName} ${mail.senderEmail} ${mail.recipients?.join(' ') ?? ''} ${mail.subject} ${mail.preview} ${mail.attachments?.map((file) => file.name).join(' ') ?? ''}`.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi')))
    .filter((mail) => mailFilter === 'all' ? true : mailFilter === 'unread' ? !mail.isRead : mailFilter === 'read' ? mail.isRead : Boolean(mail.attachments?.length)), [folder, mailFilter, search, state.data]);
  const folderCounts = useMemo(() => folders.reduce<Record<Folder, number>>((counts, item) => ({ ...counts, [item.key]: (state.data ?? []).filter((mail) => (mail.folder ?? 'inbox') === item.key).length }), { inbox: 0, sent: 0, drafts: 0, archive: 0, spam: 0, trash: 0 }), [state.data]);
  const effectiveId = rows.some((item) => item.id === selectedId) ? selectedId : rows[0]?.id || '';
  const detail = useAsyncData(async () => effectiveId ? (await mailApi.detail(effectiveId)).data : null, effectiveId);

  const openComposer = (mode: ComposeMode) => {
    const mail = detail.data;
    setEditingDraftId(undefined);
    setComposer(mode); setAttachments(mode === 'forward' ? mail?.attachments ?? [] : []);
    setShowCarbonCopy(mode === 'reply-all' && Boolean(mail?.cc?.length));
    if (mode === 'compose') form.resetFields();
    else form.setFieldsValue({
      recipients: mode === 'forward' ? '' : [mail?.senderEmail, ...(mode === 'reply-all' ? mail?.recipients ?? [] : [])].filter(Boolean).join(', '),
      cc: mode === 'reply-all' ? mail?.cc?.join(', ') : '', subject: `${mode === 'forward' ? 'Fwd:' : 'Re:'} ${mail?.subject ?? ''}`,
      content: mode === 'forward' ? `\n\n---------- Thư được chuyển tiếp ----------\n${mail?.body ?? ''}` : '',
    });
  };
  useEffect(() => { if (searchParams.get('compose') === '1') { setEditingDraftId(undefined); setComposer('compose'); form.resetFields(); setSearchParams({}, { replace: true }); } }, [form, searchParams, setSearchParams]);

  const send = async (values: ComposeValues) => {
    setSending(true);
    const payload: MailComposePayload = { recipients: splitAddresses(values.recipients), cc: splitAddresses(values.cc), bcc: splitAddresses(values.bcc), subject: values.subject, content: values.content, attachments };
    try {
      if (composer === 'reply' || composer === 'reply-all') await mailApi.reply(effectiveId, values.content, composer === 'reply-all', attachments);
      else await mailApi.send(payload);
      if (editingDraftId) await mailApi.action(editingDraftId, 'trash');
      message.success(composer === 'reply-all' ? 'Đã trả lời tất cả' : composer === 'reply' ? 'Đã gửi trả lời' : composer === 'forward' ? 'Đã chuyển tiếp Mail' : 'Đã gửi Mail');
      form.resetFields(); setAttachments([]); setEditingDraftId(undefined); setComposer(null); await state.reload();
    } catch (error) { message.error(error instanceof Error ? error.message : 'Không thể gửi Mail.'); }
    finally { setSending(false); }
  };
  const saveDraft = async () => {
    const values = form.getFieldsValue();
    const saved = (await mailApi.saveDraft({ recipients: splitAddresses(values.recipients), cc: splitAddresses(values.cc), bcc: splitAddresses(values.bcc), subject: values.subject, content: values.content, attachments }, editingDraftId)).data;
    message.success(editingDraftId ? 'Đã cập nhật bản nháp' : 'Đã lưu bản nháp'); setEditingDraftId(saved.id); setComposer(null); setFolder('drafts'); setMailFilter('all'); await state.reload();
  };
  const openDraft = (mail: NonNullable<typeof detail.data>) => {
    setSelectedId(mail.id); setEditingDraftId(mail.id); setComposer('compose'); setAttachments(mail.attachments ?? []); setShowCarbonCopy(Boolean(mail.cc?.length || mail.bcc?.length));
    form.setFieldsValue({ recipients: mail.recipients?.join(', ') ?? '', cc: mail.cc?.join(', ') ?? '', bcc: mail.bcc?.join(', ') ?? '', subject: mail.subject === '(Không có chủ đề)' ? '' : mail.subject, content: mail.body });
  };
  const closeComposer = async () => {
    const values = form.getFieldsValue();
    if (values.recipients?.trim() || values.subject?.trim() || values.content?.trim() || attachments.length) { await saveDraft(); return; }
    setComposer(null); setEditingDraftId(undefined); form.resetFields();
  };
  const runAction = async (action: Parameters<typeof mailApi.action>[1]) => {
    if (!effectiveId) return; setActing(action);
    try { await mailApi.action(effectiveId, action); message.success('Đã cập nhật Mail'); await Promise.all([state.reload(), detail.reload()]); }
    catch (error) { message.error(error instanceof Error ? error.message : 'Không thể cập nhật Mail.'); }
    finally { setActing(''); }
  };
  const attachFiles = (files: FileList | null, inputElement?: HTMLInputElement) => {
    if (!files || !files.length) return;
    const newItems: MailAttachment[] = Array.from(files).map((file, index) => ({
      id: `mail-file-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
    }));
    setAttachments((current) => [...current, ...newItems]);
    if (inputElement) inputElement.value = '';
  };
  const composerTitle = editingDraftId ? 'Chỉnh sửa bản nháp' : composer === 'compose' ? 'Thư mới' : composer === 'reply-all' ? 'Trả lời tất cả' : composer === 'reply' ? 'Trả lời' : 'Chuyển tiếp';
  const composerHint = composer === 'compose' ? 'Soạn và gửi Mail nội bộ' : composer === 'forward' ? 'Chuyển nội dung thư đến người nhận mới' : composer === 'reply-all' ? 'Phản hồi tất cả người nhận trong thư' : 'Phản hồi người gửi thư';

  return <div className="module-page mail-module-page gmail-mail-page">
    <div className="gmail-topbar"><Input aria-label="Tìm trong hộp thư" allowClear onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo người gửi, người nhận, tiêu đề hoặc tên tệp" prefix={<ModuleIcon module="mail" size={18} />} value={search} /><Select aria-label="Lọc Mail" onChange={setMailFilter} options={[{ label: 'Tất cả Mail', value: 'all' }, { label: 'Chưa đọc', value: 'unread' }, { label: 'Đã đọc', value: 'read' }, { label: 'Có tệp đính kèm', value: 'attachments' }]} value={mailFilter} /><Tooltip title="Làm mới"><Button aria-label="Làm mới Mail" icon={<MailActionIcon name="refresh" />} onClick={() => void state.reload()} /></Tooltip></div>
    <section className="gmail-mail-shell surface-panel">
      <aside className="gmail-sidebar"><Button className="gmail-compose" onClick={() => openComposer('compose')} type="primary">＋ Soạn thư</Button><nav aria-label="Thư mục Mail">{folders.map((item) => <button className={folder === item.key ? 'active' : ''} key={item.key} onClick={() => { setFolder(item.key); setSelectedId(''); setMailFilter('all'); }} type="button"><span>{item.icon}</span><strong>{item.label}</strong><b>{folderCounts[item.key]}</b></button>)}</nav></aside>
      <div className="gmail-list">{state.loading ? <ContentSkeleton rows={9} /> : state.error ? <ErrorState message={state.error} onRetry={state.reload} /> : !rows.length ? <EmptyState description="Không có Mail trong thư mục này" /> : rows.map((mail) => <article className={`${mail.id === effectiveId ? 'gmail-row mail-row active' : 'gmail-row mail-row'} ${mail.isRead ? '' : 'unread'}${folder === 'drafts' ? ' draft-row' : ''}`} key={mail.id} onClick={() => setSelectedId(mail.id)}><span className={`gmail-row-avatar ${avatarTone(mail.senderName)}`}>{folder === 'drafts' ? '✎' : getAvatarInitials(mail.senderName)}</span><button className="gmail-row-main" onClick={() => setSelectedId(mail.id)} type="button"><span><strong>{folder === 'drafts' ? 'Bản nháp đang soạn' : folder === 'sent' ? (mail.recipients?.map((r) => getFormattedSender(r)).join(', ') || 'Người nhận') : getFormattedSender(mail.senderName)}</strong><time>{new Date(mail.sentAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</time></span><b>{mail.subject}{(mail.threadCount ?? 1) > 1 && ` (${mail.threadCount})`}</b><small>{mail.preview?.replace(/<[^>]*>/g, '')}</small><em>{folder === 'drafts' ? 'Chọn để xem · tiếp tục soạn ở khung bên phải' : mail.attachments?.length ? `${mail.attachments.length} tệp đính kèm` : ''}</em></button></article>)}</div>
      <article className="gmail-detail">
        {detail.loading ? <ContentSkeleton rows={8} /> : detail.error ? <ErrorState message={detail.error} /> : detail.data?.folder === 'drafts' ? <section className="gmail-draft-preview">
          <span className="gmail-draft-symbol"><MailActionIcon name="reply" /></span>
          <span className="gmail-draft-label">Bản nháp đang soạn</span>
          <h2>{detail.data.subject}</h2>
          <div className="mail-body" dangerouslySetInnerHTML={{ __html: detail.data.body || 'Bản nháp này chưa có nội dung.' }} />
          <dl><div><dt>Người nhận</dt><dd>{detail.data.recipients?.join(', ') || 'Chưa nhập người nhận'}</dd></div><div><dt>Cập nhật</dt><dd>{new Date(detail.data.sentAt).toLocaleString('vi-VN')}</dd></div></dl>
          {Boolean(detail.data.attachments?.length) && <div className="gmail-draft-files">{detail.data.attachments?.map((file) => <span key={file.id}><MailFileIcon compact file={file} /><strong>{file.name}</strong></span>)}</div>}
          <Button icon={<MailActionIcon name="reply" />} onClick={() => openDraft(detail.data!)} size="large" type="primary">Tiếp tục soạn và gửi</Button>
          <small>Thay đổi sẽ được lưu lại vào chính bản nháp này.</small>
        </section> : detail.data ? <><div className="gmail-detail-toolbar"><Tooltip title="Lưu trữ"><Button aria-label="Lưu trữ Mail" icon={<MailActionIcon name="archive" />} loading={acting === 'archive'} onClick={() => void runAction('archive')} /></Tooltip><Tooltip title={detail.data.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}><Button aria-label={detail.data.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'} icon={<MailActionIcon name="unread" />} onClick={() => void runAction(detail.data?.isRead ? 'mark-unread' : 'mark-read')} /></Tooltip><Tooltip title="Báo cáo thư rác"><Button aria-label="Báo cáo thư rác" icon={<MailActionIcon name="spam" />} onClick={() => void runAction('spam')} /></Tooltip><Tooltip title="Xóa"><Button danger aria-label="Xóa Mail" icon={<MailActionIcon name="trash" />} onClick={() => void runAction('trash')} /></Tooltip></div><header><span className="eyebrow">{detail.data.folder === 'sent' ? 'Thư đã gửi' : 'Thư đến'}</span><h2>{detail.data.subject}</h2><div><span className="avatar neutral">{detail.data.senderName.slice(0, 2).toUpperCase()}</span><span><strong>{detail.data.senderName}</strong><small>{detail.data.senderEmail} · tới {detail.data.recipients?.join(', ') || 'tôi'}</small></span><time>{new Date(detail.data.sentAt).toLocaleString('vi-VN')}</time></div></header><div className="mail-body" dangerouslySetInnerHTML={{ __html: detail.data.body }} />{Boolean(detail.data.attachments?.length) && <section className="gmail-attachments">{detail.data.attachments?.map((file) => <button key={file.id} type="button"><MailFileIcon file={file} /><span><strong>{file.name}</strong><small>{(file.size / 1024).toFixed(0)} KB</small></span></button>)}</section>}<footer className="gmail-reply-actions"><Button icon={<MailActionIcon name="reply" />} onClick={() => openComposer('reply')}>Trả lời</Button><Button icon={<MailActionIcon name="replyAll" />} onClick={() => openComposer('reply-all')}>Trả lời tất cả</Button><Button icon={<MailActionIcon name="forward" />} onClick={() => openComposer('forward')}>Chuyển tiếp</Button></footer></> : <EmptyState description="Chọn một Mail để đọc" />}
      </article>
    </section>
    <Modal
      centered
      className={`gmail-compose-modal ${composer ?? 'compose'}-mode`}
      footer={
        <div className="mail-compose-footer">
          <label className="gmail-file-picker-btn">
            <MailActionIcon name="attachment" />
            <span>Đính kèm tệp</span>
            <input multiple onChange={(event) => attachFiles(event.target.files, event.target)} type="file" />
          </label>
          <div className="footer-right-buttons">
            <Button onClick={() => void saveDraft()}>Lưu bản nháp</Button>
            <Button onClick={() => void closeComposer()}>Đóng</Button>
            <Button loading={sending} onClick={() => form.submit()} type="primary">Gửi thư</Button>
          </div>
        </div>
      }
      onCancel={() => void closeComposer()}
      open={Boolean(composer)}
      title={
        <span className="mail-compose-heading">
          <span className="section-icon mail"><ModuleIcon module="mail" size={19} /></span>
          <span><strong>{composerTitle}</strong><small>{composerHint}</small></span>
        </span>
      }
      width={860}
    >
      <Form className="mail-compose-form" form={form} layout="vertical" onFinish={(values) => void send(values)}>
        <Form.Item label="Người nhận" name="recipients" rules={[{ required: true, message: 'Nhập ít nhất một người nhận' }]}>
          <Input addonAfter={<button className="cc-toggle" onClick={() => setShowCarbonCopy((value) => !value)} type="button">Cc/Bcc</button>} placeholder="Email người nhận, phân cách bằng dấu phẩy" />
        </Form.Item>
        {showCarbonCopy && (
          <div className="gmail-cc-grid">
            <Form.Item label="Cc" name="cc"><Input placeholder="Email nhận bản sao (Cc)" /></Form.Item>
            <Form.Item label="Bcc" name="bcc"><Input placeholder="Email nhận bản sao ẩn (Bcc)" /></Form.Item>
          </div>
        )}
        <Form.Item label="Tiêu đề" name="subject" rules={[{ required: true, message: 'Nhập tiêu đề' }]}>
          <Input placeholder="Tiêu đề email..." />
        </Form.Item>

        <Form.Item className="content-form-item" label="Nội dung" name="content" rules={[{ required: true, message: 'Nhập nội dung' }]}>
          <Input.TextArea placeholder="Nhập nội dung thư của bạn..." rows={10} style={{ minHeight: 240 }} />
        </Form.Item>

        {Boolean(attachments.length) && (
          <div className="gmail-compose-files">
            <small>Tệp đính kèm ({attachments.length}):</small>
            <div className="files-chips-list">
              {attachments.map((file) => (
                <span key={file.id}>
                  <MailFileIcon file={file} />
                  <span><strong>{file.name}</strong><small>{(file.size / 1024).toFixed(0)} KB</small></span>
                  <button aria-label={`Bỏ tệp ${file.name}`} onClick={() => setAttachments((current) => current.filter((item) => item.id !== file.id))} type="button">×</button>
                </span>
              ))}
            </div>
          </div>
        )}
      </Form>
    </Modal>
  </div>;
}
