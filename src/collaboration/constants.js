// Collaboration Layer — Constants & Utilities

export const COLLAB_SERVER_URL = 'wss://demos.yjs.dev';

// Kullanıcı renk paleti — birbirinden ayırt edilebilir, premium tonlar
export const USER_COLORS = [
  '#E57373', // soft red
  '#64B5F6', // soft blue
  '#81C784', // soft green
  '#FFD54F', // gold
  '#BA68C8', // purple
  '#4FC3F7', // cyan
  '#FF8A65', // coral
  '#4DB6AC', // teal
  '#F06292', // pink
  '#AED581', // lime
];

// Hayvan emojileri — her kullanıcıya UID'e göre sabit atanır
export const ANIMAL_EMOJIS = [
  '🦊', // tilki
  '🐼', // panda
  '🦁', // aslan
  '🐧', // penguen
  '🦋', // kelebek
  '🐬', // yunus
  '🦜', // papağan
  '🦄', // unicorn
  '🐸', // kurbağa
  '🦔', // kirpi
  '🐨', // koala
  '🦊', // tilki 2
  '🐺', // kurt
  '🦉', // baykuş
  '🦦', // su samuru
];

/**
 * Kullanıcının UID'sine göre deterministik hayvan emojisi döndürür.
 * Aynı kullanıcı her zaman aynı hayvanı alır.
 */
export function getAnimalForUser(uid) {
  if (!uid) return '🐾';
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = (hash * 31 + uid.charCodeAt(i)) >>> 0;
  }
  return ANIMAL_EMOJIS[hash % ANIMAL_EMOJIS.length];
}

/**
 * Kullanıcının UID'sine göre deterministik renk döndürür.
 */
export function getColorForUser(uid) {
  if (!uid) return USER_COLORS[0];
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = (hash * 31 + uid.charCodeAt(i)) >>> 0;
  }
  return USER_COLORS[hash % USER_COLORS.length];
}

// Rastgele kullanıcı adı üretimi (anonim kullanıcılar için)
const ADJECTIVES = ['Happy', 'Swift', 'Clever', 'Bright', 'Bold', 'Calm', 'Keen', 'Wise'];
const ANIMALS = ['Panda', 'Fox', 'Owl', 'Wolf', 'Bear', 'Hawk', 'Lynx', 'Deer'];

export function generateUserName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${adj} ${animal}`;
}

export function getRandomColor() {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}

export function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Simple diff — prefix/suffix matching for minimal Yjs ops
export function applyDiff(ytext, oldStr, newStr) {
  if (oldStr === newStr) return;

  let start = 0;
  while (start < oldStr.length && start < newStr.length && oldStr[start] === newStr[start]) {
    start++;
  }

  let oldEnd = oldStr.length;
  let newEnd = newStr.length;
  while (oldEnd > start && newEnd > start && oldStr[oldEnd - 1] === newStr[newEnd - 1]) {
    oldEnd--;
    newEnd--;
  }

  ytext.doc.transact(() => {
    if (oldEnd - start > 0) {
      ytext.delete(start, oldEnd - start);
    }
    if (newEnd - start > 0) {
      ytext.insert(start, newStr.slice(start, newEnd));
    }
  });
}

// Cursor offset helpers — text-node based offset tracking
export function getTextOffset(container, node, offset) {
  try {
    const range = document.createRange();
    range.setStart(container, 0);
    range.setEnd(node, offset);
    return range.toString().length;
  } catch {
    return 0;
  }
}

export function restoreCursorFromOffset(container, targetOffset) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
  let currentOffset = 0;
  let node;

  while ((node = walker.nextNode())) {
    const len = node.textContent.length;
    if (currentOffset + len >= targetOffset) {
      try {
        const sel = window.getSelection();
        const range = document.createRange();
        range.setStart(node, Math.min(targetOffset - currentOffset, len));
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } catch { /* cursor restoration best-effort */ }
      return;
    }
    currentOffset += len;
  }
}

// Get pixel position from text offset (for remote cursor rendering)
export function getPositionFromOffset(container, offset) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
  let currentOffset = 0;
  let node;

  while ((node = walker.nextNode())) {
    const len = node.textContent.length;
    if (currentOffset + len >= offset) {
      try {
        const range = document.createRange();
        range.setStart(node, Math.min(offset - currentOffset, len));
        range.collapse(true);

        const rect = range.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        return {
          top: rect.top - containerRect.top,
          left: rect.left - containerRect.left,
          height: rect.height || 20,
        };
      } catch {
        return null;
      }
    }
    currentOffset += len;
  }
  return null;
}
