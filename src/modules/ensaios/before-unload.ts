// O navegador controla o texto e a disponibilidade da confirmação nativa.
export function registerBeforeUnload(target: EventTarget, active: boolean): () => void {
  if (!active) return () => {};
  function preventDataLoss(event: Event) {
    event.preventDefault();
    // Compatibilidade com navegadores que ainda exigem returnValue.
    (event as BeforeUnloadEvent).returnValue = "";
  }
  target.addEventListener("beforeunload", preventDataLoss);
  return () => target.removeEventListener("beforeunload", preventDataLoss);
}
