export function avatarTone(value: any): string {
  const str = typeof value === 'string' ? value : String(value?.name || value?.label || value?.value || '');
  const hash = [...str].reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 0);
  return `avatar-tone-${hash % 8}`;
}

export function nameInitials(name: any): string {
  if (!name) return '??';
  const str = typeof name === 'string' ? name : String(name?.name || name?.label || name?.value || '');
  const trimmed = str.trim();
  if (!trimmed) return '??';
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0]?.[0] || '';
  const last = parts[parts.length - 1]?.[0] || '';
  return (first + last).toUpperCase() || '??';
}
