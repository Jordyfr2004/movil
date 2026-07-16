import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";

import { API_URL } from "../constants/api";
import { subscribeHttpResponseReceived } from "../services/networkEvents";

export type ServerStatus = "unknown" | "ok" | "slow" | "unavailable";

type NetworkContextValue = {
  isOnline: boolean;
  hasCheckedConnection: boolean;
  isCheckingConnection: boolean;
  recoveryTick: number;
  serverStatus: ServerStatus;
  checkConnection: () => Promise<boolean>;
};

const NetworkContext = createContext<NetworkContextValue | null>(null);
const CONNECTION_CHECK_MS = 30_000;
const OFFLINE_RECOVERY_CHECK_MS = 2500;
const CONNECTION_TIMEOUT_MS = 3500;
const CONNECTION_RETRIES = 2;
const RETRY_DELAY_MS = 450;

type ProbeResult =
  | { kind: "response" }
  | { kind: "timeout" }
  | { kind: "network-error" };

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function probeApi(): Promise<ProbeResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT_MS);

  try {
    await fetch(API_URL, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });

    return { kind: "response" };
  } catch (error: unknown) {
    if ((error as { name?: string } | null)?.name === "AbortError") {
      return { kind: "timeout" };
    }

    return { kind: "network-error" };
  } finally {
    clearTimeout(timeout);
  }
}

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [hasCheckedConnection, setHasCheckedConnection] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [recoveryTick, setRecoveryTick] = useState(0);
  const [serverStatus, setServerStatus] = useState<ServerStatus>("unknown");
  const inFlightRef = useRef<Promise<boolean> | null>(null);
  const mountedRef = useRef(true);

  const markOnlineFromHttpResponse = useCallback(() => {
    if (!mountedRef.current) return;

    setHasCheckedConnection(true);
    setServerStatus("ok");
    setIsCheckingConnection(false);
    setIsOnline((previous) => {
      if (!previous) {
        setRecoveryTick((value) => value + 1);
      }
      return true;
    });
  }, []);

  const checkConnection = useCallback(async () => {
    if (inFlightRef.current) {
      return inFlightRef.current;
    }

    setIsCheckingConnection(true);

    const request = (async () => {
      let lastResult: ProbeResult = { kind: "network-error" };

      for (let attempt = 0; attempt <= CONNECTION_RETRIES; attempt += 1) {
        if (attempt > 0) {
          await delay(RETRY_DELAY_MS);
        }

        const result = await probeApi();
        lastResult = result;

        if (result.kind === "response") {
          break;
        }
      }

      const nextOnline = lastResult.kind !== "network-error";
      const nextServerStatus: ServerStatus =
        lastResult.kind === "response"
          ? "ok"
          : lastResult.kind === "timeout"
            ? "slow"
            : "unavailable";

      if (mountedRef.current) {
        setHasCheckedConnection(true);
        setIsOnline((previous) => {
          if (!previous && nextOnline) {
            setRecoveryTick((value) => value + 1);
          }
          return nextOnline;
        });
        setServerStatus(nextServerStatus);
        setIsCheckingConnection(false);
      }

      return nextOnline;
    })()
      .then((nextOnline) => {
        if (mountedRef.current) {
          setIsCheckingConnection(false);
        }
        return nextOnline;
      })
      .finally(() => {
        inFlightRef.current = null;
      });

    inFlightRef.current = request;
    return request;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void checkConnection();

    const timer = setInterval(() => {
      void checkConnection();
    }, CONNECTION_CHECK_MS);

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void checkConnection();
      }
    });

    const unsubscribeHttpResponse =
      subscribeHttpResponseReceived(markOnlineFromHttpResponse);

    return () => {
      mountedRef.current = false;
      clearInterval(timer);
      unsubscribeHttpResponse();
      subscription.remove();
    };
  }, [checkConnection, markOnlineFromHttpResponse]);

  useEffect(() => {
    if (isOnline) {
      return undefined;
    }

    const recoveryTimer = setInterval(() => {
      void checkConnection();
    }, OFFLINE_RECOVERY_CHECK_MS);

    return () => {
      clearInterval(recoveryTimer);
    };
  }, [checkConnection, isOnline]);

  const value = useMemo<NetworkContextValue>(
    () => ({
      isOnline,
      hasCheckedConnection,
      isCheckingConnection,
      recoveryTick,
      serverStatus,
      checkConnection,
    }),
    [
      checkConnection,
      hasCheckedConnection,
      isCheckingConnection,
      isOnline,
      recoveryTick,
      serverStatus,
    ]
  );

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

export function useNetworkStatus() {
  const value = useContext(NetworkContext);
  if (!value) {
    throw new Error("useNetworkStatus must be used within NetworkProvider");
  }
  return value;
}
