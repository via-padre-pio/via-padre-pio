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
| Opções de entrega | `entrega` | **Sim** |
| Frete dos Correios por estado | `frete` | **Sim** |
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

**O endereço completo é coletado pela InfinitePay**, não pelo site: o checkout tem
uma etapa "Entrega" obrigatória, com CEP, rua, número, bairro, cidade e estado. Ele
fica registrado na venda, dentro do app — é lá que vocês consultam para onde enviar.

O que a InfinitePay *não* sabe é a forma de entrega escolhida (retirada, entrega em
mãos ou Correios) e as observações do cliente. Isso chega pelo botão "Enviar meus
dados de entrega" da tela de confirmação, que abre o WhatsApp com a mensagem já
escrita. Quem quiser mandar só a prova do pagamento tem um segundo link na mesma
janela, "Enviar comprovante no WhatsApp".

As três mensagens chegam no formato de cartão: a primeira linha diz o que aconteceu
e com qual pedido — e é justamente ela que vocês leem na lista de conversas, antes
de abrir —, depois vêm os dados do pagamento e, no caso do pedido pago, os dados da
entrega:

```
*PEDIDO PAGO · VIA-20261023-A7K2P*
──────────────────
*Pagamento:* Cartão em 5x
*Total pago:* R$ 361,70
_R$ 329,70 em peças + R$ 32,00 de acréscimo do parcelamento_
*Comprovante:* https://comprovante.infinitepay.io/abc123
──────────────────
*Cliente:* Maria das Dores Silva
*CEP:* 06410-120
*Cidade:* Barueri - SP
*Entrega:* Enviar pelos Correios (frete à parte)

*Peças:*
1. Padre Pio — Oversized · Tam G · 2x

Olá! Acabei de pagar no site. O endereço de entrega é o que preenchi
no checkout da InfinitePay.
```

As outras duas começam por `*COMPROVANTE · ...*` e `*PAGAMENTO NÃO CONFIRMADO ·
...*`, e trazem o mesmo bloco de pagamento. O WhatsApp não tem cartão de verdade em
link `wa.me` — só texto —, então o formato é feito com o que ele sabe desenhar:
negrito, itálico e o traço longo.

A linha em itálico só aparece quando o cliente parcelou. Sem ela, um valor pago
maior que o do pedido pareceria erro de cobrança.

**Taxas e parcelamento ficam no app da InfinitePay** (Meios de Pagamento → cartão de
crédito), onde se escolhe entre *repassar* ou *assumir* as taxas. Repassando, o
cliente paga o acréscimo e vocês recebem o valor cheio; assumindo, o cliente paga o
preço do pedido e a taxa sai do recebimento — e aí dá para limitar quantas parcelas
saem sem juros. Hoje a conta repassa, então os textos do site falam em "até 12x" sem
prometer "sem juros". Se vocês passarem a assumir as taxas, vale revisar essas
frases no `index.html`.

Atenção a um detalhe do repasse: **só o Pix sai pelo valor do pedido.** O cartão tem
acréscimo até em 1x. Conferido num pedido de R$ 509,50:

| Forma | O cliente paga |
| --- | --- |
| Pix | R$ 509,50 |
| Crédito 1x | R$ 531,84 |
| Crédito 5x | 5× R$ 111,74 = R$ 558,70 |
| Crédito 12x | 12× R$ 50,95 = R$ 611,40 |

Em todos eles vocês recebem os R$ 509,50.

A confirmação mostra o que o cliente realmente pagou: a InfinitePay devolve o valor
e o número de parcelas, e quando o valor pago passa do preço das peças a janela
explica a diferença ("5× de R$ 107,20 · R$ 509,50 em peças + R$ 26,48 de acréscimo
do parcelamento").

---

## Frete: o CEP é quem decide

O cliente digita o CEP e o site pergunta a [BrasilAPI](https://brasilapi.com.br) de
onde ele é. O estado da resposta entra na tabela `frete` do `js/config.js` e vira o
valor cobrado — que aparece no resumo, no botão de pagar e como uma linha própria na
cobrança da InfinitePay ("Frete para Santa Catarina"). Nada de descobrir o frete só
no checkout.

Os valores começaram por região e **são para vocês trocarem** pelos dos Correios:

| Região | Hoje | Estados |
| --- | --- | --- |
| São Paulo | R$ 20 | SP |
| Sul e resto do Sudeste | R$ 30 | MG, RJ, ES, PR, SC, RS |
| Centro-Oeste e Nordeste | R$ 40 | DF, GO, MT, MS, BA, SE, AL, PE, PB, RN, CE, PI, MA |
| Norte | R$ 50 | TO, PA, AP, RR, AM, AC, RO |

Quem escolhe retirar ou receber em mãos não paga frete, em qualquer estado: isso vem
do campo `frete` da opção de entrega, não da tabela. O que liga uma opção à tabela é
`porEstado: true` — hoje, só os Correios.

Três coisas que valem saber:

- **CEP não conferido barra o pedido.** Se a BrasilAPI não responder ou o CEP não
  existir, o campo avisa e o botão de pagar não segue. É melhor do que cobrar um
  frete errado e descobrir na hora de postar.
- **Sigla que não estiver na tabela sai por zero**, de propósito: esquecer um estado
  faz a loja pagar o envio, nunca o cliente pagar um número inventado.
- **O endereço completo continua sendo o da InfinitePay.** O CEP serve para o preço;
  rua, número e complemento são pedidos no checkout, como sempre.

---

## Coleções e modelos: como os dois se encaixam

São duas listas separadas em `js/config.js`, e a página cruza uma com a outra:

- **`modelos`** são os caimentos — oversized, tradicional masculina, tradicional
  feminina, baby look e infantil. **O preço mora aqui**, não na coleção.
- **`colecoes`** são as estampas. Cada uma vira um bloco do catálogo, com um cartão
  para cada modelo: uma coleção em cinco modelos dá cinco cartões.

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

> As fotos chegam da sessão numeradas de `1` a `12`, e a ordem é sempre a mesma:
> 1 e 2 baby look, 3 e 4 tradicional feminina, 5 e 6 oversized, 7 e 8 tradicional
> masculina, 9 a 12 infantil (menina e depois menino). Os números ímpares são a
> frente.

```
oversized-frente.jpg              oversized-costas.jpg
tradicional-masculina-frente.jpg  tradicional-masculina-costas.jpg
tradicional-feminina-frente.jpg   tradicional-feminina-costas.jpg
baby-look-frente.jpg              baby-look-costas.jpg
infantil-menina-frente.jpg        infantil-menina-costas.jpg
infantil-menino-frente.jpg        infantil-menino-costas.jpg
```

Use imagens em pé (960×1080 px serve bem) e salve em `.jpg`.

**Se a estampa não sair em todos os modelos**, liste em `modelos` só os que existem
e explique isso em `nota` — assim o bloco não fica com um buraco sem explicação. É o
caso da "Amai Nossa Senhora", que existe apenas no oversized:

```js
modelos: ["oversized"],
nota: "Esta estampa sai apenas no modelo oversized.",
```

Nesse caso a pasta de fotos tem só as duas do oversized, e não as doze. Se um dia a
estampa sair nos outros modelos, apague as duas linhas e acrescente as fotos.

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
- **O catálogo é uma vitrine de fotos.** Cada coleção abre com o nome, o santo e a
  frase sobre a estampa; abaixo vêm as camisetas, uma por cartão — as cinco
  numa linha no notebook, três no tablet e duas no celular. O cartão mostra a foto,
  o modelo e o preço; o tamanho aparece ao tocar em "Escolher", um cartão por vez.
- **Nenhum tamanho vem marcado de antemão**, para um padrão silencioso não virar
  pedido errado.
- **As miniaturas embaixo da foto mostram frente e costas.** No infantil são quatro,
  porque a peça foi fotografada em menina e em menino — é a mesma camiseta.
- **Clicar na foto grande abre ela em tela cheia, com zoom.** Outro clique amplia no
  ponto escolhido e o arraste passeia pela imagem; no celular funciona com a pinça
  de dois dedos, e no computador também com a roda do mouse. É o que deixa ver o
  traço da estampa de perto, que é onde está o produto. As miniaturas continuam ali
  dentro, para trocar de vista sem fechar.
- **A tabela de medidas abre numa janela** e vem de `medidas`, no `js/config.js`.
  Dentro de um cartão, ela já abre na aba do modelo daquela camiseta. No celular ela
  é mais larga que a tela, então ao abrir ela corre sozinha até o último tamanho e
  volta ao PP — em um segundo e meio a pessoa vê que há mais colunas à direita e
  aprende que dá para arrastar. Quem já começou a arrastar interrompe o passeio.
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
