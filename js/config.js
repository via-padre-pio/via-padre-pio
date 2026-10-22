/* ==========================================================================
   CONFIGURAÇÃO DA LOJA — Via Padre Pio
   --------------------------------------------------------------------------
   Este é o ÚNICO arquivo que você precisa editar no dia a dia.
   Dá para mexer em tudo aqui: contato, cores, textos e camisetas.
   Depois de salvar, envie para o GitHub e o site atualiza sozinho.
   ========================================================================== */

const CONFIG = {

  /* ------------------------------------------------------------------
     1. CONTATO E REDES
     ------------------------------------------------------------------ */
  contato: {
    // Número que vai RECEBER os pedidos.  <<< PREENCHER ANTES DE PUBLICAR >>>
    // Formato: 55 + DDD + número, só dígitos, sem espaço, traço ou parênteses.
    // Exemplo para (11) 91234-5678  ->  "5511912345678"
    // Enquanto estiver vazio, o site avisa o cliente em vez de enviar errado.
    whatsapp: "",

    // Como o número aparece escrito na tela para o cliente.
    whatsappVisivel: "",

    email: "",
    instagram: "viapadrepio",
    cidade: "São Paulo - SP",
  },

  /* ------------------------------------------------------------------
     2. TEXTOS DA PÁGINA
     ------------------------------------------------------------------ */
  marca: {
    nome: "Via Padre Pio",
    assinatura: "Reze, espere e não se preocupe.",

    // Arquivo do logo, dentro da pasta assets/.
    logo: "assets/logo.png",

    chamada: "Pré-venda aberta",
    descricao:
      "Camisetas feitas com devoção e cuidado. Nesta pré-venda você garante a sua peça antes da produção — reserve o modelo, a cor e o tamanho que quiser.",

    // Prazo informado ao cliente. Deixe "" para esconder o aviso.
    prazoEntrega: "Produção e envio em até 20 dias após o fechamento da pré-venda.",

    // Aviso que aparece no topo. Deixe "" para esconder a faixa.
    aviso: "Pré-venda por tempo limitado — garanta a sua antes do lote fechar.",
  },

  /* ------------------------------------------------------------------
     3. CORES (identidade visual)
     ------------------------------------------------------------------
     Troque pelos códigos de cor do Instagram de vocês.
     Use códigos hexadecimais, sempre com # na frente.
     ------------------------------------------------------------------ */
  tema: {
    fundo: "#f4ece3",        // creme do fundo do logo
    superficie: "#fffbf6",   // fundo dos cartões
    tinta: "#2e241c",        // cor do texto
    tintaSuave: "#7a6a5c",   // texto secundário
    marca: "#6b4a1e",        // marrom das letras do logo
    marcaEscura: "#48300f",  // hover de botões
    destaque: "#a9792f",     // dourado dos detalhes
    borda: "#e3d6c5",
  },

  /* ------------------------------------------------------------------
     4. OPÇÕES DE ENTREGA
     ------------------------------------------------------------------
     Apague linhas que não se aplicam. Precisa ter pelo menos uma.
     ------------------------------------------------------------------ */
  entrega: [
    { id: "retirada", nome: "Retirar pessoalmente (combinamos o ponto)" },
    { id: "entrega",  nome: "Entrega em mãos na minha região" },
    { id: "correios", nome: "Enviar pelos Correios (frete à parte)" },
  ],

  /* ------------------------------------------------------------------
     5. PADRÕES DAS CAMISETAS
     ------------------------------------------------------------------
     Valem para todos os modelos que não definirem os seus próprios.
     ------------------------------------------------------------------ */
  padrao: {
    tamanhos: ["PP", "P", "M", "G", "GG", "XGG"],
    cores: [
      { nome: "Preta",   hex: "#1c1c1c" },
      { nome: "Branca",  hex: "#f7f7f5" },
      { nome: "Areia",   hex: "#d8c7ad" },
      { nome: "Marrom",  hex: "#5c3a21" },
    ],
  },

  /* ------------------------------------------------------------------
     6. CAMISETAS DA PRÉ-VENDA
     ------------------------------------------------------------------
     Pode ter de 1 a 10 modelos (ou mais) — a página se ajusta sozinha.
     Para adicionar uma nova, copie um bloco { ... } inteiro, cole abaixo
     e troque os dados. Cada modelo precisa de um "id" diferente.

     Campos de cada modelo:
       id        -> apelido único, sem espaço nem acento. Ex: "fe-01"
       nome      -> nome que aparece no cartão
       descricao -> frase curta sobre a estampa
       preco     -> número puro, use ponto para centavos. Ex: 89.9
       imagem    -> caminho da foto. Coloque o arquivo em assets/camisetas/
       esgotado  -> true esconde o botão e marca como indisponível
       tamanhos  -> (opcional) lista só deste modelo
       cores     -> (opcional) lista só deste modelo
     ------------------------------------------------------------------ */
  produtos: [
    {
      id: "oracao",
      nome: "Camiseta Oração",
      descricao: "Estampa com a oração de Padre Pio nas costas.",
      preco: 89.9,
      imagem: "assets/camisetas/modelo-1.svg",
      esgotado: false,
    },
    {
      id: "estigmas",
      nome: "Camiseta Estigmas",
      descricao: "Arte minimalista em traço sobre o peito.",
      preco: 89.9,
      imagem: "assets/camisetas/modelo-2.svg",
      esgotado: false,
    },
    {
      id: "via-classica",
      nome: "Camiseta Via Clássica",
      descricao: "Logo bordado no peito, caimento oversized.",
      preco: 99.9,
      imagem: "assets/camisetas/modelo-3.svg",
      esgotado: false,
      cores: [
        { nome: "Preta",  hex: "#1c1c1c" },
        { nome: "Branca", hex: "#f7f7f5" },
      ],
    },
  ],
};
