export const PROTOTYPE_NOTICE = "Protótipo demonstrativo — não validado para uso operacional";
export function PrototypeNotice() {
  return <p role="note" className="border-b border-amber-300 bg-amber-50 px-5 py-3 text-center text-sm font-semibold text-amber-950">{PROTOTYPE_NOTICE}</p>;
}
