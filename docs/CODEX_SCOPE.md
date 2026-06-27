# Codex Scope — SallumC Co. & Family Vitrine

Data: 2026-06-27

## Escopo Codex

- Remover da interface publica qualquer exibicao de valor, percentual ou badge de comissao.
- Manter apenas disclosure generico de afiliado: alguns links podem gerar comissao sem custo extra para o visitante.
- Ajustar textos de confianca para nao prometer responsabilidade da SallumC sobre pagamento, entrega, estoque, prazo ou suporte.
- Adicionar base institucional minima da landing:
  - `/sobre`
  - `/privacidade`
  - `/termos`
  - `/contato`
- Adicionar SEO/crawler/social basico:
  - canonical URL no layout;
  - meta description por pagina;
  - Open Graph/Twitter card;
  - `robots.txt`;
  - `sitemap.xml`;
  - `og-image.svg`.

## Decisoes

- `src/data/catalogo.json` pode continuar guardando dados internos de comissao para operacao/curadoria.
- Campos internos de comissao nao devem ser serializados para HTML/JS publico.
- O site deve comunicar afiliacao de forma transparente, sem publicar valores de comissao.
- Preco, estoque, frete, pagamento, entrega e suporte devem ser descritos como responsabilidade da loja/marketplace parceiro.
- Deploy da vitrine deve continuar manual; automacao de scan nao deve publicar automaticamente.

## Validacoes Executadas

- `npm run build`: passou.
- `astro preview`: respondeu `200` para:
  - `/`
  - `/sobre/`
  - `/termos/`
  - `/robots.txt`
- Busca no `dist` e no HTML servido confirmou ausencia de:
  - `commission`
  - `comissao_texto`
  - `Taxa de comissão`
  - `Entrega garantida`
  - `Compra 100% segura`
  - `Pagamento protegido`
  - `Suporte da loja`

## Fora do Escopo Codex Nesta Rodada

- Redesign profundo de marca.
- Pesquisa externa de concorrentes.
- Deploy.
- Alteracao destrutiva do catalogo.
- Trabalho em Anatomia do Gasto.
