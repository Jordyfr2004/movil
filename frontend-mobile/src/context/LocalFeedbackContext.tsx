import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";

const FEEDBACK_STORAGE_KEY = "student_local_feedback_v1";

export type LocalRating = {
  id: string;
  reservationId: string;
  stars: number;
  comment?: string;
  tags: string[];
  createdAt: string;
  syncStatus: "local_pending";
};

export type ProblemType =
  | "missing_product"
  | "wrong_product"
  | "wrong_charge"
  | "payment_problem"
  | "long_wait"
  | "other";

export type LocalProblemReport = {
  id: string;
  reservationId?: string;
  type: ProblemType;
  comment?: string;
  createdAt: string;
  syncStatus: "local_pending";
};

type LocalFeedbackState = {
  ratings: LocalRating[];
  reports: LocalProblemReport[];
};

type LocalFeedbackContextValue = LocalFeedbackState & {
  addRating: (
    rating: Omit<LocalRating, "id" | "createdAt" | "syncStatus">
  ) => void;
  updateRating: (
    id: string,
    rating: Partial<Omit<LocalRating, "id" | "createdAt" | "syncStatus">>
  ) => void;
  deleteRating: (id: string) => void;
  addReport: (
    report: Omit<LocalProblemReport, "id" | "createdAt" | "syncStatus">
  ) => void;
  updateReport: (
    id: string,
    report: Partial<Omit<LocalProblemReport, "id" | "createdAt" | "syncStatus">>
  ) => void;
  deleteReport: (id: string) => void;
  hasRatingForReservation: (reservationId: string) => boolean;
};

const LocalFeedbackContext =
  createContext<LocalFeedbackContextValue | null>(null);

function sanitizeState(value: unknown): LocalFeedbackState {
  if (typeof value !== "object" || value === null) {
    return { ratings: [], reports: [] };
  }
  const source = value as Partial<LocalFeedbackState>;
  return {
    ratings: Array.isArray(source.ratings)
      ? source.ratings.filter(
          (item): item is LocalRating =>
            typeof item === "object" &&
            item !== null &&
            typeof item.id === "string" &&
            typeof item.reservationId === "string" &&
            typeof item.stars === "number" &&
            Array.isArray(item.tags)
        )
      : [],
    reports: Array.isArray(source.reports)
      ? source.reports.filter(
          (item): item is LocalProblemReport =>
            typeof item === "object" &&
            item !== null &&
            typeof item.id === "string" &&
            typeof item.type === "string"
        )
      : [],
  };
}

export function LocalFeedbackProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LocalFeedbackState>({
    ratings: [],
    reports: [],
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    SecureStore.getItemAsync(FEEDBACK_STORAGE_KEY)
      .then((raw) => {
        if (!raw || !mounted) return;
        setState(sanitizeState(JSON.parse(raw)));
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setHydrated(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    SecureStore.setItemAsync(FEEDBACK_STORAGE_KEY, JSON.stringify(state)).catch(
      () => undefined
    );
  }, [hydrated, state]);

  const addRating = useCallback<
    LocalFeedbackContextValue["addRating"]
  >((rating) => {
    setState((previous) => ({
      ...previous,
      ratings: [
        {
          ...rating,
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          createdAt: new Date().toISOString(),
          syncStatus: "local_pending",
        },
        ...previous.ratings.filter(
          (item) => item.reservationId !== rating.reservationId
        ),
      ],
    }));
  }, []);

  const addReport = useCallback<LocalFeedbackContextValue["addReport"]>(
    (report) => {
      setState((previous) => ({
        ...previous,
        reports: [
          {
            ...report,
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            createdAt: new Date().toISOString(),
            syncStatus: "local_pending",
          },
          ...previous.reports,
        ],
      }));
    },
    []
  );

  const updateRating = useCallback<LocalFeedbackContextValue["updateRating"]>(
    (id, rating) => {
      setState((previous) => ({
        ...previous,
        ratings: previous.ratings.map((item) =>
          item.id === id ? { ...item, ...rating } : item
        ),
      }));
    },
    []
  );

  const deleteRating = useCallback((id: string) => {
    setState((previous) => ({
      ...previous,
      ratings: previous.ratings.filter((item) => item.id !== id),
    }));
  }, []);

  const updateReport = useCallback<LocalFeedbackContextValue["updateReport"]>(
    (id, report) => {
      setState((previous) => ({
        ...previous,
        reports: previous.reports.map((item) =>
          item.id === id ? { ...item, ...report } : item
        ),
      }));
    },
    []
  );

  const deleteReport = useCallback((id: string) => {
    setState((previous) => ({
      ...previous,
      reports: previous.reports.filter((item) => item.id !== id),
    }));
  }, []);

  const hasRatingForReservation = useCallback(
    (reservationId: string) =>
      state.ratings.some((item) => item.reservationId === reservationId),
    [state.ratings]
  );

  const value = useMemo<LocalFeedbackContextValue>(
    () => ({
      ratings: state.ratings,
      reports: state.reports,
      addRating,
      addReport,
      updateRating,
      updateReport,
      deleteRating,
      deleteReport,
      hasRatingForReservation,
    }),
    [
      addRating,
      addReport,
      deleteRating,
      deleteReport,
      hasRatingForReservation,
      state,
      updateRating,
      updateReport,
    ]
  );

  return (
    <LocalFeedbackContext.Provider value={value}>
      {children}
    </LocalFeedbackContext.Provider>
  );
}

export function useLocalFeedback() {
  const value = useContext(LocalFeedbackContext);
  if (!value) {
    throw new Error("useLocalFeedback must be used within LocalFeedbackProvider");
  }
  return value;
}
