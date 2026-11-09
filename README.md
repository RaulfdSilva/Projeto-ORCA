# Projeto-ORCA
O ORCA é uma plataforma inteligente de diagnóstico e monitoramento de bombas e motores hidráulicos. Utilizando inteligência artificial e análise de parâmetros operacionais, identifica anomalias, sugere possíveis causas de falhas e auxilia profissionais na manutenção preventiva, reduzindo riscos de paradas e custos operacionais.

## Estado atual

A descrição acima registra a visão original do projeto, e não funcionalidades disponíveis. Esta entrega contém somente a fundação técnica e páginas informativas dos módulos de equipamentos, ensaios, diagnósticos e relatórios.

**Protótipo demonstrativo — não validado para uso operacional**

Não há autenticação, banco de dados, APIs externas, IA, sensores, dados de oficina ou resultados de diagnósticos. Funcionalidades de negócio dependem de novos requisitos aprovados. O [PRD](docs/PRD.md) é apenas um placeholder.

## Instalação e execução

Requisitos: Node.js 22.13 ou superior e npm. As versões resolvidas estão em `package-lock.json`.

```sh
npm ci
npm run dev
```

Abra http://localhost:3000. Para produção local:

```sh
npm run build
npm start
```

## Verificações

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

`lint` executa ESLint; `typecheck` verifica TypeScript strict; `test` executa Vitest sem modo de observação; `build` gera a aplicação Next.js com Webpack. Não são necessárias variáveis de ambiente.

## Estrutura

- `src/app/`: App Router, layout, estilos e páginas informativas.
- `src/components/`: componentes compartilhados, incluindo o aviso do protótipo.
- `src/modules/`: diretórios independentes para equipamentos, ensaios, diagnósticos e relatórios; contêm somente metadados de apresentação.
- `docs/PRD.md`: espaço para requisitos futuros aprovados.

As páginas usam os metadados dos módulos, sem camadas de serviços ou persistência. Tailwind CSS cuida da apresentação; não há biblioteca adicional de componentes. Os testes básicos verificam a presença do aviso e a navegação para os quatro módulos, sem simular diagnósticos hidráulicos.
