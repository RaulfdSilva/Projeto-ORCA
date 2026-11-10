# Ensaios multiponto — decisões e limitações

## Escopo

Registro manual de um ensaio por instância da aplicação, com múltiplos pontos. Cada ponto possui pressão (bar), vazão (L/min), rotação (rpm), temperatura (°C) e vazão de dreno (L/min). Nenhuma identificação de equipamento é exigida.

É possível iniciar, adicionar, editar e excluir pontos e finalizar. Finalizar encerra a edição local; não aprova os dados nem produz diagnóstico. Não há autenticação, banco de dados, IA, sensores, PDF, limites de fabricante ou hipóteses de falha.

## Organização

- `src/modules/ensaios/model.ts`: modelos e campos de apresentação; conversão de ponto em formulário.
- `validation.ts`: leitura de decimais e erros por campo, independente da interface.
- `state.ts`: reducer puro para início, adição, atualização, exclusão e finalização.
- `components/test-provider.tsx`: contexto de ensaio e formulário no layout raiz, incluindo proteção de recarga/fechamento.
- `components/test-workspace.tsx`: interface cliente que consome o contexto compartilhado.
- `src/app/ensaios/page.tsx`: composição da página no App Router existente.

Nenhuma dependência de produção foi adicionada. `jsdom` é usado somente no desenvolvimento, para testar a montagem/desmontagem da interface com React DOM e Vitest.

## Dados e validação

IDs de ensaio e pontos são UUIDs gerados com `crypto.randomUUID()` ao iniciar/adicionar, em contexto seguro (HTTPS ou localhost). O reducer preserva IDs na edição e impede duplicatas no ensaio. A numeração visual pode mudar após exclusões; o identificador permanece estável.

Os cinco campos são `number | null`. Campo vazio ou somente com espaços vira `null`; zero permanece `0`. Um ponto totalmente sem dados é permitido porque não há medição obrigatória aprovada. Um ensaio pode ser finalizado vazio; isso não confere validade técnica.

A entrada aceita decimais com ponto ou vírgula, sinal opcional e espaços externos. Não aceita unidades, separadores de milhar, notação exponencial, hexadecimal, `NaN`, infinito ou texto. Por exemplo, `1.234` significa um decimal, e não mil duzentos e trinta e quatro. São usados números JavaScript de precisão finita; não se oferece aritmética decimal exata. Valores fora da representação finita são rejeitados. Ao editar valores pequenos ou grandes, a conversão evita notação exponencial para manter o formato aceito pelo formulário.

A validação é somente sintática: não há faixas hidráulicas, limites de fabricante ou restrição de sinal. Adequação técnica, convenções de sinal e precisão metrológica dependem de requisitos futuros aprovados.

## Estado e finalização

`useReducer` mantém o ensaio exclusivamente em memória no `TestProvider` do layout raiz. O provider também mantém o rascunho, o ponto em edição, os erros e a mensagem de status. A troca de páginas pelo App Router desmonta a interface de ensaios, mas preserva o provider, sem interceptar links ou histórico. Ao voltar, os mesmos IDs, pontos e edição são restaurados. Não há localStorage, cookies ou promessas de recuperação. Sair da aplicação, fechar ou recarregar apaga o estado. Não há histórico de ensaios ou ação de iniciar um segundo ensaio na mesma instância.

O formulário usa strings para preservar a digitação e distinguir ausência de zero. Os pontos só são alterados após validação no envio. Salvar uma edição mantém o ID; cancelar descarta apenas o formulário. Enquanto há edição aberta, editar/excluir outros pontos e finalizar ficam desabilitados para evitar perder o rascunho inadvertidamente. Excluir remove o ponto imediatamente, sem desfazer nesta versão. Após a finalização, o reducer também bloqueia alterações, independentemente da interface.

## Interface e verificações

Formulário com rótulos e unidades, erros associados aos campos, foco no primeiro erro e mensagens em região de status. A lista usa cartões com quebra de identificadores longos, uma coluna em telas pequenas e duas em telas maiores. Não depende de tabela horizontal extensa ou interação por hover.

Testes Vitest cobrem ausência versus zero, decimais, entradas inválidas em todos os campos, conversão de edição, múltiplos pontos, IDs, imutabilidade, exclusão e bloqueio após finalização. A validação visual desktop/mobile no navegador permanece pendente pelas limitações já identificadas no ambiente; o Chromium não foi executado novamente.

## Revisão final — avisos e proteção contra perda

Pontos com todos os campos `null` e ensaios sem nenhuma medição exibem aviso informativo de que não possuem dados suficientes para análise técnica. Zero conta como medição. O aviso não bloqueia inclusão ou finalização, e a ausência de aviso não certifica suficiência técnica.

Enquanto o ensaio estiver iniciado e não finalizado, um listener `beforeunload` solicita a confirmação nativa ao recarregar ou fechar a página, inclusive se o ensaio estiver vazio. O listener pertence ao provider e continua ativo mesmo fora da página de ensaios; é removido ao finalizar ou desmontar a aplicação. O navegador controla o texto e a exibição da confirmação, normalmente exige interação prévia e pode não disparar o evento em alguns encerramentos móveis. Não há garantia de recuperação ou salvamento. Navegação interna do App Router preserva o estado no layout compartilhado e não exige confirmação. Navegações que recarreguem o documento continuam sujeitas a `beforeunload`. Após finalizar, não há confirmação de saída, mas os dados continuam temporários.

A validação também rejeita decimais não nulos que seriam convertidos em zero por underflow. Os testes da proteção verificam registro, cancelamento do evento e limpeza dos listeners com `EventTarget`; não simulam a caixa de diálogo nativa nem substituem testes manuais desktop/mobile.

## Regressão de navegação interna

Testes de integração em jsdom mantêm o provider montado e desmontam/remontam a página, reproduzindo o contrato do layout persistente do App Router. Verificam pontos, IDs, `null` e zero, rascunho, edição com erro, finalização, proteção de saída nas demais seções e perda de estado quando a aplicação é recriada. Não substituem validação visual ou teste de navegação em navegador real; essa validação permanece pendente.
