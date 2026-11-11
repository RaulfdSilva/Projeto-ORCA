"use client";

import { createContext, useContext, useEffect, useReducer, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { registerBeforeUnload } from "../before-unload";
import { emptyDraft, type HydraulicTest, type PointDraft } from "../model";
import type { TestAction } from "../state";
import { applicationReducer, initialApplication } from "@/state/application";
import type { Equipment, EquipmentData, EquipmentMode } from "@/modules/equipamentos/model";
import { emptyEquipment } from "@/modules/equipamentos/model";
import type { EquipmentAction } from "@/modules/equipamentos/state";
import type { EquipmentErrors } from "@/modules/equipamentos/validation";
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

interface EquipmentContextValue {
  equipment: readonly Equipment[];
  dispatch: Dispatch<EquipmentAction>;
  draft: EquipmentData;
  setDraft: Dispatch<SetStateAction<EquipmentData>>;
  mode: EquipmentMode;
  setMode: Dispatch<SetStateAction<EquipmentMode>>;
  editingId: string | null;
  setEditingId: Dispatch<SetStateAction<string | null>>;
  errors: EquipmentErrors;
  setErrors: Dispatch<SetStateAction<EquipmentErrors>>;
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
}
const EquipmentContext = createContext<EquipmentContextValue | null>(null);
const TestContext = createContext<TestContextValue | null>(null);

// Montado no layout raiz, que sobrevive às navegações internas do App Router.
export function TestProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(applicationReducer, initialApplication);
  const { test, equipment } = state;
  const [equipmentDraft, setEquipmentDraft] = useState<EquipmentData>({ ...emptyEquipment });
  const [mode, setMode] = useState<EquipmentMode>("manual");
  const [equipmentEditingId, setEquipmentEditingId] = useState<string | null>(null);
  const [equipmentErrors, setEquipmentErrors] = useState<EquipmentErrors>({});
  const [equipmentMessage, setEquipmentMessage] = useState("");
  const [draft, setDraft] = useState<PointDraft>({ ...emptyDraft });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const isActive = test?.status === "active";
  useEffect(() => registerBeforeUnload(window, isActive), [isActive]);

  return <EquipmentContext.Provider value={{ equipment, dispatch, draft: equipmentDraft,
    setDraft: setEquipmentDraft, mode, setMode, editingId: equipmentEditingId,
    setEditingId: setEquipmentEditingId, errors: equipmentErrors, setErrors: setEquipmentErrors,
    message: equipmentMessage, setMessage: setEquipmentMessage,
  }}><TestContext.Provider value={{
    test, dispatch, draft, setDraft, editingId, setEditingId,
    errors, setErrors, message, setMessage,
  }}>{children}</TestContext.Provider></EquipmentContext.Provider>;
}

export function useTestWorkspace(): TestContextValue {
  const context = useContext(TestContext);
  if (!context) throw new Error("O módulo de ensaios deve estar dentro de TestProvider.");
  return context;
}

export function useEquipmentWorkspace(): EquipmentContextValue {
  const context = useContext(EquipmentContext);
  if (!context) throw new Error("O módulo de equipamentos deve estar dentro de TestProvider.");
  return context;
}
