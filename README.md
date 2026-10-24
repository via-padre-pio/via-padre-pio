# Via Padre Pio — site de pré-venda

Página de pré-venda de camisetas. O cliente escolhe a coleção, o modelo e o tamanho,
preenche os dados e paga no próprio site — Pix, crédito à vista ou parcelado, pelo
checkout da InfinitePay. O WhatsApp de vocês é o atendimento: tira dúvidas, recebe o
endereço de entrega e resolve o que precisar depois da compra.

Site estático (HTML, CSS e JavaScript puros), sem instalação e sem servidor.

---

## Antes de publicar: o que precisa ser preenchido

Tudo fica em **`js/config.js`**. É o único arquivo do dia a dia.

| O quê | Onde | Obrigatório |
|---|---|---|
| InfiniteTag que recebe os pagamentos | `pagamento.handle` | **Sim** |
| Número do atendimento | `contato.whatsapp` | **Sim** |
| Como o número aparece na tela | `contato.whatsappVisivel` | Sim |
| E-mail de contato | `contato.email` | Não |
| Usuário do Instagram | `contato.instagram` | Não |
| CNPJ (linha discreta no fim do rodapé) | `contato.cnpj` | Não |
| Arquivo do logo | `marca.logo` | Não |
| Cores da marca | `tema` | Não |
| Cor e tamanhos da pré-venda | `prevenda` | **Sim** |
| Modelos de camiseta e seus preços | `modelos` | **Sim** |
| Coleções e suas fotos | `colecoes` | **Sim** |
| Tabelas de medidas | `medidas` | Não |

O número do WhatsApp vai **só com dígitos**, no formato `55` + DDD + número:

```js
whatsapp: "5511912345678",   // para (11) 91234-5678
```

---

## Ligar o pagamento (InfinitePay)

O site já está pronto para cobrar. Falta só apontar para a conta de vocês, e são
três passos — os dois primeiros no aplicativo da InfinitePay:

1. **Habilite o Checkout Integrado.** No app: **Vendas → Checkout → Configurações →
   Habilitar Checkout Integrado**. Sem isso a InfinitePay recusa os pedidos que
   saem do site, e o cliente vê um aviso pedindo para chamar no WhatsApp.
2. **Escolha as formas de pagamento** e em quantas parcelas vocês absorvem a taxa.
   Isso fica lá, e não no site, porque mudar pelo site exigiria a chave secreta da
   conta — e chave secreta não pode morar num arquivo que qualquer visitante abre.
3. **Copie a sua InfiniteTag** (o nome de usuário no app) e escreva em
   `js/config.js`, **sem o cifrão**:

```js
pagamento: {
  handle: "viapadrepio",   // a sua InfiniteTag, sem o $
  retorno: "",             // vazio = volta para a própria página do site
},
```

Como funciona na prática: o cliente monta o pedido, preenche os dados e é levado ao
checkout da InfinitePay. Lá ele escolhe Pix, crédito à vista ou parcelado e digita
o cartão — **nenhum dado de pagamento passa pelo site de vocês**. Terminado,
a InfinitePay traz ele de volta, o site confere com ela se o pagamento saiu mesmo e
mostra a confirmação com o número do pedido.

**O endereço de entrega não vai junto.** A InfinitePay recebe o nome, o e-mail, o
telefone e a lista de peças; a cidade, a forma de entrega e as observações ficam no
botão "Enviar meus dados de entrega" que aparece na confirmação, e chegam no
WhatsApp com o número do pedido e o link do comprovante. É assim que as duas pontas
se juntam. Quem quiser mandar só o comprovante tem um segundo link na mesma janela,
"Enviar comprovante no WhatsApp".

**Taxas e parcelamento ficam no app da InfinitePay** (Meios de Pagamento → cartão de
crédito), onde se escolhe entre *repassar* ou *assumir* as taxas. Repassando, o
cliente paga o acréscimo do parcelamento e vocês recebem o valor cheio; assumindo, o
cliente paga o preço do pedido e a taxa sai do recebimento — e aí dá para limitar
quantas parcelas saem sem juros. Hoje os textos do site falam em "até 12x" sem
prometer "sem juros", que é o correto para o repasse. Se vocês passarem a assumir as
taxas, vale revisar essas frases no `index.html`.

A confirmação mostra o que o cliente realmente pagou: a InfinitePay devolve o valor
e o número de parcelas, e quando o valor pago passa do preço das peças a janela
explica a diferença ("5× de R$ 107,20 · R$ 509,50 em peças + R$ 26,48 de acréscimo
do parcelamento").

Se alguma opção de entrega tiver frete cobrado na hora, basta escrever o valor em
reais no campo `frete` dela, dentro de `entrega`: ele entra como uma linha a mais
no checkout. Com `frete: 0`, o cliente paga só as peças.

---

## Coleções e modelos: como os dois se encaixam

São duas listas separadas em `js/config.js`, e a página cruza uma com a outra:

- **`modelos`** são os caimentos — oversized, tradicional masculina, tradicional
  feminina, baby look e infantil. **O preço mora aqui**, não na coleção.
- **`colecoes`** são as estampas. Cada uma vira um bloco do catálogo, com um cartão
  para cada modelo: três coleções e cinco modelos dão quinze cartões.

Ou seja: mudou o preço do oversized, mudou em todas as coleções de uma vez.

### Acrescentar uma coleção

Copie um bloco inteiro de `colecoes`, cole abaixo e troque os dados:

```js
{
  id: "nome-curto",                  // apelido único, sem espaço nem acento
  nome: "Nome da Coleção",
  santo: "Santa Teresinha do Menino Jesus",   // abre a história ao clicar
  descricao: "Frase curta sobre a estampa.",
  pasta: "assets/colecoes/nome-curto",
  esgotada: false,                   // true tira a coleção inteira da venda
},
```

**As fotos vão numa pasta própria**, dentro de `assets/colecoes/`, e o nome de cada
arquivo é o que diz ao site a qual modelo ela pertence. São doze, sempre com estes
nomes exatos:

```
oversized-frente.jpg              oversized-costas.jpg
tradicional-masculina-frente.jpg  tradicional-masculina-costas.jpg
tradicional-feminina-frente.jpg   tradicional-feminina-costas.jpg
baby-look-frente.jpg              baby-look-costas.jpg
infantil-menina-frente.jpg        infantil-menina-costas.jpg
infantil-menino-frente.jpg        infantil-menino-costas.jpg
```

Use imagens em pé (960×1080 px serve bem) e salve em `.jpg`.

**Cor e tamanhos** valem para a pré-venda inteira e ficam em `prevenda`. O infantil é
a exceção: tem a sua própria grade de tamanhos, declarada dentro do modelo.

---

## Ver o site no seu computador

Abra o arquivo `index.html` com dois cliques. É o suficiente para conferir mudanças.

Para um teste mais fiel ao que vai para o ar, rode um servidor local:

```powershell
python -m http.server 8000
```

E acesse `http://localhost:8000`.

---

## Publicar no GitHub Pages

Na primeira vez:

```powershell
git add .
git commit -m "Site de pré-venda"
git branch -M main
git remote add origin https://github.com/via-padre-pio/NOME-DO-REPOSITORIO.git
git push -u origin main
```

Depois, no GitHub: **Settings → Pages → Source: Deploy from a branch →
Branch: `main` / `/ (root)` → Save**. Em poucos minutos o site fica no ar em
`https://via-padre-pio.github.io/NOME-DO-REPOSITORIO/`.

> Para o endereço ficar `https://via-padre-pio.github.io` (sem nada depois da barra),
> o repositório precisa se chamar exatamente `via-padre-pio.github.io`.

Nas próximas atualizações:

```powershell
git add .
git commit -m "Novos modelos da pré-venda"
git push
```

---

## Estrutura dos arquivos

```
.
├── index.html              página única
├── css/estilo.css          aparência (as cores vêm do config)
├── js/config.js            ← tudo que vocês editam
├── js/app.js               catálogo, carrinho e pagamento
├── js/animacoes.js         só os movimentos da página (enfeite, veja abaixo)
└── assets/
    ├── logo.png            logo da marca (aparece na capa e no rodapé)
    ├── santos/             fotos de "Nossa Essência"
    └── colecoes/           uma pasta por coleção, com 12 fotos cada
```

As cores atuais foram tiradas do próprio logo: creme `#f4ece3` no fundo e
marrom `#6b4a1e` nas letras e botões.

---

## Detalhes que valem saber

- **O dinheiro não passa pelo site.** Quem cobra, guarda o cartão e repassa é a
  InfinitePay; aqui só se monta o pedido e se confere, na volta, se ele foi pago.
- **O carrinho só é esvaziado quando o pagamento se confirma.** Se o cliente desistir
  no meio do checkout e voltar, encontra tudo como deixou.
- **O pedido fica salvo no navegador do cliente.** Se ele fechar a aba e voltar, os
  itens continuam lá.
- **Cada pedido ganha um número** (`VIA-20261023-AF8KT`) que aparece na confirmação,
  vai para a InfinitePay e entra na mensagem do WhatsApp: é por ele que vocês
  cruzam o pagamento recebido com a pessoa que escreveu.
- **O catálogo é uma vitrine de fotos.** Cada coleção abre com o nome, a santa e a
  frase sobre a estampa; abaixo vêm as cinco camisetas, uma por cartão — as cinco
  numa linha no notebook, três no tablet e duas no celular. O cartão mostra a foto,
  o modelo e o preço; o tamanho aparece ao tocar em "Escolher", um cartão por vez.
- **Nenhum tamanho vem marcado de antemão**, para um padrão silencioso não virar
  pedido errado.
- **As miniaturas embaixo da foto mostram frente e costas.** No infantil são quatro,
  porque a peça foi fotografada em menina e em menino — é a mesma camiseta.
- **A tabela de medidas abre numa janela** e vem de `medidas`, no `js/config.js`.
  Dentro de um cartão, ela já abre na aba do modelo daquela camiseta.
- **"Nossa Essência" fica no rodapé.** Os santos vêm de `inspiracoes.santos`,
  no `js/config.js`: nome, anos de vida, foto (dentro de `assets/santos/`) e a
  história em parágrafos. Clicando no nome, abre uma janela com a foto e o texto.
- **As dúvidas frequentes ficam no `index.html`.** São texto puro, na seção
  `id="duvidas"`. O prazo aparece ali e também em `marca.prazoEntrega`: mudando um,
  confira o outro.
- **As animações são enfeite e nada mais.** Elas vivem em `js/animacoes.js` e usam a
  biblioteca Motion, carregada da internet (CDN) no fim do `index.html`. Se essa
  biblioteca não carregar, ou se o visitante pedir menos movimento nas configurações
  do celular, a página aparece parada — mas inteira, e o pedido funciona igual.
- **Preço alterado no config vale na hora**, inclusive para carrinhos já montados —
  ninguém fica com preço antigo.
- **Coleção removida ou marcada como esgotada** some automaticamente dos pedidos
  que estavam salvos.
