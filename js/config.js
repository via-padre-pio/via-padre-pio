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
    // Número que vai RECEBER os pedidos.
    // Formato: 55 + DDD + número, só dígitos, sem espaço, traço ou parênteses.
    // Exemplo para (11) 91234-5678  ->  "5511912345678"
    // Enquanto estiver vazio, o site avisa o cliente em vez de enviar errado.
    whatsapp: "5511988269898",

    // Como o número aparece escrito na tela para o cliente.
    whatsappVisivel: "(11) 98826-9898",

    email: "padrepiovia@gmail.com",
    instagram: "viapadrepio",

    // Segundo perfil do Instagram, mostrado no rodapé embaixo do primeiro.
    // Deixe "" para não aparecer.
    instagramPadre: "pe.riquemarins",

    cidade: "Barueri - SP",

    // Aparece numa linha discreta no fim do rodapé. Deixe "" para esconder.
    cnpj: "69.747.809/0001-88",
  },

  /* ------------------------------------------------------------------
     1b. NOSSAS INSPIRAÇÕES
     ------------------------------------------------------------------
     Aparecem na coluna do meio do rodapé. Ao clicar no nome, abre uma
     janela com a foto e a história. Para tirar um santo, apague o bloco
     inteiro dele; para acrescentar outro, copie um bloco e cole abaixo.
     ------------------------------------------------------------------ */
  inspiracoes: {
    titulo: "Nossas Inspirações",

    santos: [
      {
        nome: "São Pio de Pietrelcina",
        viveu: "1887 – 1968",
        foto: "assets/santos/sao-pio-de-pietrelcina.jpg",
        historia: [
          "Francesco Forgione nasceu em Pietrelcina, no sul da Itália, numa família de camponeses. Entrou para os frades capuchinhos aos quinze anos e foi ordenado padre em 1910, já convivendo com a saúde frágil que o acompanharia a vida toda.",
          "Em 20 de setembro de 1918, rezando diante do crucifixo em San Giovanni Rotondo, recebeu os estigmas: as cinco chagas de Cristo, que carregou por cinquenta anos. Passava o dia no confessionário, às vezes mais de dez horas seguidas, e ficou conhecido pela firmeza e pela ternura com que recebia cada pessoa.",
          "Fundou a Casa Alívio do Sofrimento, hospital aberto em 1956 para cuidar dos pobres da região, e espalhou pelo mundo os Grupos de Oração. Morreu em 1968 e foi canonizado por João Paulo II em 2002. Dele vem a frase que nos guia: reze, espere e não se preocupe.",
        ],
      },

      {
        nome: "Santa Teresinha do Menino Jesus",
        viveu: "1873 – 1897",
        foto: "assets/santos/santa-teresinha.jpg",
        historia: [
          "Thérèse Martin nasceu em Alençon, na França, caçula de nove irmãos. Perdeu a mãe aos quatro anos e cresceu cercada de afeto pelo pai e pelas irmãs, várias delas também religiosas.",
          "Queria entrar no Carmelo tão cedo que foi pedir autorização ao próprio Papa, numa audiência em Roma. Conseguiu: entrou aos quinze anos, no Carmelo de Lisieux, onde viveu escondida do mundo até morrer de tuberculose aos vinte e quatro.",
          "Deixou o \"pequeno caminho\": a santidade não está em feitos grandiosos, e sim em fazer as coisas pequenas de cada dia com muito amor e confiança. Seus escritos viraram o livro História de uma Alma, lido no mundo inteiro. É padroeira das missões e Doutora da Igreja, e prometeu fazer cair do céu uma chuva de rosas.",
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------
     2. TEXTOS DA PÁGINA
     ------------------------------------------------------------------ */
  marca: {
    nome: "Via Padre Pio",
    assinatura: "Fé que se veste.",

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
