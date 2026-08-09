export function avatarTone(value: string) {
  const hash = [...value].reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 0);
  return `avatar-tone-${hash % 8}`;
}
