type Listener = () => void;

const httpResponseListeners = new Set<Listener>();

export function notifyHttpResponseReceived() {
  httpResponseListeners.forEach((listener) => listener());
}

export function subscribeHttpResponseReceived(listener: Listener) {
  httpResponseListeners.add(listener);
  return () => {
    httpResponseListeners.delete(listener);
  };
}
