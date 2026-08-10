export function avatarTone(value: string) {
  const hash = [...value].reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 0);
  return `avatar-tone-${hash % 8}`;
}

export function nameInitials(name: string) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
