export const CHAT_PREFILL_EVENT = 'pf:chat-prefill';
export const CHAT_PREFILL_STORAGE_KEY = 'pf.chat.prefill.v1';

export function publishChatPrefill(question: string): void {
  try {
    sessionStorage.setItem(CHAT_PREFILL_STORAGE_KEY, question);
  } catch {
    // Storage can be unavailable in private mode. The live event still works.
  }

  window.dispatchEvent(
    new CustomEvent<string>(CHAT_PREFILL_EVENT, { detail: question }),
  );
}

export function consumeChatPrefill(): string | null {
  try {
    const question = sessionStorage.getItem(CHAT_PREFILL_STORAGE_KEY);
    sessionStorage.removeItem(CHAT_PREFILL_STORAGE_KEY);
    return question;
  } catch {
    return null;
  }
}
