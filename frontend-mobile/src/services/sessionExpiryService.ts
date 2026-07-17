type SessionExpiredHandler = () => void | Promise<void>;
type AccessTokenRefreshedHandler = (accessToken: string) => void | Promise<void>;

let handler: SessionExpiredHandler | null = null;
let accessTokenRefreshedHandler: AccessTokenRefreshedHandler | null = null;
let isHandlingSessionExpiry = false;

export function registerSessionExpiredHandler(
  nextHandler: SessionExpiredHandler | null
) {
  handler = nextHandler;
}

export function isSessionExpiryInProgress() {
  return isHandlingSessionExpiry;
}

export function registerAccessTokenRefreshedHandler(
  nextHandler: AccessTokenRefreshedHandler | null
) {
  accessTokenRefreshedHandler = nextHandler;
}

export function notifyAccessTokenRefreshed(accessToken: string) {
  Promise.resolve(accessTokenRefreshedHandler?.(accessToken)).catch(
    () => undefined
  );
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
