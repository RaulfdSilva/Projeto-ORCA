"use client";

import { useEffect, useReducer, useRef, useState, type FormEvent } from "react";
import { emptyDraft, hasMeasurements, measurementFields, pointToDraft, type PointDraft } from "../model";
import { testReducer } from "../state";
import { validatePoint, type FieldErrors } from "../validation";

import { registerBeforeUnload } from "../before-unload";
import { NoMeasurementsNotice } from "./no-measurements-notice";

const buttonBase = "rounded border px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50";
const button = `${buttonBase} border-slate-400 bg-white text-slate-900 hover:bg-slate-100`;
const primaryButton = `${buttonBase} border-sky-800 bg-sky-800 text-white hover:bg-sky-900`;

export function TestWorkspace() {
  const [test, dispatch] = useReducer(testReducer, null);
  const [draft, setDraft] = useState<PointDraft>({ ...emptyDraft });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const firstInput = useRef<HTMLInputElement>(null);
  const statusHeading = useRef<HTMLHeadingElement>(null);
  const pointsHeading = useRef<HTMLHeadingElement>(null);
  const hasDraft = editingId !== null || Object.values(draft).some(value => value !== "");

  const isActive = test?.status === "active";
  useEffect(() => registerBeforeUnload(window, isActive), [isActive]);
  const testStatus = test?.status;
  useEffect(() => {
    if (testStatus) statusHeading.current?.focus();
  }, [testStatus]);

  function clearDraft() {
    setDraft({ ...emptyDraft });
    setEditingId(null);
    setErrors({});
  }

  function savePoint(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isActive) return;
    const result = validatePoint(draft);
    if (!result.ok) {
      setErrors(result.errors);
      setMessage("Ponto não salvo. Revise os campos indicados.");
      const key = measurementFields.find(field => result.errors[field.key])?.key;
      if (key) document.getElementById(`measurement-${key}`)?.focus();
      return;
    }
    if (editingId) {
      dispatch({ type: "update", id: editingId, measurements: result.measurements });
      setMessage("Ponto atualizado. Identificador preservado.");
    } else {
      dispatch({ type: "add", point: { id: crypto.randomUUID(), measurements: result.measurements } });
      setMessage("Ponto adicionado.");
    }
    clearDraft();
    firstInput.current?.focus();
  }

  return <div className="mt-8 space-y-8">
    <p className="rounded border border-amber-300 bg-amber-50 p-4 text-amber-950">
      Dados somente na memória desta página. Recarregar, fechar ou sair desta página apaga o ensaio. Finalizar não salva os dados de forma permanente.
    </p>
    {!test ? <button type="button" className={primaryButton} onClick={() => {
      dispatch({ type: "start", id: crypto.randomUUID() });
      setMessage("Ensaio iniciado. Registre os pontos de medição.");
    }}>Iniciar ensaio</button> : <>
      <section aria-labelledby="test-status" className="min-w-0 border border-slate-300 bg-white p-5 sm:p-7">
        <h2 ref={statusHeading} tabIndex={-1} id="test-status" className="text-xl font-bold">{test.status === "active" ? "Ensaio em andamento" : "Ensaio finalizado"}</h2>
        <p className="mt-2 break-all text-sm text-slate-600">Identificador do ensaio: {test.id}</p>
        <p className="mt-2 text-slate-600">Pontos registrados: {test.points.length}</p>
        {!test.points.some(point => hasMeasurements(point.measurements)) && <NoMeasurementsNotice subject="test" />}
        {test.status === "finished" && <p className="mt-3">Edição encerrada. Os pontos continuam disponíveis somente nesta página.</p>}
      </section>
      {test.status === "active" && <form aria-labelledby="point-form-title" noValidate onSubmit={savePoint} className="border border-slate-300 bg-white p-5 sm:p-7">
        <h2 id="point-form-title" className="text-xl font-bold">{editingId ? "Editar ponto" : "Adicionar ponto"}</h2>
        {editingId && <p className="mt-2 break-all text-sm text-slate-600">Identificador: {editingId}</p>}
        <p id="measurement-help" className="mt-3 text-sm leading-relaxed text-slate-600">Todos os campos são opcionais. Em branco significa sem dado; zero é um valor registrado. Use vírgula ou ponto decimal, sem separador de milhar. A validação não avalia a adequação hidráulica das medições.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {measurementFields.map(({ key, label, unit }, index) => <div key={key} className="min-w-0">
            <label htmlFor={`measurement-${key}`} className="block text-sm font-semibold">{label} ({unit})</label>
            <input ref={index === 0 ? firstInput : undefined} id={`measurement-${key}`} type="text" inputMode="decimal" autoComplete="off"
              value={draft[key]} aria-invalid={Boolean(errors[key])} aria-describedby={`measurement-help${errors[key] ? ` error-${key}` : ""}`}
              onChange={event => { setDraft(previous => ({ ...previous, [key]: event.target.value })); setErrors(previous => ({ ...previous, [key]: undefined })); }}
              className="mt-2 w-full min-w-0 rounded border border-slate-400 bg-white px-3 py-3 text-base" />
            {errors[key] && <p id={`error-${key}`} className="mt-2 text-sm text-red-800">{errors[key]}</p>}
          </div>)}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className={primaryButton} type="submit">{editingId ? "Salvar alterações" : "Adicionar ponto"}</button>
          {hasDraft && <button className={button} type="button" onClick={() => { clearDraft(); setMessage("Edição descartada. Pontos registrados preservados."); firstInput.current?.focus(); }}>Cancelar edição</button>}
        </div>
      </form>}
      <section aria-labelledby="registered-points">
        <h2 ref={pointsHeading} tabIndex={-1} id="registered-points" className="text-2xl font-bold">Pontos registrados</h2>
        {test.points.length === 0 ? <p className="mt-4 text-slate-600">Nenhum ponto registrado.</p> : <ol className="mt-5 grid gap-5 md:grid-cols-2">
          {test.points.map((point, index) => <li key={point.id} className="min-w-0 border border-slate-300 bg-white p-5 sm:p-7">
            <h3 className="text-lg font-bold">Ponto {index + 1}</h3>
            <p className="mt-2 break-all text-xs text-slate-600">Identificador: {point.id}</p>
            {!hasMeasurements(point.measurements) && <NoMeasurementsNotice subject="point" />}
            <dl className="mt-5 space-y-3">{measurementFields.map(({ key, label, unit }) => <div key={key} className="flex flex-wrap justify-between gap-x-4 gap-y-1">
              <dt className="text-slate-600">{label} ({unit})</dt>
              <dd className="min-w-0 break-all font-medium">{point.measurements[key] === null ? "Sem dado" : point.measurements[key].toLocaleString("pt-BR", { maximumSignificantDigits: 21 })}</dd>
            </div>)}</dl>
            {test.status === "active" && <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className={button} disabled={hasDraft} aria-label={`Editar ponto ${index + 1}`} onClick={() => {
                setEditingId(point.id); setDraft(pointToDraft(point)); setErrors({});
                setMessage(`Editando ponto ${index + 1}.`); firstInput.current?.focus();
              }}>Editar</button>
              <button type="button" className={button} disabled={hasDraft} aria-label={`Excluir ponto ${index + 1}`} onClick={() => {
                dispatch({ type: "remove", id: point.id }); setMessage(`Ponto ${index + 1} excluído.`); pointsHeading.current?.focus();
              }}>Excluir</button>
            </div>}
          </li>)}
        </ol>}
      </section>
      {test.status === "active" && <div className="space-y-3 border-t border-slate-300 pt-6">
        {hasDraft && <p className="text-sm text-slate-600">Salve ou cancele a edição antes de manipular outros pontos ou finalizar.</p>}
        <p className="text-sm text-slate-600">Finalizar encerra a edição dos pontos. Não avalia os dados nem gera diagnóstico.</p>
        <button type="button" disabled={hasDraft} className={primaryButton} onClick={() => {
          dispatch({ type: "finish" }); setMessage("Ensaio finalizado. Edição encerrada; dados apenas na memória da página.");
        }}>Finalizar ensaio</button>
      </div>}
    </>}
    <p role="status" aria-live="polite" className="text-sm font-medium text-sky-900">{message}</p>
  </div>;
}
