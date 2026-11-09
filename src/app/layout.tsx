import type { Metadata } from "next";
import Link from "next/link";
import { modules } from "@/modules";
import { PrototypeNotice } from "@/components/prototype-notice";
import "./globals.css";
export const metadata: Metadata = { title: { default: "ORCA | Fundação técnica", template: "%s | ORCA" }, description: "ORCA — Plataforma Inteligente de Diagnóstico e Monitoramento Hidráulico. Protótipo demonstrativo." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>
    <a href="#conteudo" className="sr-only focus:not-sr-only focus:block focus:p-4">Ir para o conteúdo</a>
    <PrototypeNotice />
    <header className="border-b border-slate-700 bg-slate-950 text-white"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-6 py-6">
      <Link href="/" aria-label="ORCA — início" className="text-3xl font-black tracking-widest">ORCA<span className="text-sky-400">.</span></Link>
      <nav aria-label="Navegação principal" className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium"><Link href="/">Início</Link>{modules.map(module => <Link key={module.slug} href={`/${module.slug}`}>{module.title}</Link>)}</nav>
    </div></header>
    <main id="conteudo" className="mx-auto min-h-[70vh] max-w-6xl px-6 py-12 sm:py-20">{children}</main>
    <footer className="border-t border-slate-300 px-6 py-7 text-center text-sm text-slate-600">ORCA · Protótipo demonstrativo · Sem validação operacional</footer>
  </body></html>;
}
