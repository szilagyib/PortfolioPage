export const CHAT_PREFILL_EVENT = 'pf:chat-prefill';
export const CHAT_PREFILL_STORAGE_KEY = 'pf.chat.prefill.v1';
export const CHAT_SUBMIT_EVENT = 'pf:chat-submit';
export const CHAT_SUBMIT_STORAGE_KEY = 'pf.chat.submit.v1';

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

export function publishChatSubmit(question: string): void {
  try {
    sessionStorage.setItem(CHAT_SUBMIT_STORAGE_KEY, question);
  } catch {
    // Storage can be unavailable in private mode. The live event still works.
  }

  window.dispatchEvent(
    new CustomEvent<string>(CHAT_SUBMIT_EVENT, { detail: question }),
  );
}

export function consumeChatSubmit(): string | null {
  try {
    const question = sessionStorage.getItem(CHAT_SUBMIT_STORAGE_KEY);
    sessionStorage.removeItem(CHAT_SUBMIT_STORAGE_KEY);
    return question;
  } catch {
    return null;
  }
}
