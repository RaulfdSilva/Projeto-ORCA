import Link from "next/link";
import { modules } from "@/modules";
export default function Home() {
  return <>
    <section aria-labelledby="titulo" className="grid gap-8 border-b border-slate-300 pb-12 md:grid-cols-[2fr_1fr] md:gap-16">
      <div><p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-sky-800">Engenharia hidráulica / ORCA</p>
      <h1 id="titulo" className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Plataforma Inteligente de Diagnóstico e Monitoramento Hidráulico</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">Cadastre equipamentos hidráulicos e vincule-os aos ensaios com múltiplos pontos de medição. Diagnósticos e relatórios permanecem reservados para requisitos futuros aprovados.</p></div>
      <aside className="self-start border-l-4 border-sky-600 bg-white p-6"><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Estado do projeto</p><p className="mt-3 text-xl font-bold">Protótipo demonstrativo</p><p className="mt-3 leading-relaxed text-slate-600">Registro manual de medições, sem análise hidráulica ou validação operacional. Dados mantidos somente na memória da aplicação.</p></aside>
    </section>
    <section aria-labelledby="modulos" className="pt-10"><h2 id="modulos" className="text-2xl font-bold">Módulos da plataforma</h2><div className="mt-6 grid gap-5 sm:grid-cols-2">{modules.map((module, index) => <article key={module.slug} className="border border-slate-300 bg-white p-7"><div className="mb-5 flex items-center justify-between"><span aria-hidden="true" className="font-mono text-sm text-slate-500">0{index + 1}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{module.slug === "equipamentos" ? "Cadastro híbrido" : module.slug === "ensaios" ? "Registro manual" : "Estrutura reservada"}</span></div><h3 className="text-xl font-bold"><Link href={`/${module.slug}`}>{module.title}</Link></h3><p className="mt-3 leading-relaxed text-slate-600">{module.description}</p></article>)}</div></section>
  </>;
}
