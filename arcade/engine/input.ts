// Keyboard + on-screen touch buttons, merged into one simple pad.
export interface Pad {
  left: boolean;
  right: boolean;
  jump: boolean;
}

const GAME_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Spacebar']);

const isTyping = (e: Event) => {
  const t = e.target as HTMLElement | null;
  return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
};

export class Input {
  private down = new Set<string>();
  readonly touch = { left: false, right: false, jump: false };
  /** When false, keys are ignored (e.g. while the email form is open). */
  enabled = true;

  constructor() {
    window.addEventListener('keydown', (e) => {
      if (isTyping(e)) return;
      if (GAME_KEYS.has(e.key)) e.preventDefault(); // stop arrows/space scrolling the host page
      this.down.add(e.key.toLowerCase());
    });
    window.addEventListener('keyup', (e) => this.down.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => this.down.clear());
  }

  private has(...keys: string[]) {
    return keys.some((k) => this.down.has(k));
  }

  read(): Pad {
    if (!this.enabled) return { left: false, right: false, jump: false };
    return {
      left: this.has('arrowleft', 'a') || this.touch.left,
      right: this.has('arrowright', 'd') || this.touch.right,
      jump: this.has(' ', 'arrowup', 'w', 'z', 'x') || this.touch.jump,
    };
  }
}
