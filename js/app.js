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

  /** Onde o CEP é conferido. Responde com CORS liberado, direto do navegador. */
  const API_CEP = "https://brasilapi.com.br/api/cep/v2";

  /**
   * Os nomes dos estados, para escrever "Frete para São Paulo" em vez de
   * "Frete para SP". Ficam aqui, e não em js/config.js, porque não são
   * uma decisão da loja: o que a loja decide é quanto cobra por cada um,
   * e isso está em CONFIG.frete.
   */
  const ESTADOS = {
    AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas",
    BA: "Bahia", CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo",
    GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul",
    MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná",
    PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
    RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina",
    SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
  };

  /**
   * O endereço do CEP que está no formulário, já conferido — ou null
   * enquanto não houver um. É dele que sai o frete, então enquanto for
   * null o pedido não pode seguir para o pagamento.
   */
  let enderecoDoCep = null;

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
    resumoPedido: el("resumoPedido"),
    formulario: el("formularioPedido"),
    selectEntrega: el("entrega"),
    campoCep: el("cep"),
    cepEndereco: el("cepEndereco"),
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
    janelaFoto: el("janelaFoto"),
    fecharFoto: el("fecharFoto"),
    palcoFoto: el("palcoFoto"),
    fotoAmpliada: el("fotoAmpliada"),
    dicaFoto: el("dicaFoto"),
    vistasFoto: el("vistasFoto"),
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
    // Cada frase vira um trecho próprio para o celular poder quebrar a linha
    // depois do ponto, sem mudar o parágrafo no computador.
    elementos.marcaDescricao.replaceChildren(
      ...frasesDaCapa(marca.descricao)
    );

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

  /** Frases da descrição da capa, separadas no ponto final. */
  function frasesDaCapa(texto) {
    return String(texto || "")
      .trim()
      .split(/(?<=\.)\s+/)
      .filter(Boolean)
      .map((frase) => {
        const span = document.createElement("span");
        span.className = "capa__frase";
        span.textContent = frase;
        return span;
      });
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

  /* ====================================================================
     Foto ampliada
     --------------------------------------------------------------------
     A estampa é o produto, e no cartão ela cabe num quadrado pequeno.
     Aqui a foto ocupa a tela e aceita zoom — clique ou duplo toque para
     ampliar no ponto, arraste para passear, pinça no celular, roda do
     mouse no computador.
     ==================================================================== */

  const AMPLIACAO_MAXIMA = 4;

  /** O que está aberto: as vistas da peça e qual delas aparece. */
  let fotoAberta = { vistas: [], atual: 0 };

  /** O zoom de agora. Escala 1 é a foto inteira, sem deslocamento. */
  let zoom = { escala: 1, x: 0, y: 0 };

  function desenharZoom() {
    elementos.fotoAmpliada.style.transform =
      `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.escala})`;
    elementos.palcoFoto.dataset.ampliado = zoom.escala > 1 ? "sim" : "nao";
  }

  /**
   * Prende o deslocamento às bordas da foto. Sem isto, um arraste mais
   * forte deixaria a tela vazia com a imagem lá fora — e a pessoa sem
   * saber como trazê-la de volta.
   */
  function prenderZoom() {
    if (zoom.escala <= 1) {
      zoom.x = 0;
      zoom.y = 0;
      return;
    }

    const palco = elementos.palcoFoto.getBoundingClientRect();
    const foto = elementos.fotoAmpliada;
    const sobraX = Math.max(0, (foto.offsetWidth * zoom.escala - palco.width) / 2);
    const sobraY = Math.max(0, (foto.offsetHeight * zoom.escala - palco.height) / 2);

    zoom.x = Math.min(sobraX, Math.max(-sobraX, zoom.x));
    zoom.y = Math.min(sobraY, Math.max(-sobraY, zoom.y));
  }

  /**
   * Amplia mantendo parado o ponto que a pessoa escolheu — o dedo, o
   * cursor, ou o meio da pinça. É o que faz o zoom parecer que obedece,
   * em vez de pular para outro lugar da estampa.
   */
  function ampliarEmTorno(escalaNova, pontoX, pontoY) {
    const palco = elementos.palcoFoto.getBoundingClientRect();
    const doCentroX = pontoX - palco.left - palco.width / 2;
    const doCentroY = pontoY - palco.top - palco.height / 2;

    const limitada = Math.min(AMPLIACAO_MAXIMA, Math.max(1, escalaNova));
    const razao = limitada / zoom.escala;

    zoom.x = doCentroX - (doCentroX - zoom.x) * razao;
    zoom.y = doCentroY - (doCentroY - zoom.y) * razao;
    zoom.escala = limitada;

    prenderZoom();
    desenharZoom();
  }

  function zerarZoom() {
    zoom = { escala: 1, x: 0, y: 0 };
    desenharZoom();
  }

  function mostrarFoto(indice) {
    const vista = fotoAberta.vistas[indice];
    if (!vista) return;

    fotoAberta.atual = indice;
    elementos.fotoAmpliada.src = vista.src;
    elementos.fotoAmpliada.alt = vista.legenda;
    zerarZoom();

    elementos.vistasFoto.innerHTML = fotoAberta.vistas
      .map(
        (v, i) => `
        <button type="button" class="janela-foto__vista" data-vista="${i}"
                aria-pressed="${i === indice}">
          <img src="${escapar(v.src)}" alt="" loading="lazy">
          <span class="so-leitor">${escapar(v.rotulo)}</span>
        </button>`
      )
      .join("");
    elementos.vistasFoto.hidden = fotoAberta.vistas.length < 2;
  }

  function abrirFoto(vistas, indice) {
    fotoAberta = { vistas, atual: indice };
    elementos.dicaFoto.textContent = podeApontar()
      ? "Clique na foto para ampliar. Arraste para ver os detalhes."
      : "Toque para ampliar. Use dois dedos para aproximar.";
    mostrarFoto(indice);
    elementos.janelaFoto.showModal();
  }

  const podeApontar = () =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /**
   * Arraste e pinça. Os dedos ficam num mapa porque a pinça precisa dos
   * dois ao mesmo tempo, e porque um dedo pode sair da tela sem avisar.
   */
  function ligarZoomDaFoto() {
    const palco = elementos.palcoFoto;
    const dedos = new Map();
    let distanciaAnterior = 0;
    let arrastou = false;

    const meio = () => {
      const [a, b] = [...dedos.values()];
      return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    };

    const distancia = () => {
      const [a, b] = [...dedos.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    };

    palco.addEventListener("pointerdown", (evento) => {
      palco.setPointerCapture(evento.pointerId);
      dedos.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
      arrastou = false;
      if (dedos.size === 2) distanciaAnterior = distancia();
    });

    palco.addEventListener("pointermove", (evento) => {
      const dedo = dedos.get(evento.pointerId);
      if (!dedo) return;

      const andouX = evento.clientX - dedo.x;
      const andouY = evento.clientY - dedo.y;
      dedo.x = evento.clientX;
      dedo.y = evento.clientY;

      if (Math.abs(andouX) + Math.abs(andouY) > 3) arrastou = true;

      if (dedos.size === 2) {
        palco.dataset.arrastando = "sim";
        const agora = distancia();
        if (distanciaAnterior > 0) {
          const centro = meio();
          ampliarEmTorno(zoom.escala * (agora / distanciaAnterior), centro.x, centro.y);
        }
        distanciaAnterior = agora;
        return;
      }

      // Com a foto inteira na tela não há para onde arrastar.
      if (zoom.escala <= 1) return;

      palco.dataset.arrastando = "sim";
      zoom.x += andouX;
      zoom.y += andouY;
      prenderZoom();
      desenharZoom();
    });

    const soltar = (evento) => {
      dedos.delete(evento.pointerId);
      if (dedos.size < 2) distanciaAnterior = 0;
      if (!dedos.size) palco.dataset.arrastando = "nao";

      // Um toque que não andou é um clique: alterna entre inteira e
      // ampliada, no ponto em que a pessoa tocou.
      if (!arrastou && !dedos.size && evento.type === "pointerup") {
        zoom.escala > 1
          ? zerarZoom()
          : ampliarEmTorno(2.5, evento.clientX, evento.clientY);
      }
    };

    palco.addEventListener("pointerup", soltar);
    palco.addEventListener("pointercancel", soltar);

    palco.addEventListener(
      "wheel",
      (evento) => {
        evento.preventDefault();
        const passo = evento.deltaY < 0 ? 1.12 : 1 / 1.12;
        ampliarEmTorno(zoom.escala * passo, evento.clientX, evento.clientY);
      },
      { passive: false }
    );

    elementos.vistasFoto.addEventListener("click", (evento) => {
      const botao = evento.target.closest("[data-vista]");
      if (botao) mostrarFoto(Number(botao.dataset.vista));
    });
  }

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
             alt="${escapar(legenda(vistas[0]))}" loading="lazy"
             role="button" tabindex="0"
             title="Ver a foto maior">
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

    // A foto grande abre em tela cheia, já na vista que estava à mostra,
    // levando as outras junto para trocar lá dentro.
    const ampliar = () =>
      abrirFoto(
        vistas.map((vista) => ({
          src: vista.src,
          rotulo: vista.rotulo,
          legenda: legenda(vista),
        })),
        vistaAtual
      );

    foto.addEventListener("click", ampliar);
    foto.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        ampliar();
      }
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

  const nomeDoEstado = (sigla) => ESTADOS[sigla] || "";

  /**
   * O frete de uma entrega. Retirada e entrega em mãos têm o seu valor
   * escrito na própria opção — hoje, zero. Os Correios não: o preço sai
   * da tabela por estado, porque mandar para Barueri e mandar para
   * Roraima não custam a mesma coisa.
   *
   * Estado que não estiver na tabela sai por zero. É de propósito:
   * esquecer uma sigla faz a loja pagar o envio, não o cliente pagar um
   * número inventado.
   */
  function freteDaEntrega(idEntrega, uf) {
    const opcao = opcaoDeEntrega(idEntrega);
    if (!opcao.porEstado) return Number(opcao.frete) || 0;
    return Number((CONFIG.frete || {})[uf]) || 0;
  }

  /** O frete pelo que está escolhido no formulário agora. */
  const freteAtual = () =>
    freteDaEntrega(
      elementos.selectEntrega.value,
      enderecoDoCep ? enderecoDoCep.estado : ""
    );

  /** O que o cliente vai pagar: as peças mais o frete. */
  const totalComFrete = () => totalValor() + freteAtual();

  /* ====================================================================
     CEP
     --------------------------------------------------------------------
     O cliente digita oito números e a BrasilAPI diz de onde eles são. É
     o estado dessa resposta que define o frete, então um CEP não
     conferido impede o pedido de seguir: é melhor barrar aqui do que
     cobrar o frete errado e descobrir depois.
     ==================================================================== */

  /** 06410120 vira 06410-120 enquanto a pessoa digita. */
  function comoCep(valor) {
    const numeros = soDigitos(valor).slice(0, 8);
    return numeros.length > 5
      ? `${numeros.slice(0, 5)}-${numeros.slice(5)}`
      : numeros;
  }

  // Um CEP já perguntado não se pergunta de novo: quem corrige o número e
  // volta atrás não deveria esperar duas vezes pela mesma resposta.
  const cepsConhecidos = new Map();

  async function perguntarCep(numeros) {
    if (cepsConhecidos.has(numeros)) return cepsConhecidos.get(numeros);

    const resposta = await fetch(`${API_CEP}/${numeros}`);
    if (!resposta.ok) throw new Error("CEP não encontrado");

    const dados = await resposta.json();
    const endereco = {
      cep: comoCep(numeros),
      estado: dados.state || "",
      cidade: dados.city || "",
      bairro: dados.neighborhood || "",
      rua: dados.street || "",
    };

    cepsConhecidos.set(numeros, endereco);
    return endereco;
  }

  function mostrarAchado(texto, procurando) {
    elementos.cepEndereco.textContent = texto;
    elementos.cepEndereco.hidden = !texto;
    elementos.cepEndereco.classList.toggle("campo__achado--buscando", !!procurando);
  }

  /**
   * Respostas da rede chegam fora de ordem: quem digita depressa pode
   * ver a resposta de um CEP que já apagou. Esta contagem garante que só
   * a última pergunta feita tem direito de mexer na tela.
   */
  let perguntaMaisRecente = 0;

  async function conferirCep() {
    const campo = elementos.campoCep;
    campo.value = comoCep(campo.value);

    const numeros = soDigitos(campo.value);
    const minha = ++perguntaMaisRecente;

    if (numeros.length < 8) {
      enderecoDoCep = null;
      mostrarAchado("");
      desenharTudo();
      return;
    }

    mostrarAchado("Procurando o endereço…", true);

    try {
      const endereco = await perguntarCep(numeros);
      if (minha !== perguntaMaisRecente) return;

      enderecoDoCep = endereco;
      campo.removeAttribute("aria-invalid");
      esconderErro("cep");

      const onde = [endereco.bairro, endereco.cidade].filter(Boolean).join(", ");
      mostrarAchado(`${onde} — ${nomeDoEstado(endereco.estado)}`);
    } catch (erro) {
      if (minha !== perguntaMaisRecente) return;

      enderecoDoCep = null;
      mostrarAchado("");
      mostrarErro("cep", "Não encontramos esse CEP. Confira os números.");
    }

    desenharTudo();
  }

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
      ${desenharFrete()}
      <div class="resumo__total">
        <span>Total</span>
        <strong>${emReais(totalComFrete())}</strong>
      </div>`;
  }

  /**
   * As duas linhas que separam peça de entrega. Só aparecem quando há
   * frete a cobrar: num pedido que será retirado em mãos, "Peças" e
   * "Total" seriam o mesmo número dito duas vezes.
   */
  function desenharFrete() {
    const frete = freteAtual();
    if (frete <= 0) return "";

    const estado = enderecoDoCep ? nomeDoEstado(enderecoDoCep.estado) : "";

    return `
      <div class="resumo__linha">
        <span>Peças</span>
        <span>${emReais(totalValor())}</span>
      </div>
      <div class="resumo__linha">
        <span>Frete${estado ? ` para ${escapar(estado)}` : ""}</span>
        <span>${emReais(frete)}</span>
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

  /** Apaga o aviso de um campo só, sem mexer nos outros. */
  function esconderErro(campo) {
    const aviso = document.querySelector(`[data-erro-de="${campo}"]`);
    if (aviso) {
      aviso.hidden = true;
      aviso.textContent = "";
    }
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

    // Sem o endereço conferido não há estado, e sem estado não há frete.
    if (soDigitos(dados.cep).length !== 8) {
      erros.push(["cep", "Informe o seu CEP, com os oito números."]);
    } else if (!enderecoDoCep) {
      erros.push(["cep", "Ainda estamos conferindo esse CEP. Aguarde um instante."]);
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
      cep: formulario.get("cep") || "",
      entrega: formulario.get("entrega") || "",
      observacoes: formulario.get("observacoes") || "",

      // Não vêm do formulário: vêm da resposta da BrasilAPI ao CEP.
      cidade: enderecoDoCep ? enderecoDoCep.cidade : "",
      estado: enderecoDoCep ? enderecoDoCep.estado : "",
      bairro: enderecoDoCep ? enderecoDoCep.bairro : "",
      rua: enderecoDoCep ? enderecoDoCep.rua : "",
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

    const frete = freteDaEntrega(dados.entrega, dados.estado);
    if (frete > 0) {
      itens.push({
        quantity: 1,
        price: emCentavos(frete),
        description: `Frete para ${nomeDoEstado(dados.estado) || dados.estado}`,
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
      // "total" é o que foi cobrado, frete incluído: é com ele que a
      // volta do checkout descobre quanto do valor pago virou juro de
      // parcelamento. O frete vai à parte para poder ser dito por nome.
      const frete = freteDaEntrega(dados.entrega, dados.estado);
      guardarEmAndamento({
        numeroPedido,
        slug,
        dados,
        itens: pedido,
        frete,
        total: totalValor() + frete,
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
    pedido.length ? `Pagar ${emReais(totalComFrete())}` : "Ir para o pagamento";

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
    if (registro.frete > 0) linhas.push(["Frete", emReais(registro.frete)]);
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
        `${parcela}${emReais(registro.total)} do pedido + ${emReais(acrescimo)} de acréscimo do parcelamento.`;
    }

    const temComprovante = Boolean(retorno.comprovante);
    elementos.pagamentoComprovante.hidden = !temComprovante;
    if (temComprovante) elementos.pagamentoComprovante.href = retorno.comprovante;

    const conversa = linkDoAtendimento(
      recusado
        ? mensagemDeProblema(numero, registro, retorno, consulta)
        : mensagemDeEntrega(numero, registro, retorno, consulta)
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
      temComprovante &&
      linkDoAtendimento(
        mensagemDeComprovante(numero, registro, retorno, consulta)
      );
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

  /**
   * As mensagens chegam na loja como um cartão: uma chamada em negrito,
   * uma régua e os dados em linhas curtas. O WhatsApp não tem cartão de
   * verdade em link wa.me — só texto —, então o formato é feito com o que
   * ele sabe desenhar: *negrito*, _itálico_ e o traço longo.
   *
   * A primeira linha é escolhida para ser lida na lista de conversas,
   * antes de abrir: ali a loja já sabe se foi pagamento aprovado,
   * comprovante avulso ou problema, e de qual pedido.
   */
  const REGUA = "──────────────────";

  const cartao = (titulo, numero) => [
    `*${titulo}${numero ? ` · ${numero}` : ""}*`,
    REGUA,
  ];

  /**
   * O pagamento em poucas linhas: como foi pago, quanto saiu da conta do
   * cliente e o comprovante para conferir. O valor pago costuma ser
   * maior que o preço das peças — por causa do frete, do parcelamento,
   * ou dos dois —, então a diferença vem aberta por extenso. Sem isso, a
   * loja estranharia um número que não bate com o pedido.
   */
  function dadosDoPagamento(registro, retorno, consulta) {
    const linhas = [];

    const comoPagou = comoFoiPago(retorno, consulta);
    if (comoPagou) linhas.push(`*Pagamento:* ${comoPagou}`);

    const pago = consulta.valorPago;
    if (pago) {
      linhas.push(`*Total pago:* ${emReais(pago)}`);

      const frete = registro.frete || 0;
      const pecas = (registro.total || 0) - frete;
      const acrescimo = registro.total ? pago - registro.total : 0;

      const parcelas = [];
      if (frete > 0 || acrescimo > 0.009) {
        if (pecas > 0) parcelas.push(`${emReais(pecas)} em peças`);
        if (frete > 0) parcelas.push(`${emReais(frete)} de frete`);
        if (acrescimo > 0.009) {
          parcelas.push(`${emReais(acrescimo)} de acréscimo do parcelamento`);
        }
        linhas.push(`_${parcelas.join(" + ")}_`);
      }
    } else if (registro.total) {
      linhas.push(`*Valor do pedido:* ${emReais(registro.total)}`);
    }

    if (retorno.comprovante) {
      linhas.push(`*Comprovante:* ${retorno.comprovante}`);
    }

    return linhas;
  }

  /**
   * O pedido pago, inteiro. O endereço de entrega não vem aqui: ele é
   * pedido pela própria InfinitePay, numa etapa obrigatória do checkout,
   * e a loja o consulta no aplicativo pelo número do pedido. O que esta
   * mensagem acrescenta é o que a InfinitePay não sabe — a forma de
   * envio combinada, as observações e quais peças separar.
   */
  function mensagemDeEntrega(numero, registro, retorno, consulta) {
    const dados = registro.dados || {};
    const entrega = opcaoDeEntrega(dados.entrega).nome || "-";

    const linhas = [
      ...cartao("PEDIDO PAGO", numero),
      ...dadosDoPagamento(registro, retorno, consulta),
      REGUA,
      `*Cliente:* ${(dados.nome || "").trim()}`,
      `*CEP:* ${dados.cep || "-"}`,
      `*Cidade:* ${[(dados.cidade || "").trim(), dados.estado].filter(Boolean).join(" - ")}`,
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

    linhas.push(
      "",
      "Olá! Acabei de pagar no site. O endereço de entrega é o que preenchi no checkout da InfinitePay."
    );

    return linhas.join("\n");
  }

  /** Só a prova do pagamento, para quem já combinou a entrega. */
  function mensagemDeComprovante(numero, registro, retorno, consulta) {
    return [
      ...cartao("COMPROVANTE", numero),
      ...dadosDoPagamento(registro, retorno, consulta),
      "",
      "Olá! Segue o comprovante do meu pagamento.",
    ].join("\n");
  }

  /**
   * O pagamento que a InfinitePay não confirmou. Os dados vão junto
   * justamente porque é aqui que eles mais importam: com o comprovante e
   * o número do pedido em mãos, a loja resolve sem ter que entrevistar
   * um cliente que acabou de levar um susto.
   */
  function mensagemDeProblema(numero, registro, retorno, consulta) {
    return [
      ...cartao("PAGAMENTO NÃO CONFIRMADO", numero),
      ...dadosDoPagamento(registro, retorno, consulta),
      "",
      "Olá! Tentei pagar no site e o pagamento não foi confirmado. Podem me ajudar?",
    ].join("\n");
  }

  /* ====================================================================
     Eventos
     ==================================================================== */

  function ligarEventos() {
    // CEP e forma de entrega mudam o frete, e o frete muda o total e o
    // valor escrito no botão. Quem escolhe precisa ver o preço mexer
    // ali, não descobrir no checkout.
    elementos.campoCep.addEventListener("input", conferirCep);
    elementos.selectEntrega.addEventListener("change", desenharTudo);

    elementos.fecharSanto.addEventListener("click", () =>
      elementos.janelaSanto.close()
    );

    // Clique fora do conteúdo: num <dialog> o alvo só é o próprio diálogo
    // quando a pessoa acerta o fundo escurecido. O Esc o navegador já fecha.
    elementos.janelaSanto.addEventListener("click", (evento) => {
      if (evento.target === elementos.janelaSanto) elementos.janelaSanto.close();
    });

    elementos.fecharFoto.addEventListener("click", () =>
      elementos.janelaFoto.close()
    );

    // Sair da janela não deve guardar o zoom: quem abrir a próxima foto
    // espera vê-la inteira.
    elementos.janelaFoto.addEventListener("close", zerarZoom);

    elementos.janelaFoto.addEventListener("click", (evento) => {
      if (evento.target === elementos.janelaFoto) elementos.janelaFoto.close();
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
    ligarZoomDaFoto();
    conferirVoltaDoPagamento();
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", iniciar)
    : iniciar();
})();
