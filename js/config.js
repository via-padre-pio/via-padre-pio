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
     1b. NOSSA ESSÊNCIA
     ------------------------------------------------------------------
     Aparece na coluna do meio do rodapé. Ao clicar no nome, abre uma
     janela com a foto e a história. Para tirar um santo, apague o bloco
     inteiro dele; para acrescentar outro, copie um bloco e cole abaixo.

     O campo "nome" também liga o santo às coleções: toda coleção que
     tiver o mesmo nome em "santo" ganha um atalho para esta janela.
     ------------------------------------------------------------------ */
  inspiracoes: {
    titulo: "Nossa Essência",

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
          "Deixou a \"pequena via\": a santidade não está em feitos grandiosos, e sim em fazer as coisas pequenas de cada dia com muito amor e confiança. Seus escritos viraram o livro História de uma Alma, lido no mundo inteiro. É padroeira das missões e Doutora da Igreja, e prometeu fazer cair do céu uma chuva de rosas.",
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

    chamada: "Pré-venda exclusiva",
    descricao:
      "Peças que carregam significado. Uma coleção criada para vestir a fé de forma simples, elegante e atemporal. Cada peça é criada para unir conforto, qualidade e uma expressão discreta daquilo em que acreditamos.",

    // Prazo informado ao cliente, logo abaixo dos botões da abertura. Deixe
    // "" para esconder. A mesma informação é repetida com outras palavras na
    // dúvida "Qual é o prazo...", dentro do index.html: mudando aqui, confira
    // lá também.
    prazoEntrega:
      "Prazo de produção e envio: até 20 dias após a confirmação do pagamento do pedido.",

    // Aviso que anda no letreiro do topo. Deixe "" para esconder a faixa.
    aviso: "Pré-venda exclusiva • Acesso reservado a convidados Via",
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

     "frete" é quanto a opção custa, em reais, e entra como uma linha a
     mais no total e na cobrança. Deixe 0 nas que não cobram.

     "porEstado: true" troca esse valor fixo pela tabela do item 4b: o
     preço passa a sair do estado que o cliente escolher no formulário.
     ------------------------------------------------------------------ */
  entrega: [
    { id: "retirada", nome: "Retirar pessoalmente (combinamos o ponto)",  frete: 0 },
    { id: "entrega",  nome: "Entrega em mãos (Osasco, Barueri e região)", frete: 0 },
    { id: "correios", nome: "Enviar pelos Correios",                      porEstado: true },
  ],

  /* ------------------------------------------------------------------
     4b. FRETE POR ESTADO
     ------------------------------------------------------------------
     Quanto custa enviar pelos Correios para cada estado, em reais. O
     cliente escolhe o estado no formulário, e o valor entra no total
     antes de ele sair para pagar — nada de surpresa no checkout.

     Quem retira ou recebe em mãos não paga frete, qualquer que seja o
     estado: isso vem do item 4, não daqui.

     Os números abaixo são um ponto de partida por região. Troque pelos
     seus quando tiver a tabela dos Correios na mão — é só mudar o número
     ao lado da sigla. Estado que não estiver aqui sai com frete zero, o
     que na prática é a loja pagando o envio.
     ------------------------------------------------------------------ */
  frete: {
    // Sudeste
    SP: 20, MG: 30, RJ: 30, ES: 30,

    // Sul
    PR: 30, SC: 30, RS: 30,

    // Centro-Oeste
    DF: 40, GO: 40, MT: 40, MS: 40,

    // Nordeste
    BA: 40, SE: 40, AL: 40, PE: 40, PB: 40,
    RN: 40, CE: 40, PI: 40, MA: 40,

    // Norte
    TO: 50, PA: 50, AP: 50, RR: 50, AM: 50, AC: 50, RO: 50,
  },

  /* ------------------------------------------------------------------
     4b. PAGAMENTO (InfinitePay)
     ------------------------------------------------------------------
     O cliente paga no site. Ao finalizar, ele é levado ao checkout da
     InfinitePay, onde escolhe Pix, crédito à vista ou parcelado. Nenhum
     dado de cartão passa por aqui, e o dinheiro cai direto na conta de
     vocês. O WhatsApp deixou de receber pedidos: agora é só atendimento.

     As formas de pagamento e o tratamento das taxas ficam no app da
     InfinitePay, em Vendas > Checkout > Configurações, e não aqui: mudar
     isso pelo site exigiria a chave secreta da conta, e chave secreta não
     pode morar num arquivo que qualquer visitante consegue abrir. O que
     estiver configurado lá vale para o site na hora, sem publicar nada.

     Hoje a conta está com Pix e crédito ligados, e com as taxas
     repassadas ao comprador. Repassando, só o Pix sai pelo valor do
     pedido: o cartão tem acréscimo até mesmo em 1x. Num pedido de
     R$ 509,50, por exemplo, dá R$ 531,84 à vista e R$ 611,40 em 12x.
     ------------------------------------------------------------------ */
  pagamento: {
    // A sua InfiniteTag, sem o $. Enquanto estiver vazia, o site avisa o
    // cliente e manda ele para o WhatsApp, em vez de abrir um pagamento
    // quebrado.
    handle: "via-padrepio",

    // Para onde a InfinitePay traz o cliente depois de pagar. Deixe ""
    // que o site usa o próprio endereço de onde o pedido saiu.
    retorno: "",
  },

  /* ------------------------------------------------------------------
     5. A PRÉ-VENDA INTEIRA
     ------------------------------------------------------------------
     Vale para todas as peças, de todas as coleções.
     ------------------------------------------------------------------ */
  prevenda: {
    // Nesta pré-venda só existe uma cor. Ela não vira um botão de escolha
    // no cartão: aparece escrita no aviso do catálogo e entra sozinha em
    // cada peça do pedido.
    cor: "Off-white",

    // Tamanhos que qualquer pessoa pode reservar pelo site. A tabela de
    // medidas mostra outros além destes, e é de propósito: os maiores saem
    // por encomenda, combinada na conversa.
    tamanhos: ["PP", "P", "M", "G", "GG"],

    // Recado embaixo dos tamanhos no cartão. Deixe "" para esconder.
    avisoTamanhos:
      "Do XG ao G3, sob encomenda: é só combinar com a gente no WhatsApp.",
  },

  /* ------------------------------------------------------------------
     6. MODELOS DE CAMISETA
     ------------------------------------------------------------------
     São os tipos de caimento. Toda coleção é vendida em todos eles, e o
     preço vem daqui — não da coleção.

     Campos:
       id       -> apelido único, sem espaço nem acento. Também é o começo
                   do nome dos arquivos de foto. Ex: "oversized" procura
                   oversized-frente.jpg e oversized-costas.jpg dentro da
                   pasta de cada coleção.
       nome     -> como aparece no cartão
       preco    -> número puro, use ponto para centavos. Ex: 109.9
       medidas  -> qual tabela do item 8 se aplica a este modelo
       tamanhos -> (opcional) lista só deste modelo
       vistas   -> (opcional) as fotos deste modelo. Sem isso, o site
                   procura só a frente e as costas.
     ------------------------------------------------------------------ */
  modelos: [
    {
      id: "oversized",
      nome: "Oversized",
      preco: 109.9,
      medidas: "oversized",
    },
    {
      id: "tradicional-masculina",
      nome: "Tradicional masculina",
      preco: 99.9,
      medidas: "tradicional",
    },
    {
      id: "tradicional-feminina",
      nome: "Tradicional feminina",
      preco: 99.9,
      medidas: "tradicional",
    },
    {
      id: "baby-look",
      nome: "Baby look",
      preco: 89.9,
      medidas: "baby-look",
    },
    {
      id: "infantil",
      nome: "Infantil",
      preco: 74.9,
      medidas: "infantil",
      tamanhos: ["01", "02", "03", "04", "06", "08", "10", "12"],

      // O infantil é o único fotografado duas vezes, em menina e em menino.
      // É a mesma peça: muda só quem está vestindo.
      vistas: [
        { arquivo: "menina-frente", rotulo: "Frente" },
        { arquivo: "menina-costas", rotulo: "Costas" },
        { arquivo: "menino-frente", rotulo: "Frente (menino)" },
        { arquivo: "menino-costas", rotulo: "Costas (menino)" },
      ],
    },
  ],

  /* ------------------------------------------------------------------
     7. COLEÇÕES
     ------------------------------------------------------------------
     Cada coleção vira um bloco do catálogo, com um cartão para cada
     modelo da lista acima. Para acrescentar uma, copie um bloco { ... }
     inteiro, cole abaixo e troque os dados.

     Campos:
       id        -> apelido único, sem espaço nem acento
       nome      -> título que abre o bloco da coleção
       santo     -> nome igual ao do item 1b, para abrir a história ao
                    clicar. Deixe "" se a coleção não tiver santo.
       descricao -> frase curta sobre a estampa
       pasta     -> onde estão as fotos desta coleção
       esgotada  -> true marca a coleção inteira como indisponível
       modelos   -> (opcional) lista de ids do item 6, quando a estampa só
                    saiu em alguns modelos. Sem isso, a coleção aparece em
                    todos — que é o normal.
       nota      -> (opcional) um recado curto no cabeçalho da coleção.
                    Serve para explicar uma coleção mais curta que as
                    outras, por exemplo.

     As fotos seguem sempre o mesmo nome dentro da pasta:
       oversized-frente.jpg          oversized-costas.jpg
       tradicional-masculina-frente.jpg   ...-costas.jpg
       tradicional-feminina-frente.jpg    ...-costas.jpg
       baby-look-frente.jpg          baby-look-costas.jpg
       infantil-menina-frente.jpg    infantil-menina-costas.jpg
       infantil-menino-frente.jpg    infantil-menino-costas.jpg
     ------------------------------------------------------------------ */
  colecoes: [
    {
      id: "nada-e-pequeno",
      nome: "Nada é Pequeno",
      santo: "Santa Teresinha do Menino Jesus",
      descricao:
        "A rosa de Teresinha no peito e, descendo pelas costas, a frase que resume a pequena via: nada é pequeno se feito com amor.",
      pasta: "assets/colecoes/nada-e-pequeno",
      esgotada: false,
    },
    {
      id: "saint-therese",
      nome: "Saint Therese",
      santo: "Santa Teresinha do Menino Jesus",
      descricao:
        "O nome da santa escrito letra a letra ao longo da coluna, fechado pela rosa. A frente fica com o traço discreto no peito.",
      pasta: "assets/colecoes/saint-therese",
      esgotada: false,
    },
    {
      id: "since-1873",
      nome: "Saint Therese Since 1873",
      santo: "Santa Teresinha do Menino Jesus",
      descricao:
        "O ano de nascimento de Teresinha estampado no peito e, nas costas, a rosa inteira em traço aberto.",
      pasta: "assets/colecoes/since-1873",
      esgotada: false,
    },
    {
      id: "padre-pio",
      nome: "Padre Pio",
      santo: "São Pio de Pietrelcina",
      descricao:
        "O rosto do santo em traço contínuo, pequeno no peito. Nas costas, o nome descendo pela coluna em letras espaçadas, aberto por uma cruz.",
      pasta: "assets/colecoes/padre-pio",
      esgotada: false,
    },
    {
      id: "father-pio",
      nome: "Father Pio Since 1887",
      santo: "São Pio de Pietrelcina",
      descricao:
        "O ano de nascimento discreto na frente e, ocupando as costas inteiras, o santo em oração sob a frase que ele repetia a quem o procurava: reze, espere e não se preocupe.",
      pasta: "assets/colecoes/father-pio",
      esgotada: false,
    },
    {
      id: "amai-nossa-senhora",
      nome: "Amai Nossa Senhora",
      santo: "São Pio de Pietrelcina",
      descricao:
        "A frase de Padre Pio em manuscrito, no lado do peito, com a assinatura dele embaixo. As costas ficam limpas.",
      pasta: "assets/colecoes/amai-nossa-senhora",
      esgotada: false,

      // Esta estampa existe só no oversized. Se um dia sair nos outros
      // modelos, é só apagar estas duas linhas e acrescentar as fotos.
      modelos: ["oversized"],
      nota: "Esta estampa sai apenas no modelo oversized.",
    },
  ],

  /* ------------------------------------------------------------------
     8. TABELAS DE MEDIDAS
     ------------------------------------------------------------------
     Abrem numa janela quando o cliente toca em "Tabela de medidas".
     Os números são em centímetros e seguem a ordem de "linhas".
     ------------------------------------------------------------------ */
  medidas: {
    linhas: [
      "Comprimento",
      "Tórax",
      "Cintura",
      "Barra",
      "Ombro",
      "Comp. manga",
      "Boca manga",
    ],

    tabelas: {
      tradicional: {
        nome: "Tradicional",
        tamanhos: ["PP", "P", "M", "G", "GG", "XG", "XGG", "G1", "G2", "G3"],
        valores: [
          [72, 73, 74, 76, 78, 80, 82, 84, 86, 88],
          [48, 50, 52, 54, 56, 58, 60, 62, 64, 66],
          [48, 50, 52, 54, 56, 58, 60, 62, 64, 66],
          [49, 51, 53, 55, 57, 59, 61, 63, 65, 67],
          [13, 13.5, 14, 14.5, 15, 16, 17, 18, 19, 20],
          [19, 19.5, 20, 21, 22, 23, 24, 25, 26, 27],
          [16, 16.5, 17, 17.5, 18, 18.5, 19, 19.5, 20, 20.5],
        ],
      },

      oversized: {
        nome: "Oversized",
        tamanhos: ["PP", "P", "M", "G", "GG", "XG", "XGG", "G1", "G2", "G3"],
        valores: [
          [70, 72.5, 75, 77.5, 80, 82.5, 85, 87.5, 90, 92.5],
          [54, 56, 58, 60, 62, 66, 70, 74, 78, 82],
          [54, 56, 58, 60, 62, 66, 70, 74, 78, 82],
          [54, 56, 58, 60, 62, 66, 70, 74, 78, 82],
          [15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
          [19, 21, 23, 25, 27, 29, 31, 33, 35, 37],
          [18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
        ],
      },

      "baby-look": {
        nome: "Baby look",
        tamanhos: ["PP", "P", "M", "G", "GG", "XG", "XGG", "G1", "G2", "G3"],
        valores: [
          [59, 61, 63, 65, 67.5, 70, 72.5, 74, 75.5, 77],
          [44, 46, 48, 50, 53, 56, 59, 61, 63, 65],
          [42, 44, 46, 48, 51, 54, 57, 59, 61, 63],
          [44, 46, 48, 50, 53, 56, 59, 61, 63, 65],
          [8, 9, 10, 11, 12, 13, 14, 16, 16.5, 17],
          [14, 15, 16, 17, 18, 19, 20, 21, 21.5, 22],
          [14, 14.5, 15, 15.5, 16, 16.5, 17, 19, 19.5, 20],
        ],
      },

      infantil: {
        nome: "Infantil",
        tamanhos: ["01", "02", "03", "04", "06", "08", "10", "12"],
        valores: [
          [39, 41, 43, 45, 47.5, 50, 52.5, 54],
          [27, 29, 31, 33, 35, 37, 39, 41],
          [27, 29, 31, 33, 35, 37, 39, 41],
          [27, 29, 31, 33, 35, 37, 39, 41],
          [6, 6.5, 7, 8, 8.5, 9, 9.5, 9.5],
          [9.5, 10, 10.5, 11, 12, 13, 14, 18],
          [9.5, 10, 10.5, 11, 12, 13, 14, 18],
        ],
      },
    },
  },
};
