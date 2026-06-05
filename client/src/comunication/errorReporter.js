import api from '../api/api';

let ultimoEnvio = 0;
const MIN_INTERVAL_MS = 5000;

/**
 * Envia um relatório de erro para o servidor de forma fire-and-forget.
 * Útil pra diagnosticar problemas que o usuário não consegue descrever
 * (ex.: "ficou carregando", "tela branca").
 *
 * Throttled em 5s/IP no servidor + 5s local pra evitar flood.
 */
export const reportarErro = (tipo, mensagem, extras = {}) => {
    const agora = Date.now();
    if (agora - ultimoEnvio < MIN_INTERVAL_MS) return;
    ultimoEnvio = agora;

    const payload = {
        tipo,
        mensagem: typeof mensagem === 'string' ? mensagem : String(mensagem),
        stack: extras.stack,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        contexto: {
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            online: typeof navigator !== 'undefined' ? navigator.onLine : undefined,
            ...extras.contexto,
        },
    };

    // fire-and-forget, ignora qualquer falha
    api.post('/client-error', payload, { withCredentials: false }).catch(() => {});
};

/**
 * Instala listeners globais que capturam erros não tratados e os reportam.
 * Idempotente — chamar várias vezes não duplica listeners.
 */
let instalado = false;
export const instalarCapturaGlobal = () => {
    if (instalado || typeof window === 'undefined') return;
    instalado = true;

    window.addEventListener('error', (event) => {
        reportarErro('window.error', event.message || 'erro desconhecido', {
            stack: event.error && event.error.stack,
            contexto: {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
            },
        });
    });

    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        reportarErro('unhandledrejection',
            (reason && (reason.message || String(reason))) || 'promise rejeitada',
            { stack: reason && reason.stack }
        );
    });
};
