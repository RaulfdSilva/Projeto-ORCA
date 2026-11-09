import type { Metadata } from "next";
import { TestWorkspace } from "@/modules/ensaios/components/test-workspace";

export const metadata: Metadata = { title: "Ensaios" };
export default function Page() {
  return <section>
    <p className="text-sm font-bold uppercase tracking-widest text-sky-800">Registro manual</p>
    <h1 className="mt-4 text-4xl font-bold">Ensaios hidráulicos</h1>
    <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-600">Inicie um ensaio e registre múltiplos pontos de medição. Adicione, edite ou exclua pontos antes de finalizar, sem cálculos de diagnóstico.</p>
    <TestWorkspace />
  </section>;
}
