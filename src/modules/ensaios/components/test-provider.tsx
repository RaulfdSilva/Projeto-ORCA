"use client";

import { createContext, useContext, useEffect, useReducer, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { registerBeforeUnload } from "../before-unload";
import { emptyDraft, type HydraulicTest, type PointDraft } from "../model";
import { testReducer, type TestAction } from "../state";
import type { FieldErrors } from "../validation";

interface TestContextValue {
  test: HydraulicTest | null;
  dispatch: Dispatch<TestAction>;
  draft: PointDraft;
  setDraft: Dispatch<SetStateAction<PointDraft>>;
  editingId: string | null;
  setEditingId: Dispatch<SetStateAction<string | null>>;
  errors: FieldErrors;
  setErrors: Dispatch<SetStateAction<FieldErrors>>;
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
}

const TestContext = createContext<TestContextValue | null>(null);

// Montado no layout raiz, que sobrevive às navegações internas do App Router.
export function TestProvider({ children }: { children: ReactNode }) {
  const [test, dispatch] = useReducer(testReducer, null);
  const [draft, setDraft] = useState<PointDraft>({ ...emptyDraft });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const isActive = test?.status === "active";
  useEffect(() => registerBeforeUnload(window, isActive), [isActive]);

  return <TestContext.Provider value={{
    test, dispatch, draft, setDraft, editingId, setEditingId,
    errors, setErrors, message, setMessage,
  }}>{children}</TestContext.Provider>;
}

export function useTestWorkspace(): TestContextValue {
  const context = useContext(TestContext);
  if (!context) throw new Error("O módulo de ensaios deve estar dentro de TestProvider.");
  return context;
}
