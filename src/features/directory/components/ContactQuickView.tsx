import { Button, Modal } from 'antd';

import { ModuleIcon } from '@/components/ModuleIcon';
import { contactInitials } from '@/features/directory/utils';
import type { DirectoryContact } from '@/types/domain';
import { avatarTone } from '@/utils/avatar';

export function ContactQuickView({ contact, chatting = false, onChat, onClose }: { contact: DirectoryContact | null; chatting?: boolean; onChat?: (contact: DirectoryContact) => Promise<void>; onClose: () => void }) {
  return <Modal className="directory-preview" footer={contact && onChat ? <div className="contact-preview-actions"><Button onClick={onClose}>Đóng</Button><Button icon={<ModuleIcon module="chat" size={18} />} loading={chatting} onClick={() => void onChat(contact)} type="primary">Chat với {contact.penName ?? contact.fullName}</Button></div> : null} onCancel={onClose} open={Boolean(contact)} title={<span className="preview-title"><span className="section-icon directory"><ModuleIcon module="directory" /></span>Thông tin liên hệ</span>} width={560}>
    {contact && <div className="contact-preview-content">
      <header className="contact-profile-hero">
        <span className={`contact-avatar large ${avatarTone(contact.fullName)}`}>{contactInitials(contact.fullName)}</span>
        <span className="contact-profile-copy"><h3>{contact.fullName}{contact.penName && <small>({contact.penName})</small>}</h3></span>
      </header>
      <section aria-label="Thông tin liên hệ chính" className="contact-primary-details">
        <a href={`tel:${contact.phone.replace(/\s/g, '')}`}><span className="contact-detail-icon phone" aria-hidden="true">☎</span><span><small>Điện thoại</small><strong>{contact.phone}</strong></span><i aria-hidden="true">→</i></a>
        <a href={`mailto:${contact.email}`}><span className="contact-detail-icon email" aria-hidden="true">@</span><span><small>Email</small><strong>{contact.email}</strong></span><i aria-hidden="true">→</i></a>
      </section>
      <div className="contact-secondary-details"><span><small>Phòng ban</small><strong>{contact.department}</strong></span>{contact.extension && <span><small>Số nội bộ</small><strong>{contact.extension}</strong></span>}</div>
    </div>}
  </Modal>;
}
