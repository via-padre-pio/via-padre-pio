/* ==========================================================================
   Logger — Via Padre Pio
   --------------------------------------------------------------------------
   Encaminha erros e eventos do checkout para o Sentry quando
   CONFIG.observabilidade.sentryDsn estiver preenchido. Sem DSN (ou sem
   o SDK carregado), o Sentry fica quieto — o pedido segue normal.

   Em falha HTTP ≠ 200 do pagamento, também envia push via ntfy.sh quando
   ntfyTopico estiver preenchido.
   ========================================================================== */

const Logger = (function () {
  "use strict";

  let ligado = false;

  function obs() {
    return (typeof CONFIG !== "undefined" && CONFIG.observabilidade) || {};
  }

  function dsnConfigurado() {
    return String(obs().sentryDsn || "").trim();
  }

  function ntfyConfigurado() {
    const topico = String(obs().ntfyTopico || "").trim();
    const token = String(obs().ntfyToken || "").trim();
    if (!topico) return null;
    return { topico, token };
  }

  function init() {
    const dsn = dsnConfigurado();
    if (!dsn || typeof Sentry === "undefined") {
      ligado = false;
      return;
    }

    try {
      Sentry.init({
        dsn,
        environment: location.hostname || "local",
        // Sem tracing: o volume da pré-venda é baixo e o foco é pagamento.
        tracesSampleRate: 0,
        // Não manda PII automática do navegador; nós escolhemos o que vai
        // em cada evento (order_nsu, meio, status — sem WhatsApp/e-mail).
        sendDefaultPii: false,
      });
      ligado = true;
    } catch (erro) {
      ligado = false;
      console.warn("Via Padre Pio: Sentry não iniciou —", erro);
    }
  }

  /** Contexto comum: tags pesquisáveis no Sentry (order_nsu, transaction_nsu). */
  function aplicarContexto(escopo, dados) {
    if (!dados || typeof dados !== "object") return;

    if (dados.order_nsu) escopo.setTag("order_nsu", String(dados.order_nsu));
    if (dados.transaction_nsu) {
      escopo.setTag("transaction_nsu", String(dados.transaction_nsu));
    }
    if (dados.evento) escopo.setTag("via_event", String(dados.evento));

    escopo.setExtras(dados);
  }

  /**
   * Push no ntfy quando a InfinitePay (ou outra API de pagamento) responde
   * com status HTTP diferente de 200. Falha de rede do ntfy é ignorada.
   */
  function avisarHttp(dados) {
    const cfg = ntfyConfigurado();
    if (!cfg) return;

    const status = dados && dados.http_status;
    if (!Number.isFinite(status) || status === 200) return;

    const evento = (dados && dados.evento) || "http_error";
    const pedido = (dados && dados.order_nsu) || "";
    const transacao = (dados && dados.transaction_nsu) || "";
    const linhas = [
      `Evento: ${evento}`,
      `HTTP: ${status}`,
      pedido ? `Pedido: ${pedido}` : "",
      transacao ? `NSU: ${transacao}` : "",
      `Host: ${location.hostname || "local"}`,
    ].filter(Boolean);

    const headers = {
      Title: "Via Padre Pio · falha no pagamento",
      Priority: "high",
      Tags: "warning,money_with_wings",
    };
    if (cfg.token) headers.Authorization = `Bearer ${cfg.token}`;

    fetch(`https://ntfy.sh/${encodeURIComponent(cfg.topico)}`, {
      method: "POST",
      body: linhas.join("\n"),
      headers,
    }).catch(() => {
      /* sem ntfy o pedido continua; o Sentry (se ligado) já registrou */
    });
  }

  /**
   * Evento estruturado (checkout, payment_check, etc.).
   * Vira breadcrumb + mensagem no Sentry para poder filtrar por nome.
   */
  function info(evento, dados) {
    const payload = { evento, ...(dados || {}) };

    if (!ligado) return;

    Sentry.addBreadcrumb({
      category: "via.pagamento",
      message: evento,
      level: "info",
      data: payload,
    });

    Sentry.withScope((escopo) => {
      aplicarContexto(escopo, payload);
      escopo.setLevel("info");
      Sentry.captureMessage(evento);
    });
  }

  /** Falha: exception no Sentry, com extras do fluxo de pagamento. */
  function error(erro, dados) {
    const payload = { ...(dados || {}) };
    if (payload.evento) {
      /* ok */
    } else if (typeof dados === "string") {
      payload.evento = dados;
    }

    avisarHttp(payload);

    if (!ligado) {
      console.error("Via Padre Pio:", erro, payload);
      return;
    }

    Sentry.addBreadcrumb({
      category: "via.pagamento",
      message: payload.evento || "error",
      level: "error",
      data: payload,
    });

    Sentry.withScope((escopo) => {
      aplicarContexto(escopo, payload);
      const excecao =
        erro instanceof Error ? erro : new Error(String(erro || "erro"));
      Sentry.captureException(excecao);
    });
  }

  return { init, info, error };
})();
