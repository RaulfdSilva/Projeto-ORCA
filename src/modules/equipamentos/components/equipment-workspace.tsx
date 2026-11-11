"use client";

import { useRef, type FormEvent } from "react";
import { useEquipmentWorkspace } from "@/modules/ensaios/components/test-provider";
import { assistedFamilies, assistedManufacturer, emptyEquipment, equipmentLabel, type EquipmentData, type EquipmentMode } from "../model";
import { validateEquipment } from "../validation";

const button = "rounded border border-slate-400 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50";
const fields: { key: keyof EquipmentData; label: string; required: boolean }[] = [
  { key: "manufacturer", label: "Fabricante", required: true },
  { key: "family", label: "Família", required: true },
  { key: "model", label: "Modelo ou identificação técnica", required: true },
  { key: "serial", label: "Número de série ou código interno (opcional)", required: false },
];
export function EquipmentWorkspace() {
  const { equipment, dispatch, draft, setDraft, mode, setMode, editingId, setEditingId,
    errors, setErrors, message, setMessage } = useEquipmentWorkspace();
  const formHeading = useRef<HTMLHeadingElement>(null);
  const hasDraft = editingId !== null || Object.values(draft).some(value => value !== "");
  function clear() {
    setDraft({ ...emptyEquipment }); setEditingId(null); setErrors({}); setMode("manual");
  }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateEquipment(draft, mode);
    if (!result.ok) {
      setErrors(result.errors); setMessage("Equipamento não salvo. Revise os campos indicados.");
      const key = fields.find(field => result.errors[field.key])?.key;
      if (key) document.getElementById(`equipment-${key}`)?.focus();
      return;
    }
    if (editingId) dispatch({ type: "equipment/update", id: editingId, data: result.data });
    else dispatch({ type: "equipment/add", equipment: { id: crypto.randomUUID(), ...result.data } });
    setMessage(editingId ? "Equipamento atualizado. ID e vínculos preservados." : "Equipamento cadastrado.");
    clear(); formHeading.current?.focus();
  }
  function changeMode(nextMode: EquipmentMode) {
    setMode(nextMode); setErrors({});
    if (nextMode === "assisted") setDraft(previous => ({ ...previous, manufacturer: assistedManufacturer, family: assistedFamilies[0] }));
  }
  return <div className="mt-8 space-y-8">
    <p role="note" className="rounded border border-amber-300 bg-amber-50 p-4 text-amber-950">Dados somente na memória da aplicação. A navegação interna preserva os cadastros e a edição aberta; recarregar, fechar ou sair da aplicação elimina os dados.</p>
    <form noValidate aria-labelledby="equipment-form-title" onSubmit={save} className="border border-slate-300 bg-white p-5 sm:p-7">
      <h2 ref={formHeading} tabIndex={-1} id="equipment-form-title" className="text-xl font-bold">{editingId ? "Editar equipamento" : "Cadastrar equipamento"}</h2>
      {editingId && <p className="mt-3 break-all text-sm">ID interno: {editingId}</p>}
      <fieldset className="mt-5"><legend className="font-semibold">Modo de cadastro</legend><div className="mt-3 flex flex-wrap gap-5">
        <label className="flex items-center gap-2 py-2"><input type="radio" name="equipment-mode" value="manual" checked={mode === "manual"} onChange={() => changeMode("manual")} />Manual</label>
        <label className="flex items-center gap-2 py-2"><input type="radio" name="equipment-mode" value="assisted" checked={mode === "assisted"} onChange={() => changeMode("assisted")} />Seleção assistida</label>
      </div></fieldset>
      <p id="equipment-help" className="mt-4 text-sm text-slate-600">Fabricante, família e modelo são obrigatórios. No modo assistido, selecione a família e informe o modelo completo. Não há catálogo de modelos ou especificações técnicas. Use o modo manual para outros fabricantes e famílias.</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">{fields.map(({ key, label, required }) => <div key={key} className="min-w-0">
        <label htmlFor={`equipment-${key}`} className="block text-sm font-semibold">{label}</label>
        {key === "family" && mode === "assisted" ? <select id={`equipment-${key}`} required aria-invalid={Boolean(errors[key])} aria-describedby={`equipment-help${errors[key] ? ` equipment-error-${key}` : ""}`}
          value={draft.family} onChange={event => { setDraft(previous => ({ ...previous, family: event.target.value })); setErrors(previous => ({ ...previous, family: undefined })); }}
          className="mt-2 w-full min-w-0 rounded border border-slate-400 px-3 py-3 text-base">{assistedFamilies.map(family => <option key={family}>{family}</option>)}</select>
          : <input id={`equipment-${key}`} required={required} readOnly={key === "manufacturer" && mode === "assisted"} value={draft[key]} aria-invalid={Boolean(errors[key])}
            aria-describedby={`equipment-help${errors[key] ? ` equipment-error-${key}` : ""}`} onChange={event => { setDraft(previous => ({ ...previous, [key]: event.target.value })); setErrors(previous => ({ ...previous, [key]: undefined })); }}
            className="mt-2 w-full min-w-0 rounded border border-slate-400 px-3 py-3 text-base read-only:bg-slate-100" />}
        {errors[key] && <p id={`equipment-error-${key}`} className="mt-2 text-sm text-red-800">{errors[key]}</p>}
      </div>)}</div>
      <div className="mt-6 flex flex-wrap gap-3"><button type="submit" className={button}>{editingId ? "Salvar equipamento" : "Cadastrar equipamento"}</button>
      {hasDraft && <button type="button" className={button} onClick={() => { clear(); setMessage("Edição cancelada. Cadastros preservados."); formHeading.current?.focus(); }}>Cancelar cadastro ou edição</button>}</div>
    </form>
    <section aria-labelledby="equipment-list-title"><h2 id="equipment-list-title" className="text-2xl font-bold">Equipamentos cadastrados</h2>
      {equipment.length === 0 ? <p className="mt-4 text-slate-600">Nenhum equipamento cadastrado.</p> : <ul className="mt-5 grid gap-5 md:grid-cols-2">{equipment.map(item => <li key={item.id} className="min-w-0 border border-slate-300 bg-white p-5 sm:p-7">
        <h3 className="break-words text-lg font-bold">{equipmentLabel(item)}</h3><p className="mt-2 break-all text-xs text-slate-600">ID interno: {item.id}</p>
        <dl className="mt-4 space-y-2">{fields.map(field => <div key={field.key}><dt className="text-sm text-slate-600">{field.label}</dt><dd className="break-words">{item[field.key] || "Não informado"}</dd></div>)}</dl>
        <button type="button" disabled={hasDraft} className={`${button} mt-5`} aria-label={`Editar equipamento ${item.id}`} onClick={() => {
          setDraft({ manufacturer: item.manufacturer, family: item.family, model: item.model, serial: item.serial }); setMode("manual"); setEditingId(item.id); setErrors({}); setMessage("Editando equipamento."); formHeading.current?.focus();
        }}>Editar</button>
      </li>)}</ul>}
      {hasDraft && equipment.length > 0 && <p className="mt-4 text-sm text-slate-600">Salve ou cancele o formulário antes de editar outro equipamento.</p>}
    </section>
    <p role="status" aria-live="polite" className="text-sm font-medium text-sky-900">{message}</p>
  </div>;
}
