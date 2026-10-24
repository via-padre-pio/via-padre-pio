/* ==========================================================================
   Via Padre Pio — lógica da pré-venda
   --------------------------------------------------------------------------
   Monta o catálogo a partir de js/config.js, controla o carrinho e gera
   o link do WhatsApp com o pedido já escrito.
   Não é preciso editar este arquivo para mudar produtos, cores ou contato.
   ========================================================================== */

(function () {
  "use strict";

  const CHAVE_ARMAZENAMENTO = "viapadrepio:pedido:v1";
  const LIMITE_POR_ITEM = 20;

  /** Itens do pedido: { chave, colecaoId, modeloId, nome, modeloNome, preco,
      cor, tamanho, imagem, quantidade } */
  let pedido = [];

  /** Etapa visível no painel: "itens" (lista) ou "dados" (formulário). */
  let etapa = "itens";

  const el = (id) => document.getElementById(id);

  const elementos = {
    faixaAviso: el("faixaAviso"),
    textoAviso: el("textoAviso"),
    trilhoAviso: el("trilhoAviso"),
    marcaNome: el("marcaNome"),
    marcaAssinatura: el("marcaAssinatura"),
    linkInstagram: el("linkInstagram"),
    botaoCarrinho: el("botaoCarrinho"),
    contadorCarrinho: el("contadorCarrinho"),
    marcaChamada: el("marcaChamada"),
    capaLogo: el("capaLogo"),
    marcaDescricao: el("marcaDescricao"),
    marcaLema: el("marcaLema"),
    marcaPrazo: el("marcaPrazo"),
    gradeProdutos: el("gradeProdutos"),
    barraCatalogo: el("barraCatalogo"),
    contagemProdutos: el("contagemProdutos"),
    resumoPedido: el("resumoPedido"),
    formulario: el("formularioPedido"),
    selectEntrega: el("entrega"),
    textoBotaoEnviar: el("textoBotaoEnviar"),
    erroGeral: el("erroGeral"),
    rodapeLogo: el("rodapeLogo"),
    rodapeNome: el("rodapeNome"),
    rodapeCidade: el("rodapeCidade"),
    rodapeWhatsapp: el("rodapeWhatsapp"),
    rodapeEmail: el("rodapeEmail"),
    rodapeInstagram: el("rodapeInstagram"),
    rodapeInstagramPadre: el("rodapeInstagramPadre"),
    rodapeCnpj: el("rodapeCnpj"),
    colunaInspiracoes: el("colunaInspiracoes"),
    tituloInspiracoes: el("tituloInspiracoes"),
    listaSantos: el("listaSantos"),
    janelaSanto: el("janelaSanto"),
    fecharSanto: el("fecharSanto"),
    santoFoto: el("santoFoto"),
    santoNome: el("santoNome"),
    santoViveu: el("santoViveu"),
    santoHistoria: el("santoHistoria"),
    janelaMedidas: el("janelaMedidas"),
    fecharMedidas: el("fecharMedidas"),
    abasMedidas: el("abasMedidas"),
    corpoMedidas: el("corpoMedidas"),
    janelaPagamento: el("janelaPagamento"),
    fecharPagamento: el("fecharPagamento"),
    pagamentoSelo: el("pagamentoSelo"),
    pagamentoTitulo: el("pagamentoTitulo"),
    pagamentoTexto: el("pagamentoTexto"),
    pagamentoDados: el("pagamentoDados"),
    pagamentoParcelas: el("pagamentoParcelas"),
    pagamentoItens: el("pagamentoItens"),
    pagamentoSac: el("pagamentoSac"),
    pagamentoSacTexto: el("pagamentoSacTexto"),
    pagamentoEnviarComprovante: el("pagamentoEnviarComprovante"),
    pagamentoComprovante: el("pagamentoComprovante"),
    sacCarrinho: el("sacCarrinho"),
    fundoEscuro: el("fundoEscuro"),
    painelCarrinho: el("painelCarrinho"),
    tituloPainel: el("tituloPainel"),
    voltarItens: el("voltarItens"),
    fecharCarrinho: el("fecharCarrinho"),
    corpoCarrinho: el("corpoCarrinho"),
    etapaItens: el("etapaItens"),
    etapaDados: el("etapaDados"),
    itensCarrinho: el("itensCarrinho"),
    rodapeCarrinho: el("rodapeCarrinho"),
    totalCarrinho: el("totalCarrinho"),
    irParaPedido: el("irParaPedido"),
    avisoFlutuante: el("avisoFlutuante"),
  };

  /* ====================================================================
     Utilidades
     ==================================================================== */

  const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const emReais = (valor) => formatadorMoeda.format(valor);

  const soDigitos = (texto) => String(texto || "").replace(/\D/g, "");

  /** Aplica a máscara (11) 91234-5678 enquanto a pessoa digita. */
  function mascaraTelefone(valor) {
    const d = soDigitos(valor).slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  let tempoAviso;
  function avisar(mensagem) {
    const caixa = elementos.avisoFlutuante;
    caixa.textContent = mensagem;
    caixa.hidden = false;
    requestAnimationFrame(() => caixa.setAttribute("data-visivel", "true"));
    clearTimeout(tempoAviso);
    tempoAviso = setTimeout(() => {
      caixa.removeAttribute("data-visivel");
      setTimeout(() => { caixa.hidden = true; }, 200);
    }, 2600);
  }

  /* ====================================================================
     Tema e textos vindos da configuração
     ==================================================================== */

  function aplicarTema() {
    const mapa = {
      fundo: "--fundo",
      superficie: "--superficie",
      tinta: "--tinta",
      tintaSuave: "--tinta-suave",
      marca: "--marca",
      marcaEscura: "--marca-escura",
      destaque: "--destaque",
      borda: "--borda",
    };
    const tema = CONFIG.tema || {};
    Object.keys(mapa).forEach((chave) => {
      if (tema[chave]) {
        document.documentElement.style.setProperty(mapa[chave], tema[chave]);
      }
    });
    if (tema.marca) {
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", tema.marca);
    }
  }

  function aplicarTextos() {
    const { marca, contato } = CONFIG;

    document.title = `${marca.nome} — Pré-venda de Camisetas`;
    elementos.marcaNome.textContent = marca.nome;
    elementos.marcaAssinatura.textContent = marca.assinatura || "";
    elementos.marcaChamada.textContent = marca.chamada || "Pré-venda";
    elementos.marcaDescricao.textContent = marca.descricao || "";

    // A abertura fecha com a mesma assinatura do cabeçalho.
    elementos.marcaLema.textContent = marca.assinatura || "";

    // O logo da capa é opcional: tirar a imagem do HTML não pode derrubar o
    // restante da página, como acontecia com o antigo logo do cabeçalho.
    if (elementos.capaLogo) {
      elementos.capaLogo.alt = marca.nome;
      if (marca.logo) elementos.capaLogo.src = marca.logo;
    }

    elementos.rodapeNome.textContent = marca.nome;
    elementos.rodapeCidade.textContent = contato.cidade || "";

    // Mesmo cuidado do logo da capa: sem imagem, o rodapé segue inteiro.
    if (elementos.rodapeLogo) {
      if (marca.logo) {
        elementos.rodapeLogo.src = marca.logo;
        elementos.rodapeLogo.alt = "";
      } else {
        elementos.rodapeLogo.hidden = true;
      }
    }
    if (marca.aviso) {
      elementos.textoAviso.textContent = marca.aviso;
      elementos.faixaAviso.hidden = false;
      // Só dá para medir o texto depois que a faixa aparece.
      montarLetreiro(marca.aviso);
    }

    if (marca.prazoEntrega) {
      elementos.marcaPrazo.textContent = marca.prazoEntrega;
      elementos.marcaPrazo.hidden = false;
    }

    if (contato.instagram) {
      const url = `https://instagram.com/${contato.instagram}`;
      elementos.linkInstagram.href = url;
      elementos.rodapeInstagram.href = url;
      elementos.rodapeInstagram.textContent = `@${contato.instagram}`;
    }

    if (contato.instagramPadre) {
      elementos.rodapeInstagramPadre.href = `https://instagram.com/${contato.instagramPadre}`;
      elementos.rodapeInstagramPadre.textContent = `@${contato.instagramPadre}`;
      elementos.rodapeInstagramPadre.hidden = false;
    } else {
      elementos.rodapeInstagramPadre.remove();
    }

    if (contato.whatsapp) {
      elementos.rodapeWhatsapp.href = linkDoAtendimento();
      elementos.rodapeWhatsapp.textContent =
        contato.whatsappVisivel || "Falar no WhatsApp";

      // O mesmo número, dentro do painel: ali a pessoa está decidindo a
      // compra, e é onde a dúvida costuma aparecer.
      elementos.sacCarrinho.href = linkDoAtendimento(
        `Olá! Estou montando um pedido no site da pré-venda ${CONFIG.marca.nome} e tenho uma dúvida.`
      );
    } else {
      elementos.sacCarrinho.hidden = true;
      // Sai do DOM em vez de ficar escondido: assim o CSS do rodapé consegue
      // mirar no primeiro contato que realmente aparece.
      elementos.rodapeWhatsapp.remove();
    }

    if (contato.email) {
      elementos.rodapeEmail.href = `mailto:${contato.email}`;
      elementos.rodapeEmail.textContent = contato.email;
    } else {
      elementos.rodapeEmail.remove();
    }

    if (contato.cnpj) {
      elementos.rodapeCnpj.textContent = `CNPJ ${contato.cnpj}`;
      elementos.rodapeCnpj.hidden = false;
    }

    const opcoes = CONFIG.entrega || [];
    elementos.selectEntrega.innerHTML =
      '<option value="">Selecione…</option>' +
      opcoes
        .map((o) => `<option value="${o.id}">${escapar(o.nome)}</option>`)
        .join("");
  }

  /**
   * Enche a faixa com cópias do aviso. São duas metades iguais, cada uma
   * larga o bastante para cobrir a tela: é isso que faz o letreiro voltar
   * ao início sem deixar um vão vazio passando.
   */
  function montarLetreiro(texto) {
    const trilho = elementos.trilhoAviso;
    if (!trilho) return;

    const copia = () => {
      const span = document.createElement("span");
      span.textContent = texto;
      return span;
    };

    trilho.replaceChildren(copia());
    const largura = trilho.firstElementChild.getBoundingClientRect().width;
    if (!largura) return;

    // Usa a tela inteira, e não só a janela, para a faixa continuar cheia
    // se a pessoa maximizar o navegador depois.
    const alvo = Math.max(window.innerWidth, screen.width || 0);
    const quantas = Math.ceil(alvo / largura) + 1;

    const metade = [];
    for (let i = 0; i < quantas; i += 1) metade.push(copia());

    trilho.replaceChildren(
      ...metade,
      ...metade.map((span) => span.cloneNode(true))
    );
  }

  function escapar(texto) {
    return String(texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ====================================================================
     Catálogo
     ==================================================================== */

  const modelos = () => CONFIG.modelos || [];

  const acharModelo = (id) => modelos().find((m) => m.id === id);

  const acharColecao = (id) => (CONFIG.colecoes || []).find((c) => c.id === id);

  /**
   * Os modelos de uma coleção. Em geral são todos, mas uma coleção pode
   * trazer uma lista própria em "modelos" quando a estampa saiu só em
   * algumas peças.
   */
  function modelosDaColecao(colecao) {
    if (!colecao.modelos || !colecao.modelos.length) return modelos();
    return colecao.modelos.map(acharModelo).filter(Boolean);
  }

  function tamanhosDoModelo(modelo) {
    return modelo.tamanhos && modelo.tamanhos.length
      ? modelo.tamanhos
      : CONFIG.prevenda.tamanhos;
  }

  /**
   * As fotos de um modelo dentro de uma coleção. Por padrão são duas, frente
   * e costas; um modelo pode declarar outras em "vistas" (o infantil tem
   * quatro, porque foi fotografado em menina e em menino).
   */
  function vistasDoModelo(colecao, modelo) {
    const padrao = [
      { arquivo: "frente", rotulo: "Frente" },
      { arquivo: "costas", rotulo: "Costas" },
    ];
    return (modelo.vistas || padrao).map((vista) => ({
      rotulo: vista.rotulo,
      src: `${colecao.pasta}/${modelo.id}-${vista.arquivo}.jpg`,
    }));
  }

  function montarCatalogo() {
    const colecoes = CONFIG.colecoes || [];

    if (!colecoes.length || !modelos().length) {
      elementos.gradeProdutos.innerHTML =
        '<p class="resumo__vazio">As coleções desta pré-venda serão anunciadas em breve. Acompanhe o nosso Instagram.</p>';
      return;
    }

    colecoes.forEach((colecao) => {
      elementos.gradeProdutos.appendChild(criarBlocoColecao(colecao));
    });

    // A barra conta peças, não coleções: é o número de cartões que a pessoa
    // encontra rolando a página.
    const pecas = colecoes
      .filter((c) => !c.esgotada)
      .reduce((soma, colecao) => soma + modelosDaColecao(colecao).length, 0);
    const quantasColecoes =
      colecoes.length === 1 ? "1 coleção" : `${colecoes.length} coleções`;
    elementos.contagemProdutos.textContent = `${pecas} peças em ${quantasColecoes}`;
    elementos.barraCatalogo.hidden = false;
  }

  /* ====================================================================
     Nossas inspirações: a coluna do meio do rodapé
     ==================================================================== */

  function montarInspiracoes() {
    const bloco = CONFIG.inspiracoes || {};
    const santos = bloco.santos || [];
    if (!santos.length) return;

    elementos.tituloInspiracoes.textContent =
      bloco.titulo || "Nossa Essência";

    santos.forEach((santo, indice) => {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "rodape__santo";
      botao.textContent = santo.nome;
      botao.addEventListener("click", () => abrirSanto(indice));
      elementos.listaSantos.appendChild(botao);
    });

    elementos.colunaInspiracoes.hidden = false;
  }

  function abrirSanto(indice) {
    const santo = (CONFIG.inspiracoes.santos || [])[indice];
    if (!santo) return;

    elementos.santoNome.textContent = santo.nome;
    elementos.santoViveu.textContent = santo.viveu || "";
    elementos.santoViveu.hidden = !santo.viveu;

    // A foto é ilustrativa e o nome já está no título ao lado: um alt
    // repetindo tudo só faria o leitor de tela dizer a mesma coisa duas vezes.
    elementos.santoFoto.src = santo.foto || "";
    elementos.santoFoto.alt = "";
    elementos.santoFoto.hidden = !santo.foto;

    const paragrafos = Array.isArray(santo.historia)
      ? santo.historia
      : [santo.historia || ""];

    elementos.santoHistoria.innerHTML = paragrafos
      .filter(Boolean)
      .map((p) => `<p>${escapar(p)}</p>`)
      .join("");

    elementos.janelaSanto.showModal();
  }

  function abrirSantoPorNome(nome) {
    const indice = (CONFIG.inspiracoes.santos || []).findIndex(
      (s) => s.nome === nome
    );
    if (indice >= 0) abrirSanto(indice);
  }

  /* ====================================================================
     Tabela de medidas
     ==================================================================== */

  /** Escreve 13,5 em vez de 13.5, como manda o português. */
  const emCentimetros = (valor) => String(valor).replace(".", ",");

  function montarMedidas() {
    const bloco = CONFIG.medidas || {};
    const tabelas = bloco.tabelas || {};
    const chaves = Object.keys(tabelas);
    if (!chaves.length) return;

    elementos.abasMedidas.innerHTML = chaves
      .map(
        (chave, i) => `
        <button type="button" class="janela-medidas__aba" role="tab"
                data-tabela="${escapar(chave)}"
                aria-selected="${i === 0}">${escapar(tabelas[chave].nome)}</button>`
      )
      .join("");

    elementos.corpoMedidas.innerHTML = chaves
      .map((chave, i) => {
        const tabela = tabelas[chave];
        return `
        <div class="janela-medidas__painel" data-tabela="${escapar(chave)}" ${i === 0 ? "" : "hidden"}>
          <table class="tabela-medidas">
            <caption class="so-leitor">Medidas do modelo ${escapar(tabela.nome)}, em centímetros</caption>
            <thead>
              <tr>
                <th scope="col">Medidas (cm)</th>
                ${tabela.tamanhos
                  .map((t) => `<th scope="col">${escapar(t)}</th>`)
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${(bloco.linhas || [])
                .map(
                  (linha, l) => `
                <tr>
                  <th scope="row">${escapar(linha)}</th>
                  ${(tabela.valores[l] || [])
                    .map((v) => `<td>${emCentimetros(v)}</td>`)
                    .join("")}
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>`;
      })
      .join("");

    elementos.abasMedidas.addEventListener("click", (evento) => {
      const aba = evento.target.closest("[data-tabela]");
      if (aba) mostrarTabela(aba.dataset.tabela);
    });
  }

  function mostrarTabela(chave) {
    elementos.abasMedidas.querySelectorAll("[data-tabela]").forEach((aba) =>
      aba.setAttribute("aria-selected", String(aba.dataset.tabela === chave))
    );
    elementos.corpoMedidas.querySelectorAll("[data-tabela]").forEach((painel) => {
      painel.hidden = painel.dataset.tabela !== chave;
    });
  }

  /**
   * Abre a janela já na tabela certa: cada cartão diz de qual modelo ele é.
   * O botão da dúvida frequente não está dentro de cartão nenhum, então a
   * janela abre na primeira aba.
   */
  function abrirMedidas(origem) {
    const cartao = origem.closest(".produto");
    if (cartao?.dataset.medidas) mostrarTabela(cartao.dataset.medidas);

    elementos.janelaMedidas.showModal();
  }

  /** Recolhe as opções de todos os cartões, menos o que for passado. */
  function fecharCartoes(excecao) {
    elementos.gradeProdutos
      .querySelectorAll(".produto--aberto")
      .forEach((cartao) => {
        if (cartao === excecao) return;
        cartao.classList.remove("produto--aberto");
        const botao = cartao.querySelector(".produto__escolher");
        if (botao) {
          botao.setAttribute("aria-expanded", "false");
          botao.textContent = "Escolher";
        }
      });
  }

  /**
   * Uma coleção: o cabeçalho com o nome, o santo e a história da estampa, e
   * embaixo um cartão para cada modelo. Tudo o que vale para a coleção
   * inteira fica no cabeçalho, em vez de se repetir em cada cartão.
   */
  function criarBlocoColecao(colecao) {
    const bloco = document.createElement("section");
    bloco.className = "colecao";
    bloco.id = `colecao-${colecao.id}`;

    bloco.innerHTML = `
      <header class="colecao__cabecalho">
        <h3 class="colecao__nome">${escapar(colecao.nome)}</h3>
        ${colecao.esgotada ? '<span class="selo-esgotado selo-esgotado--solto">Esgotado</span>' : ""}
        ${colecao.santo
          ? `<button type="button" class="colecao__santo" data-santo="${escapar(colecao.santo)}">
               ${escapar(colecao.santo)}
             </button>`
          : ""}
        ${colecao.descricao
          ? `<p class="colecao__descricao">${escapar(colecao.descricao)}</p>`
          : ""}
        ${colecao.nota
          ? `<p class="colecao__nota">${escapar(colecao.nota)}</p>`
          : ""}
      </header>
      <div class="grade-produtos"></div>`;

    const grade = bloco.querySelector(".grade-produtos");
    modelosDaColecao(colecao).forEach((modelo) => {
      grade.appendChild(criarCartaoCamiseta(colecao, modelo));
    });

    return bloco;
  }

  /**
   * Um cartão por camiseta: a estampa da coleção num caimento só. O preço
   * já é o dela, e a única escolha que resta é o tamanho.
   */
  function criarCartaoCamiseta(colecao, modelo) {
    const cartao = document.createElement("article");
    cartao.className =
      "produto" + (colecao.esgotada ? " produto--esgotado" : "");

    // De qual tabela de medidas este cartão fala, para a janela abrir na
    // aba certa.
    cartao.dataset.medidas = modelo.medidas || "";

    const idTam = `tam-${colecao.id}-${modelo.id}`;
    const idDetalhes = `detalhes-${colecao.id}-${modelo.id}`;

    const vistas = vistasDoModelo(colecao, modelo);
    let vistaAtual = 0;

    const legenda = (vista) =>
      `Camiseta ${colecao.nome}, modelo ${modelo.nome.toLowerCase()}, ${vista.rotulo.toLowerCase()}`;

    // O recado sobre encomendar tamanhos maiores só vale para quem usa a
    // grade de adulto: no infantil, que tem a sua própria, não faz sentido.
    const nota = modelo.tamanhos ? "" : CONFIG.prevenda.avisoTamanhos || "";

    cartao.innerHTML = `
      <figure class="produto__figura">
        <img class="produto__foto" src="${escapar(vistas[0].src)}"
             alt="${escapar(legenda(vistas[0]))}" loading="lazy">
        ${colecao.esgotada ? '<span class="selo-esgotado">Esgotado</span>' : ""}
        <div class="produto__vistas" role="group" aria-label="Fotos da peça"></div>
      </figure>

      <div class="produto__corpo">
        <div class="produto__topo">
          <h4 class="produto__nome">${escapar(modelo.nome)}</h4>
          <span class="produto__preco">${emReais(modelo.preco)}</span>
        </div>

        ${colecao.esgotada ? "" : `
        <button type="button" class="produto__escolher"
                aria-expanded="false" aria-controls="${idDetalhes}">Escolher</button>

        <div class="produto__detalhes" id="${idDetalhes}">
          <div class="opcao">
            <span class="opcao__rotulo" id="${idTam}">Tamanho</span>
            <div class="lista-opcoes" role="group" aria-labelledby="${idTam}" data-grupo="tamanho">
              ${tamanhosDoModelo(modelo).map((t) => `
                <button type="button" class="botao-tamanho" data-valor="${escapar(t)}"
                        aria-pressed="false">${escapar(t)}</button>`).join("")}
            </div>
            ${nota ? `<p class="opcao__nota">${escapar(nota)}</p>` : ""}
            <button type="button" class="link-texto" data-abrir-medidas>Tabela de medidas</button>
          </div>

          <p class="produto__faltou" role="alert" hidden></p>

          <div class="produto__rodape">
            <div class="quantidade">
              <button type="button" data-passo="-1" aria-label="Diminuir quantidade">−</button>
              <output aria-live="polite">1</output>
              <button type="button" data-passo="1" aria-label="Aumentar quantidade">+</button>
            </div>
            <button type="button" class="botao botao--principal" data-acao="adicionar">
              Adicionar
            </button>
          </div>
        </div>`}
      </div>`;

    const foto = cartao.querySelector(".produto__foto");
    const tiras = cartao.querySelector(".produto__vistas");

    /** Redesenha os botõezinhos de frente/costas e troca a foto grande. */
    function mostrarVistas() {
      foto.src = vistas[vistaAtual].src;
      foto.alt = legenda(vistas[vistaAtual]);

      tiras.innerHTML = vistas
        .map(
          (vista, i) => `
          <button type="button" class="produto__vista" data-vista="${i}"
                  aria-pressed="${i === vistaAtual}">
            <img src="${escapar(vista.src)}" alt="" loading="lazy">
            <span class="so-leitor">${escapar(vista.rotulo)}</span>
          </button>`
        )
        .join("");
    }

    mostrarVistas();

    tiras.addEventListener("click", (evento) => {
      const botao = evento.target.closest("[data-vista]");
      if (!botao) return;
      vistaAtual = Number(botao.dataset.vista);
      mostrarVistas();
    });

    if (colecao.esgotada) return cartao;

    const listaTamanhos = cartao.querySelector('[data-grupo="tamanho"]');
    const faltou = cartao.querySelector(".produto__faltou");

    // O cartão mostra só foto, nome e preço; este botão é que traz as
    // opções. Um cartão aberto por vez, para a grade não virar uma coluna
    // de cartões gigantes.
    const escolher = cartao.querySelector(".produto__escolher");
    escolher.addEventListener("click", () => {
      const abrindo = !cartao.classList.contains("produto--aberto");
      fecharCartoes(cartao);
      cartao.classList.toggle("produto--aberto", abrindo);
      escolher.setAttribute("aria-expanded", String(abrindo));
      escolher.textContent = abrindo ? "Fechar" : "Escolher";
    });

    listaTamanhos.addEventListener("click", (evento) => {
      const botao = evento.target.closest("button[data-valor]");
      if (!botao) return;
      listaTamanhos
        .querySelectorAll("button")
        .forEach((b) => b.setAttribute("aria-pressed", String(b === botao)));
      faltou.hidden = true;
    });

    const saida = cartao.querySelector(".quantidade output");
    cartao.querySelectorAll(".quantidade button").forEach((botao) => {
      botao.addEventListener("click", () => {
        const passo = Number(botao.dataset.passo);
        const atual = Number(saida.textContent);
        saida.textContent = String(
          Math.min(LIMITE_POR_ITEM, Math.max(1, atual + passo))
        );
      });
    });

    cartao
      .querySelector('[data-acao="adicionar"]')
      .addEventListener("click", () => {
        // Nenhum tamanho vem marcado de antemão: um padrão silencioso
        // viraria pedido errado.
        const tamanho = listaTamanhos.querySelector('[aria-pressed="true"]');
        if (!tamanho) return pedir("Escolha o tamanho.");

        adicionarAoPedido({
          colecaoId: colecao.id,
          modeloId: modelo.id,
          nome: colecao.nome,
          modeloNome: modelo.nome,
          preco: modelo.preco,
          imagem: vistas[vistaAtual].src,
          cor: CONFIG.prevenda.cor,
          tamanho: tamanho.dataset.valor,
          quantidade: Number(saida.textContent),
        });

        saida.textContent = "1";
      });

    function pedir(mensagem) {
      faltou.textContent = mensagem;
      faltou.hidden = false;
    }

    return cartao;
  }

  /* ====================================================================
     Carrinho
     ==================================================================== */

  function adicionarAoPedido(item) {
    const chave = `${item.colecaoId}|${item.modeloId}|${item.tamanho}`;
    const existente = pedido.find((i) => i.chave === chave);

    if (existente) {
      existente.quantidade = Math.min(
        LIMITE_POR_ITEM,
        existente.quantidade + item.quantidade
      );
    } else {
      pedido.push({ chave, ...item });
    }

    salvar();
    desenharTudo();
    avisar(`${item.nome} ${item.modeloNome} (${item.tamanho}) no pedido`);
  }

  function alterarQuantidade(chave, passo) {
    const item = pedido.find((i) => i.chave === chave);
    if (!item) return;

    item.quantidade += passo;
    if (item.quantidade < 1) {
      pedido = pedido.filter((i) => i.chave !== chave);
    } else {
      item.quantidade = Math.min(LIMITE_POR_ITEM, item.quantidade);
    }

    salvar();
    desenharTudo();
  }

  function removerItem(chave) {
    pedido = pedido.filter((i) => i.chave !== chave);
    salvar();
    desenharTudo();
    avisar("Item removido do pedido");
  }

  const totalItens = () => pedido.reduce((s, i) => s + i.quantidade, 0);
  const totalValor = () => pedido.reduce((s, i) => s + i.preco * i.quantidade, 0);

  function salvar() {
    try {
      localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(pedido));
    } catch (e) {
      /* navegação privada pode bloquear; o pedido segue válido na sessão */
    }
  }

  function carregar() {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE_ARMAZENAMENTO) || "[]");
      if (!Array.isArray(salvo)) return;

      // O pedido fica guardado no navegador e pode ser de semanas atrás.
      // Antes de mostrar, confere se a coleção e o modelo ainda existem e
      // relê o preço da configuração de hoje.
      pedido = salvo
        .map((item) => {
          const colecao = acharColecao(item.colecaoId);
          const modelo = acharModelo(item.modeloId);
          if (!colecao || colecao.esgotada || !modelo) return null;

          return {
            ...item,
            nome: colecao.nome,
            modeloNome: modelo.nome,
            preco: modelo.preco,
            cor: CONFIG.prevenda.cor,
            quantidade: Math.min(
              LIMITE_POR_ITEM,
              Math.max(1, Number(item.quantidade) || 1)
            ),
          };
        })
        .filter(Boolean);
    } catch (e) {
      pedido = [];
    }
  }

  /* ====================================================================
     Desenho da tela
     ==================================================================== */

  function desenharTudo() {
    desenharContador();
    desenharPainel();
    desenharResumo();

    // O valor vai escrito no botão: ninguém deve descobrir quanto vai
    // pagar só depois de sair do site.
    elementos.textoBotaoEnviar.textContent = rotuloDoPagamento();

    // Esvaziar o pedido pelo formulário deixaria a etapa de dados sem sentido.
    if (!pedido.length && etapa === "dados") mostrarEtapa("itens");
  }

  function desenharContador() {
    const n = totalItens();
    elementos.contadorCarrinho.textContent = String(n);
    elementos.contadorCarrinho.hidden = n === 0;
    elementos.botaoCarrinho.classList.toggle("botao-carrinho--cheio", n > 0);

    // Em telas estreitas o texto do botão fica escondido; o rótulo garante
    // que leitores de tela continuem anunciando o pedido por extenso.
    elementos.botaoCarrinho.setAttribute(
      "aria-label",
      n === 0
        ? "Meus pedidos, vazio"
        : `Meus pedidos, ${n} ${n === 1 ? "peça" : "peças"}`
    );
  }

  function desenharPainel() {
    const corpo = elementos.itensCarrinho;

    if (!pedido.length) {
      corpo.innerHTML =
        '<p class="painel__vazio">Seu pedido ainda está vazio.<br>Escolha um modelo no catálogo para começar.</p>';
      elementos.totalCarrinho.textContent = emReais(0);
      elementos.irParaPedido.disabled = true;
      return;
    }

    elementos.irParaPedido.disabled = false;
    corpo.innerHTML = pedido
      .map(
        (item) => `
        <div class="item-carrinho">
          <img class="item-carrinho__imagem" src="${escapar(item.imagem)}" alt="" loading="lazy">
          <div class="item-carrinho__dados">
            <p class="item-carrinho__nome">${escapar(item.nome)}</p>
            <p class="item-carrinho__detalhe">${escapar(item.modeloNome)} · Tamanho ${escapar(item.tamanho)}</p>
            <div class="item-carrinho__linha">
              <div class="quantidade quantidade--pequena">
                <button type="button" data-chave="${escapar(item.chave)}" data-passo="-1" aria-label="Diminuir quantidade de ${escapar(item.nome)}">−</button>
                <output>${item.quantidade}</output>
                <button type="button" data-chave="${escapar(item.chave)}" data-passo="1" aria-label="Aumentar quantidade de ${escapar(item.nome)}">+</button>
              </div>
              <span class="item-carrinho__preco">${emReais(item.preco * item.quantidade)}</span>
            </div>
            <button type="button" class="botao-remover" data-remover="${escapar(item.chave)}">Remover</button>
          </div>
        </div>`
      )
      .join("");

    elementos.totalCarrinho.textContent = emReais(totalValor());
  }

  function desenharResumo() {
    const caixa = elementos.resumoPedido;

    if (!pedido.length) {
      caixa.innerHTML =
        '<p class="resumo__vazio">Nenhum item selecionado ainda. <a href="#catalogo">Escolher uma camiseta</a>.</p>';
      return;
    }

    caixa.innerHTML = `
      <ul class="resumo__lista">
        ${pedido
          .map(
            (item) => `
          <li class="resumo__item">
            <span>
              ${item.quantidade}× ${escapar(item.nome)}
              <small>${escapar(item.modeloNome)} · Tamanho ${escapar(item.tamanho)}</small>
            </span>
            <strong>${emReais(item.preco * item.quantidade)}</strong>
          </li>`
          )
          .join("")}
      </ul>
      <div class="resumo__total">
        <span>Total</span>
        <strong>${emReais(totalValor())}</strong>
      </div>`;
  }

  /* ====================================================================
     Painel lateral
     ==================================================================== */

  /**
   * Alterna entre a lista de itens e o formulário, ambos dentro do painel.
   * O rodapé com o total só existe na etapa dos itens: na de dados quem
   * conclui é o botão de pagar, dentro do próprio formulário.
   */
  function mostrarEtapa(nova) {
    etapa = nova;
    const emDados = nova === "dados";

    elementos.etapaItens.hidden = emDados;
    elementos.etapaDados.hidden = !emDados;
    elementos.rodapeCarrinho.hidden = emDados;
    elementos.voltarItens.hidden = !emDados;
    elementos.tituloPainel.textContent = emDados
      ? "Finalizar pedido"
      : "Seu pedido";
    elementos.corpoCarrinho.scrollTop = 0;
  }

  function abrirPainel() {
    mostrarEtapa("itens");
    elementos.painelCarrinho.setAttribute("data-aberto", "true");
    elementos.painelCarrinho.setAttribute("aria-hidden", "false");
    elementos.botaoCarrinho.setAttribute("aria-expanded", "true");
    elementos.fundoEscuro.hidden = false;
    document.body.style.overflow = "hidden";

    // O painel ainda está com visibility: hidden neste instante, e focar um
    // elemento invisível não funciona; por isso o foco espera o próximo quadro.
    // preventScroll impede que o foco puxe a página durante a animação.
    requestAnimationFrame(() =>
      elementos.fecharCarrinho.focus({ preventScroll: true })
    );
  }

  function fecharPainel(devolverFoco = true) {
    elementos.painelCarrinho.removeAttribute("data-aberto");
    elementos.painelCarrinho.setAttribute("aria-hidden", "true");
    elementos.botaoCarrinho.setAttribute("aria-expanded", "false");
    elementos.fundoEscuro.hidden = true;
    document.body.style.overflow = "";
    if (devolverFoco) elementos.botaoCarrinho.focus({ preventScroll: true });
  }

  const painelAberto = () =>
    elementos.painelCarrinho.getAttribute("data-aberto") === "true";

  function voltarParaItens() {
    mostrarEtapa("itens");
    elementos.irParaPedido.focus({ preventScroll: true });
  }

  /* ====================================================================
     Validação e envio
     ==================================================================== */

  function mostrarErro(campo, mensagem) {
    const aviso = document.querySelector(`[data-erro-de="${campo}"]`);
    const entrada = el(campo);
    if (aviso) {
      aviso.textContent = mensagem;
      aviso.hidden = false;
    }
    if (entrada) entrada.setAttribute("aria-invalid", "true");
  }

  function limparErros() {
    document.querySelectorAll(".erro[data-erro-de]").forEach((aviso) => {
      aviso.hidden = true;
      aviso.textContent = "";
    });
    document
      .querySelectorAll("[aria-invalid]")
      .forEach((campo) => campo.removeAttribute("aria-invalid"));
    elementos.erroGeral.hidden = true;
  }

  function validar(dados) {
    const erros = [];

    if (dados.nome.trim().length < 3) {
      erros.push(["nome", "Escreva o seu nome completo."]);
    }

    const telefone = soDigitos(dados.whatsapp);
    if (telefone.length < 10 || telefone.length > 11) {
      erros.push(["whatsapp", "Informe o DDD e o número, como (11) 91234-5678."]);
    }

    if (dados.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(dados.email)) {
      erros.push(["email", "Esse e-mail parece incompleto."]);
    }

    if (dados.cidade.trim().length < 3) {
      erros.push(["cidade", "Informe a sua cidade e o estado."]);
    }

    if (!dados.entrega) {
      erros.push(["entrega", "Escolha como prefere receber."]);
    }

    return erros;
  }

  function irParaPagamento(evento) {
    evento.preventDefault();
    limparErros();

    if (!pedido.length) {
      fecharPainel();
      avisar("Adicione pelo menos uma camiseta antes de pagar.");
      document
        .getElementById("catalogo")
        .scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const formulario = new FormData(elementos.formulario);
    const dados = {
      nome: formulario.get("nome") || "",
      whatsapp: formulario.get("whatsapp") || "",
      email: formulario.get("email") || "",
      cidade: formulario.get("cidade") || "",
      entrega: formulario.get("entrega") || "",
      observacoes: formulario.get("observacoes") || "",
    };

    const erros = validar(dados);
    if (erros.length) {
      erros.forEach(([campo, mensagem]) => mostrarErro(campo, mensagem));
      el(erros[0][0]).focus();
      return;
    }

    abrirCheckout(dados);
  }

  /* ====================================================================
     Pagamento pela InfinitePay
     --------------------------------------------------------------------
     O site não cobra nada por conta própria. Ele monta o pedido, pede à
     InfinitePay um endereço de checkout e leva o cliente até lá: é na
     tela deles que se escolhe Pix, crédito à vista ou parcelado, e é lá
     que o cartão é digitado — nunca aqui.

     Terminado o pagamento, o cliente volta para esta mesma página com os
     dados da transação no endereço. Antes de dar o pedido por pago,
     perguntamos à InfinitePay se ele saiu mesmo.

     O que a InfinitePay aceita e em quantas parcelas sem juros é ajustado
     no aplicativo dela, não aqui: mudar isso pelo site exigiria a chave
     secreta da conta, que não pode morar num arquivo público.
     ==================================================================== */

  const API_INFINITEPAY = "https://api.checkout.infinitepay.io";
  const CHAVE_EM_PAGAMENTO = "viapadrepio:pagamento:v1";

  const FORMAS = { pix: "Pix", credit_card: "Cartão de crédito" };

  /** A InfinitePay trabalha em centavos: R$ 74,90 vira 7490. */
  const emCentavos = (valor) => Math.round(valor * 100);

  /** A InfiniteTag da loja, sem o cifrão que as pessoas costumam copiar junto. */
  const infiniteTag = () =>
    String((CONFIG.pagamento || {}).handle || "").trim().replace(/^\$/, "");

  const opcaoDeEntrega = (id) =>
    (CONFIG.entrega || []).find((o) => o.id === id) || {};

  /** Número do pedido: a data, para a gente se achar, e um fim que não repete. */
  function novoNumeroDePedido() {
    const agora = new Date();
    const dia = [
      agora.getFullYear(),
      String(agora.getMonth() + 1).padStart(2, "0"),
      String(agora.getDate()).padStart(2, "0"),
    ].join("");
    return `VIA-${dia}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  }

  /** Para onde a InfinitePay devolve o cliente depois de pagar. */
  const enderecoDeRetorno = () =>
    String((CONFIG.pagamento || {}).retorno || "").trim() ||
    `${location.origin}${location.pathname}`;

  function guardarEmAndamento(registro) {
    try {
      localStorage.setItem(CHAVE_EM_PAGAMENTO, JSON.stringify(registro));
    } catch (e) {
      /* navegação privada bloqueia; o pagamento em si não depende disto */
    }
  }

  function lerEmAndamento() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_EM_PAGAMENTO) || "null");
    } catch (e) {
      return null;
    }
  }

  function esquecerEmAndamento() {
    try {
      localStorage.removeItem(CHAVE_EM_PAGAMENTO);
    } catch (e) {
      /* idem */
    }
  }

  /**
   * O pedido escrito como aparece no checkout e, depois, no extrato da
   * InfinitePay. Cada linha diz coleção, modelo, cor e tamanho, porque é
   * por ela que as peças vão ser separadas.
   */
  function itensParaCobranca(dados) {
    const itens = pedido.map((item) => ({
      quantity: item.quantidade,
      price: emCentavos(item.preco),
      description: `${item.nome} — ${item.modeloNome} · ${item.cor} · Tam ${item.tamanho}`,
    }));

    const entrega = opcaoDeEntrega(dados.entrega);
    if (entrega.frete > 0) {
      itens.push({
        quantity: 1,
        price: emCentavos(entrega.frete),
        description: `Frete — ${entrega.nome}`,
      });
    }

    return itens;
  }

  /**
   * Pede o endereço do checkout. O endereço vem com nomes diferentes
   * conforme o host que responde, então pegamos o primeiro que apareça em
   * vez de apostar num só.
   */
  async function pedirLinkDeCheckout(corpo) {
    const resposta = await fetch(`${API_INFINITEPAY}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok || dados.success === false) {
      throw new Error(
        dados.message || `A InfinitePay respondeu ${resposta.status}.`
      );
    }

    const fonte = dados.data || dados;
    const url = ["url", "checkout_url", "link", "payment_url"]
      .map((chave) => fonte[chave])
      .find((valor) => typeof valor === "string" && valor.startsWith("http"));

    if (!url) {
      throw new Error("A InfinitePay não devolveu o endereço do checkout.");
    }

    return { url, slug: fonte.slug || "" };
  }

  async function abrirCheckout(dados) {
    if (!infiniteTag()) {
      return pararPagamento(
        "O pagamento pelo site ainda está sendo ligado. Chame a gente no WhatsApp que fechamos o seu pedido por lá."
      );
    }

    const numeroPedido = novoNumeroDePedido();
    travarEnvio(true, "Abrindo o pagamento…");

    try {
      const { url, slug } = await pedirLinkDeCheckout({
        handle: infiniteTag(),
        order_nsu: numeroPedido,
        redirect_url: enderecoDeRetorno(),
        items: itensParaCobranca(dados),
        // Vai preenchido para o outro lado: é menos campo para digitar na
        // hora de pagar, que é onde as compras costumam ser abandonadas.
        customer: {
          name: dados.nome.trim(),
          email: dados.email.trim() || undefined,
          phone_number: `+55${soDigitos(dados.whatsapp)}`,
        },
      });

      // Guardado antes de a página sair do ar: é com isto que a volta do
      // checkout mostra o que foi comprado e monta os dados de entrega.
      // O carrinho só é esvaziado quando o pagamento se confirma.
      guardarEmAndamento({
        numeroPedido,
        slug,
        dados,
        itens: pedido,
        total: totalValor(),
        quando: new Date().toISOString(),
      });

      window.location.href = url;
    } catch (erro) {
      console.error("Via Padre Pio: não deu para abrir o checkout —", erro);
      travarEnvio(false);
      pararPagamento(
        "Não conseguimos abrir o pagamento agora. Tente de novo em instantes ou chame a gente no WhatsApp."
      );
    }
  }

  /** Enquanto a InfinitePay responde, o botão para de aceitar cliques. */
  function travarEnvio(travado, texto) {
    const botao = el("botaoEnviar");
    botao.disabled = travado;
    botao.setAttribute("aria-busy", String(travado));
    elementos.textoBotaoEnviar.textContent = travado
      ? texto
      : rotuloDoPagamento();
  }

  function pararPagamento(mensagem) {
    elementos.erroGeral.textContent = mensagem;
    elementos.erroGeral.hidden = false;
    elementos.erroGeral.scrollIntoView({ block: "nearest" });
  }

  const rotuloDoPagamento = () =>
    pedido.length ? `Pagar ${emReais(totalValor())}` : "Ir para o pagamento";

  /**
   * Volta do checkout. A InfinitePay devolve o cliente com os dados da
   * transação no próprio endereço — e quem digitasse esse endereço à mão
   * chegaria aqui também, então perguntamos a ela se o pagamento saiu
   * antes de dar o pedido por pago.
   */
  async function conferirVoltaDoPagamento() {
    const params = new URLSearchParams(location.search);
    const transacao = params.get("transaction_nsu");
    if (!transacao) return;

    const retorno = {
      transacao,
      numeroPedido: params.get("order_nsu") || "",
      slug: params.get("slug") || "",
      comprovante: params.get("receipt_url") || "",
      forma: params.get("capture_method") || "",
    };

    // Limpa a barra de endereços: recarregar a página não deve reabrir a
    // confirmação de um pagamento que a pessoa já viu.
    history.replaceState(null, "", location.pathname + location.hash);

    mostrarPagamentoConcluido(retorno, await consultarPagamento(retorno));
  }

  /**
   * Pergunta direto à InfinitePay. "pago" vem true, false, ou null quando
   * não deu para perguntar — e aí tratamos como recebido, sem comemorar:
   * o comprovante na mão do cliente vale mais do que uma resposta que
   * não chegou.
   *
   * O valor pago pode ser maior que o do pedido: quem parcela no cartão
   * paga o acréscimo do parcelamento, e é esse número que aparece na
   * fatura dele.
   */
  async function consultarPagamento(retorno) {
    const vazio = { pago: null, valorPago: null, parcelas: null };
    if (!infiniteTag() || !retorno.slug) return vazio;

    try {
      const resposta = await fetch(`${API_INFINITEPAY}/payment_check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: infiniteTag(),
          order_nsu: retorno.numeroPedido,
          transaction_nsu: retorno.transacao,
          slug: retorno.slug,
        }),
      });

      const dados = await resposta.json().catch(() => ({}));

      return {
        pago: typeof dados.paid === "boolean" ? dados.paid : null,
        valorPago: Number.isFinite(dados.paid_amount)
          ? dados.paid_amount / 100
          : null,
        parcelas: Number(dados.installments) || null,
      };
    } catch (erro) {
      console.warn("Via Padre Pio: não deu para conferir o pagamento —", erro);
      return vazio;
    }
  }

  /**
   * Como o pagamento foi feito, em uma linha: "Pix", "Cartão à vista" ou
   * "Cartão em 5x". O número de parcelas é o que o cliente reconhece da
   * própria fatura — e, quando a InfinitePay não respondeu, ficamos no
   * genérico em vez de afirmar um parcelamento que não conferimos.
   */
  function comoFoiPago(retorno, consulta) {
    if (retorno.forma === "pix") return "Pix";
    if (retorno.forma !== "credit_card") return "";
    if (!consulta.parcelas) return "Cartão de crédito";
    return consulta.parcelas <= 1
      ? "Cartão à vista"
      : `Cartão em ${consulta.parcelas}x`;
  }

  function mostrarPagamentoConcluido(retorno, consulta) {
    const registro = lerEmAndamento() || {};
    const numero = retorno.numeroPedido || registro.numeroPedido || "";
    const itens = registro.itens || [];
    const recusado = consulta.pago === false;

    if (!recusado) {
      // O pedido foi pago: o carrinho já cumpriu o seu papel.
      pedido = [];
      salvar();
      desenharTudo();
      fecharPainel(false);
      esquecerEmAndamento();
    }

    elementos.pagamentoTitulo.textContent = recusado
      ? "Pagamento não confirmado"
      : "Pedido confirmado!";

    elementos.pagamentoTexto.textContent = recusado
      ? "A InfinitePay não confirmou esse pagamento. Se o valor saiu da sua conta, mande o comprovante para a gente no WhatsApp que resolvemos."
      : "Recebemos o seu pagamento. Agora é só nos dizer para onde enviar — o botão abaixo abre a conversa com os seus dados já escritos.";

    elementos.pagamentoSelo.hidden = recusado;

    // O valor que vale aqui é o que saiu da conta do cliente. Só quando a
    // InfinitePay não responde é que caímos no total do pedido.
    const pagou = consulta.valorPago;
    const comoPagou = comoFoiPago(retorno, consulta);

    const linhas = [];
    if (numero) linhas.push(["Pedido", numero]);
    if (comoPagou) linhas.push(["Pagamento", comoPagou]);
    if (pagou || registro.total) {
      linhas.push([pagou ? "Total pago" : "Total", emReais(pagou || registro.total)]);
    }

    elementos.pagamentoDados.innerHTML = linhas
      .map(
        ([rotulo, valor]) =>
          `<div><dt>${escapar(rotulo)}</dt><dd>${escapar(valor)}</dd></div>`
      )
      .join("");

    elementos.pagamentoItens.innerHTML = itens
      .map(
        (item) =>
          `<li>${item.quantidade}× ${escapar(item.nome)} — ${escapar(item.modeloNome)} · Tam ${escapar(item.tamanho)}</li>`
      )
      .join("");
    elementos.pagamentoItens.hidden = !itens.length;

    // Quem parcela paga mais do que o preço das peças. Em vez de deixar a
    // diferença sem explicação, ela é dita por extenso — com o valor da
    // parcela, que é como a cobrança vai aparecer na fatura.
    const acrescimo = pagou && registro.total ? pagou - registro.total : 0;
    elementos.pagamentoParcelas.hidden = acrescimo <= 0.009;
    if (acrescimo > 0.009) {
      const parcela =
        consulta.parcelas > 1
          ? `${consulta.parcelas}× de ${emReais(pagou / consulta.parcelas)} · `
          : "";
      elementos.pagamentoParcelas.textContent =
        `${parcela}${emReais(registro.total)} em peças + ${emReais(acrescimo)} de acréscimo do parcelamento.`;
    }

    const temComprovante = Boolean(retorno.comprovante);
    elementos.pagamentoComprovante.hidden = !temComprovante;
    if (temComprovante) elementos.pagamentoComprovante.href = retorno.comprovante;

    const conversa = linkDoAtendimento(
      recusado
        ? mensagemDeProblema(numero, retorno.comprovante)
        : mensagemDeEntrega(numero, registro, retorno.comprovante)
    );
    elementos.pagamentoSac.hidden = !conversa;
    if (conversa) {
      elementos.pagamentoSac.href = conversa;
      elementos.pagamentoSacTexto.textContent = recusado
        ? "Falar com o atendimento"
        : "Enviar meus dados de entrega";
    }

    // Mandar só o comprovante, sem o resto. Serve para quem já combinou a
    // entrega e para quem volta à janela depois.
    const envioComprovante =
      temComprovante && linkDoAtendimento(mensagemDeComprovante(numero, retorno));
    elementos.pagamentoEnviarComprovante.hidden = !envioComprovante;
    if (envioComprovante) {
      elementos.pagamentoEnviarComprovante.href = envioComprovante;
    }

    elementos.janelaPagamento.showModal();

    // js/animacoes.js escuta para comemorar — e só há o que comemorar
    // quando o pagamento não foi recusado.
    if (!recusado) {
      document.dispatchEvent(new CustomEvent("via:pedido-enviado"));
    }
  }

  /* ====================================================================
     Atendimento pelo WhatsApp
     --------------------------------------------------------------------
     A conversa deixou de ser o caixa e virou o balcão: tira dúvidas,
     recebe o endereço de entrega e resolve o que der errado.
     ==================================================================== */

  function linkDoAtendimento(mensagem) {
    const numero = soDigitos(CONFIG.contato.whatsapp);
    if (numero.length < 12) return "";
    return (
      `https://wa.me/${numero}` +
      (mensagem ? `?text=${encodeURIComponent(mensagem)}` : "")
    );
  }

  /** O endereço de entrega não passa pela InfinitePay: chega por aqui. */
  function mensagemDeEntrega(numero, registro, comprovante) {
    const dados = registro.dados || {};
    const entrega = opcaoDeEntrega(dados.entrega).nome || "-";

    const linhas = [
      `Olá! Acabei de pagar o pedido ${numero || "da pré-venda"} no site.`,
      "",
      `*Nome:* ${(dados.nome || "").trim()}`,
      `*Cidade:* ${(dados.cidade || "").trim()}`,
      `*Entrega:* ${entrega}`,
    ];

    (registro.itens || []).forEach((item, indice) => {
      if (indice === 0) linhas.push("", "*Peças:*");
      linhas.push(
        `${indice + 1}. ${item.nome} — ${item.modeloNome} · Tam ${item.tamanho} · ${item.quantidade}x`
      );
    });

    if ((dados.observacoes || "").trim()) {
      linhas.push("", `*Observações:* ${dados.observacoes.trim()}`);
    }

    // O comprovante vai junto: a loja recebe numa mensagem só o que
    // entregar, para quem, e a prova de que foi pago.
    if (comprovante) linhas.push("", `*Comprovante:* ${comprovante}`);

    return linhas.join("\n");
  }

  /** Só o comprovante, para quem quer mandar a prova do pagamento e nada mais. */
  function mensagemDeComprovante(numero, retorno) {
    return [
      `Olá! Segue o comprovante do pagamento do pedido ${numero || "da pré-venda"}.`,
      "",
      retorno.comprovante,
    ].join("\n");
  }

  const mensagemDeProblema = (numero, comprovante) =>
    `Olá! Tentei pagar o pedido ${numero || "da pré-venda"} no site e o pagamento não foi confirmado. Podem me ajudar?` +
    (comprovante ? `\n\n*Comprovante:* ${comprovante}` : "");

  /* ====================================================================
     Eventos
     ==================================================================== */

  function ligarEventos() {
    elementos.fecharSanto.addEventListener("click", () =>
      elementos.janelaSanto.close()
    );

    // Clique fora do conteúdo: num <dialog> o alvo só é o próprio diálogo
    // quando a pessoa acerta o fundo escurecido. O Esc o navegador já fecha.
    elementos.janelaSanto.addEventListener("click", (evento) => {
      if (evento.target === elementos.janelaSanto) elementos.janelaSanto.close();
    });

    elementos.fecharMedidas.addEventListener("click", () =>
      elementos.janelaMedidas.close()
    );

    elementos.janelaMedidas.addEventListener("click", (evento) => {
      if (evento.target === elementos.janelaMedidas) {
        elementos.janelaMedidas.close();
      }
    });

    elementos.fecharPagamento.addEventListener("click", () =>
      elementos.janelaPagamento.close()
    );

    elementos.janelaPagamento.addEventListener("click", (evento) => {
      if (evento.target === elementos.janelaPagamento) {
        elementos.janelaPagamento.close();
      }
    });

    // A tabela de medidas e as histórias são chamadas de vários lugares —
    // de dentro dos cartões e das dúvidas frequentes —, e os cartões só
    // existem depois que o catálogo é montado. Por isso o clique é ouvido
    // uma vez só, aqui na página inteira.
    document.addEventListener("click", (evento) => {
      const medidas = evento.target.closest("[data-abrir-medidas]");
      if (medidas) return abrirMedidas(medidas);

      const santo = evento.target.closest("[data-santo]");
      if (santo) abrirSantoPorNome(santo.dataset.santo);
    });

    elementos.botaoCarrinho.addEventListener("click", () =>
      painelAberto() ? fecharPainel() : abrirPainel()
    );
    elementos.fecharCarrinho.addEventListener("click", () => fecharPainel());
    elementos.fundoEscuro.addEventListener("click", () => fecharPainel());

    document.addEventListener("keydown", (evento) => {
      if (evento.key !== "Escape" || !painelAberto()) return;
      etapa === "dados" ? voltarParaItens() : fecharPainel();
    });

    elementos.irParaPedido.addEventListener("click", () => {
      if (!pedido.length) return;
      mostrarEtapa("dados");
      // Focar o bloco (e não o primeiro campo) evita abrir o teclado no celular.
      elementos.etapaDados.focus({ preventScroll: true });
    });

    elementos.voltarItens.addEventListener("click", voltarParaItens);

    // Links para seções da página (como "escolher uma camiseta") precisam
    // sair da frente do conteúdo que acabaram de abrir.
    elementos.painelCarrinho.addEventListener("click", (evento) => {
      if (evento.target.closest('a[href^="#"]')) fecharPainel(false);
    });

    elementos.itensCarrinho.addEventListener("click", (evento) => {
      const remover = evento.target.closest("[data-remover]");
      if (remover) return removerItem(remover.dataset.remover);

      const ajustar = evento.target.closest("[data-passo]");
      if (ajustar) {
        alterarQuantidade(ajustar.dataset.chave, Number(ajustar.dataset.passo));
      }
    });

    const campoTelefone = el("whatsapp");
    campoTelefone.addEventListener("input", () => {
      campoTelefone.value = mascaraTelefone(campoTelefone.value);
    });

    elementos.formulario.addEventListener("submit", irParaPagamento);
  }

  /* ====================================================================
     Início
     ==================================================================== */

  function iniciar() {
    if (typeof CONFIG === "undefined") {
      console.error("Via Padre Pio: js/config.js não foi carregado.");
      return;
    }
    aplicarTema();
    aplicarTextos();
    montarCatalogo();
    montarMedidas();
    montarInspiracoes();
    carregar();
    desenharTudo();
    ligarEventos();
    conferirVoltaDoPagamento();
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", iniciar)
    : iniciar();
})();
