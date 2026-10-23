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
  const CHAVE_VISAO = "viapadrepio:visao:v2";
  const LIMITE_POR_ITEM = 20;

  /** Itens do pedido: { chave, produtoId, nome, preco, cor, tamanho, imagem, quantidade } */
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
    marcaPrazo: el("marcaPrazo"),
    gradeProdutos: el("gradeProdutos"),
    barraCatalogo: el("barraCatalogo"),
    contagemProdutos: el("contagemProdutos"),
    alternarVisao: el("alternarVisao"),
    duvidaPrazo: el("duvidaPrazo"),
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
    // Em telas estreitas o rótulo ocupa duas linhas; o nome da marca fica
    // inteiro na segunda em vez de ser partido no meio.
    elementos.textoBotaoEnviar.innerHTML =
      `Enviar pedido para <span class="sem-quebra">${escapar(marca.nome.toUpperCase())}</span>`;

    if (marca.aviso) {
      elementos.textoAviso.textContent = marca.aviso;
      elementos.faixaAviso.hidden = false;
      // Só dá para medir o texto depois que a faixa aparece.
      montarLetreiro(marca.aviso);
    }

    if (marca.prazoEntrega) {
      elementos.marcaPrazo.textContent = marca.prazoEntrega;
      elementos.marcaPrazo.hidden = false;
      elementos.duvidaPrazo.textContent = marca.prazoEntrega;
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
      elementos.rodapeWhatsapp.href = `https://wa.me/${soDigitos(contato.whatsapp)}`;
      elementos.rodapeWhatsapp.textContent =
        contato.whatsappVisivel || "Falar no WhatsApp";
    } else {
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

  function coresDoProduto(produto) {
    return produto.cores && produto.cores.length
      ? produto.cores
      : CONFIG.padrao.cores;
  }

  function tamanhosDoProduto(produto) {
    return produto.tamanhos && produto.tamanhos.length
      ? produto.tamanhos
      : CONFIG.padrao.tamanhos;
  }

  function montarCatalogo() {
    const produtos = CONFIG.produtos || [];

    if (!produtos.length) {
      elementos.gradeProdutos.innerHTML =
        '<p class="resumo__vazio">Os modelos desta pré-venda serão anunciados em breve. Acompanhe o nosso Instagram.</p>';
      return;
    }

    produtos.forEach((produto) => {
      elementos.gradeProdutos.appendChild(criarCartaoProduto(produto));
    });

    elementos.contagemProdutos.textContent =
      produtos.length === 1 ? "1 modelo" : `${produtos.length} modelos`;
    elementos.barraCatalogo.hidden = false;
    aplicarVisao(visaoSalva());
  }

  /* ====================================================================
     Tamanho das fotos: "grande" ou "compacta"
     ==================================================================== */

  function visaoSalva() {
    try {
      return localStorage.getItem(CHAVE_VISAO) === "grande"
        ? "grande"
        : "compacta";
    } catch (e) {
      return "compacta";
    }
  }

  function aplicarVisao(visao) {
    elementos.gradeProdutos.classList.toggle(
      "grade-produtos--compacta",
      visao === "compacta"
    );

    // Nas fotos grandes as opções já ficam à mostra, então nenhum cartão
    // precisa continuar marcado como aberto.
    if (visao !== "compacta") fecharCartoes();

    elementos.alternarVisao.querySelectorAll("[data-visao]").forEach((botao) =>
      botao.setAttribute("aria-pressed", String(botao.dataset.visao === visao))
    );

    try {
      localStorage.setItem(CHAVE_VISAO, visao);
    } catch (e) {
      /* navegação privada pode bloquear; a escolha vale para esta visita */
    }
  }

  /* ====================================================================
     Nossas inspirações: a coluna do meio do rodapé
     ==================================================================== */

  function montarInspiracoes() {
    const bloco = CONFIG.inspiracoes || {};
    const santos = bloco.santos || [];
    if (!santos.length) return;

    elementos.tituloInspiracoes.textContent =
      bloco.titulo || "Nossas Inspirações";

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

  function criarCartaoProduto(produto) {
    const cores = coresDoProduto(produto);
    const tamanhos = tamanhosDoProduto(produto);

    const cartao = document.createElement("article");
    cartao.className = "produto" + (produto.esgotado ? " produto--esgotado" : "");

    const idCor = `cor-${produto.id}`;
    const idTam = `tam-${produto.id}`;
    const idDetalhes = `detalhes-${produto.id}`;

    cartao.innerHTML = `
      <figure class="produto__figura">
        <img src="${escapar(produto.imagem || "assets/camisetas/modelo-1.svg")}"
             alt="Camiseta ${escapar(produto.nome)}" loading="lazy">
        ${produto.esgotado ? '<span class="selo-esgotado">Esgotado</span>' : ""}
      </figure>

      <div class="produto__corpo">
        <div class="produto__topo">
          <h3 class="produto__nome">${escapar(produto.nome)}</h3>
          <span class="produto__preco">${emReais(produto.preco)}</span>
        </div>

        ${produto.esgotado ? "" : `
        <button type="button" class="produto__escolher"
                aria-expanded="false" aria-controls="${idDetalhes}">Escolher</button>`}

        <div class="produto__detalhes" id="${idDetalhes}">
        ${produto.descricao
          ? `<p class="produto__descricao">${escapar(produto.descricao)}</p>`
          : ""}

        ${produto.esgotado ? "" : `
        <div class="opcao">
          <span class="opcao__rotulo" id="${idCor}">Cor</span>
          <div class="lista-opcoes" role="group" aria-labelledby="${idCor}" data-grupo="cor">
            ${cores.map((cor, i) => `
              <button type="button" class="bolinha-cor"
                      style="background:${escapar(cor.hex)}"
                      data-valor="${escapar(cor.nome)}"
                      aria-pressed="${i === 0}"
                      title="${escapar(cor.nome)}">
                <span class="so-leitor">${escapar(cor.nome)}</span>
              </button>`).join("")}
          </div>
        </div>

        <div class="opcao">
          <span class="opcao__rotulo" id="${idTam}">Tamanho</span>
          <div class="lista-opcoes" role="group" aria-labelledby="${idTam}" data-grupo="tamanho">
            ${tamanhos.map((t, i) => `
              <button type="button" class="botao-tamanho"
                      data-valor="${escapar(t)}"
                      aria-pressed="${i === 0}">${escapar(t)}</button>`).join("")}
          </div>
        </div>

        <div class="produto__rodape">
          <div class="quantidade">
            <button type="button" data-passo="-1" aria-label="Diminuir quantidade">−</button>
            <output aria-live="polite">1</output>
            <button type="button" data-passo="1" aria-label="Aumentar quantidade">+</button>
          </div>
          <button type="button" class="botao botao--principal" data-acao="adicionar">
            Adicionar
          </button>
        </div>`}
        </div>
      </div>`;

    if (produto.esgotado) return cartao;

    // Com as fotos menores o cartão mostra só foto, nome e preço; este botão
    // é que traz as opções. Um cartão aberto por vez, para a grade não virar
    // uma coluna de cartões gigantes.
    const escolher = cartao.querySelector(".produto__escolher");
    escolher.addEventListener("click", () => {
      const abrindo = !cartao.classList.contains("produto--aberto");
      fecharCartoes(cartao);
      cartao.classList.toggle("produto--aberto", abrindo);
      escolher.setAttribute("aria-expanded", String(abrindo));
      escolher.textContent = abrindo ? "Fechar" : "Escolher";
    });

    // Seleção de cor e tamanho
    cartao.querySelectorAll("[data-grupo]").forEach((grupo) => {
      grupo.addEventListener("click", (evento) => {
        const botao = evento.target.closest("button[data-valor]");
        if (!botao) return;
        grupo.querySelectorAll("button[data-valor]").forEach((b) =>
          b.setAttribute("aria-pressed", String(b === botao))
        );
      });
    });

    // Quantidade
    const saida = cartao.querySelector(".quantidade output");
    cartao.querySelectorAll(".quantidade button").forEach((botao) => {
      botao.addEventListener("click", () => {
        const passo = Number(botao.dataset.passo);
        const atual = Number(saida.textContent);
        const novo = Math.min(LIMITE_POR_ITEM, Math.max(1, atual + passo));
        saida.textContent = String(novo);
      });
    });

    // Adicionar ao pedido
    cartao
      .querySelector('[data-acao="adicionar"]')
      .addEventListener("click", () => {
        const selecionado = (grupo) =>
          cartao.querySelector(
            `[data-grupo="${grupo}"] button[aria-pressed="true"]`
          )?.dataset.valor;

        adicionarAoPedido({
          produtoId: produto.id,
          nome: produto.nome,
          preco: produto.preco,
          imagem: produto.imagem,
          cor: selecionado("cor"),
          tamanho: selecionado("tamanho"),
          quantidade: Number(saida.textContent),
        });

        saida.textContent = "1";
      });

    return cartao;
  }

  /* ====================================================================
     Carrinho
     ==================================================================== */

  function adicionarAoPedido(item) {
    const chave = `${item.produtoId}|${item.cor}|${item.tamanho}`;
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
    avisar(`${item.nome} (${item.tamanho}) adicionada ao pedido`);
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

      // Mantém só itens cujo produto ainda existe e revalida o preço atual.
      pedido = salvo
        .map((item) => {
          const produto = (CONFIG.produtos || []).find(
            (p) => p.id === item.produtoId && !p.esgotado
          );
          if (!produto) return null;
          return {
            ...item,
            nome: produto.nome,
            preco: produto.preco,
            imagem: produto.imagem,
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
        ? "Meu pedido, vazio"
        : `Meu pedido, ${n} ${n === 1 ? "peça" : "peças"}`
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
            <p class="item-carrinho__detalhe">${escapar(item.cor)} · Tamanho ${escapar(item.tamanho)}</p>
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
              <small>${escapar(item.cor)} · Tamanho ${escapar(item.tamanho)}</small>
            </span>
            <strong>${emReais(item.preco * item.quantidade)}</strong>
          </li>`
          )
          .join("")}
      </ul>
      <div class="resumo__total">
        <span>Total estimado</span>
        <strong>${emReais(totalValor())}</strong>
      </div>`;
  }

  /* ====================================================================
     Painel lateral
     ==================================================================== */

  /**
   * Alterna entre a lista de itens e o formulário, ambos dentro do painel.
   * O rodapé com o total só existe na etapa dos itens: na de dados quem
   * conclui é o botão do WhatsApp, dentro do próprio formulário.
   */
  function mostrarEtapa(nova) {
    etapa = nova;
    const emDados = nova === "dados";

    elementos.etapaItens.hidden = emDados;
    elementos.etapaDados.hidden = !emDados;
    elementos.rodapeCarrinho.hidden = emDados;
    elementos.voltarItens.hidden = !emDados;
    elementos.tituloPainel.textContent = emDados
      ? "Finalizar reserva"
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

  function montarMensagem(dados) {
    const nomeEntrega =
      (CONFIG.entrega.find((o) => o.id === dados.entrega) || {}).nome || "-";

    const linhas = [
      `*NOVO PEDIDO — PRÉ-VENDA ${CONFIG.marca.nome.toUpperCase()}*`,
      "",
      `*Nome:* ${dados.nome.trim()}`,
      `*WhatsApp:* ${mascaraTelefone(dados.whatsapp)}`,
    ];

    if (dados.email.trim()) linhas.push(`*E-mail:* ${dados.email.trim()}`);

    linhas.push(`*Cidade:* ${dados.cidade.trim()}`);
    linhas.push(`*Entrega:* ${nomeEntrega}`);
    linhas.push("", "*ITENS DO PEDIDO*");

    pedido.forEach((item, indice) => {
      linhas.push(
        `${indice + 1}. ${item.nome}`,
        `   Cor: ${item.cor} | Tamanho: ${item.tamanho} | Qtd: ${item.quantidade}`,
        `   Subtotal: ${emReais(item.preco * item.quantidade)}`
      );
    });

    linhas.push(
      "",
      `*Total estimado:* ${emReais(totalValor())}`,
      `(${totalItens()} ${totalItens() === 1 ? "peça" : "peças"})`
    );

    if (dados.observacoes.trim()) {
      linhas.push("", `*Observações:* ${dados.observacoes.trim()}`);
    }

    linhas.push("", "Enviado pelo site da pré-venda.");

    return linhas.join("\n");
  }

  function enviar(evento) {
    evento.preventDefault();
    limparErros();

    if (!pedido.length) {
      fecharPainel();
      avisar("Adicione pelo menos uma camiseta antes de enviar o pedido.");
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

    const numero = soDigitos(CONFIG.contato.whatsapp);
    if (numero.length < 12) {
      elementos.erroGeral.textContent =
        "O número de WhatsApp da loja ainda não foi configurado. Fale com a gente pelo Instagram.";
      elementos.erroGeral.hidden = false;
      return;
    }

    const url = `https://wa.me/${numero}?text=${encodeURIComponent(montarMensagem(dados))}`;
    window.open(url, "_blank", "noopener");
    avisar("Abrindo o WhatsApp com o seu pedido…");

    // js/animacoes.js escuta para comemorar. Só dispara quando o pedido
    // realmente saiu, nunca quando a validação barrou o envio.
    document.dispatchEvent(new CustomEvent("via:pedido-enviado"));
  }

  /* ====================================================================
     Eventos
     ==================================================================== */

  function ligarEventos() {
    elementos.alternarVisao.addEventListener("click", (evento) => {
      const botao = evento.target.closest("[data-visao]");
      if (botao) aplicarVisao(botao.dataset.visao);
    });

    elementos.fecharSanto.addEventListener("click", () =>
      elementos.janelaSanto.close()
    );

    // Clique fora do conteúdo: num <dialog> o alvo só é o próprio diálogo
    // quando a pessoa acerta o fundo escurecido. O Esc o navegador já fecha.
    elementos.janelaSanto.addEventListener("click", (evento) => {
      if (evento.target === elementos.janelaSanto) elementos.janelaSanto.close();
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

    elementos.formulario.addEventListener("submit", enviar);
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
    montarInspiracoes();
    carregar();
    desenharTudo();
    ligarEventos();
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", iniciar)
    : iniciar();
})();
