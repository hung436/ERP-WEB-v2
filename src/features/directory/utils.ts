import type { DirectoryContact } from '@/types/domain';

export function normalizeDirectoryText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
}

export function matchesDirectorySearch(contact: DirectoryContact, query: string) {
  if (!query.trim()) return true;
  return normalizeDirectoryText(`${contact.fullName} ${contact.penName ?? ''} ${contact.department} ${contact.phone} ${contact.email} ${contact.extension ?? ''}`).includes(normalizeDirectoryText(query.trim()));
}

export function contactInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return `${parts[parts.length - 2]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
}
