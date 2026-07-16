type SessionExpiredHandler = () => void | Promise<void>;

let handler: SessionExpiredHandler | null = null;
let isHandlingSessionExpiry = false;

export function registerSessionExpiredHandler(
  nextHandler: SessionExpiredHandler | null
) {
  handler = nextHandler;
}

export function isSessionExpiryInProgress() {
  return isHandlingSessionExpiry;
}

export function notifySessionExpired() {
  if (isHandlingSessionExpiry) {
    return;
  }

  isHandlingSessionExpiry = true;

  Promise.resolve(handler?.())
    .catch(() => undefined)
    .finally(() => {
      setTimeout(() => {
        isHandlingSessionExpiry = false;
      }, 1000);
    });
}
