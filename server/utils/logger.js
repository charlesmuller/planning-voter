const fs = require('fs');
const path = require('path');

const LEVELS = {
    debug: 10,
    info: 20,
    warning: 30,
    error: 40,
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

class Logger {
    constructor(options = {}) {
        this.logDir = options.logDir || path.join(__dirname, '..', 'storage', 'logs');
        this.minLevel = LEVELS[options.minLevel] || LEVELS.info;
        this.alsoConsole = options.alsoConsole !== false;
        this.retentionDays = Number(options.retentionDays) > 0 ? Number(options.retentionDays) : 15;

        try {
            fs.mkdirSync(this.logDir, { recursive: true });
        } catch (err) {
            console.error('Falha ao criar diretório de logs:', err);
        }

        this.fileWriteDisabled = false;

        this.limparLogsAntigos();
        this.retencaoTimer = setInterval(() => this.limparLogsAntigos(), ONE_DAY_MS);
        if (this.retencaoTimer.unref) this.retencaoTimer.unref();
    }

    disableFileWrite(err) {
        if (this.fileWriteDisabled) return;
        this.fileWriteDisabled = true;
        console.error(
            `[logger] Escrita em arquivo desabilitada (${err.code || err.message}). ` +
            `Logs continuarão saindo no stdout. Verifique permissões em ${this.logDir}.`
        );
    }

    limparLogsAntigos() {
        const limite = Date.now() - this.retentionDays * ONE_DAY_MS;
        const pattern = /^app-(\d{4})-(\d{2})-(\d{2})\.log$/;

        fs.readdir(this.logDir, (err, arquivos) => {
            if (err) {
                console.error('Erro ao ler diretório de logs:', err);
                return;
            }

            arquivos.forEach((arquivo) => {
                const match = arquivo.match(pattern);
                if (!match) return;

                const [, y, m, d] = match;
                const dataArquivo = new Date(`${y}-${m}-${d}T00:00:00Z`).getTime();

                if (Number.isFinite(dataArquivo) && dataArquivo < limite) {
                    fs.unlink(path.join(this.logDir, arquivo), (unlinkErr) => {
                        if (unlinkErr) {
                            console.error(`Erro ao remover log antigo ${arquivo}:`, unlinkErr);
                            return;
                        }
                        const line = `[${this.formatTimestamp().full}] INFO: Log antigo removido pela retenção {"arquivo":"${arquivo}","retentionDays":${this.retentionDays}}\n`;
                        if (this.alsoConsole) process.stdout.write(line);
                        fs.appendFile(this.getLogFilePath(this.formatTimestamp().date), line, () => {});
                    });
                }
            });
        });
    }

    formatTimestamp(date = new Date()) {
        const pad = (n) => String(n).padStart(2, '0');
        const yyyy = date.getFullYear();
        const mm = pad(date.getMonth() + 1);
        const dd = pad(date.getDate());
        const hh = pad(date.getHours());
        const mi = pad(date.getMinutes());
        const ss = pad(date.getSeconds());
        return { date: `${yyyy}-${mm}-${dd}`, full: `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}` };
    }

    getLogFilePath(date) {
        return path.join(this.logDir, `app-${date}.log`);
    }

    write(level, message, context = {}) {
        if (LEVELS[level] < this.minLevel) return;

        const ts = this.formatTimestamp();
        const hasContext = context && Object.keys(context).length > 0;
        const contextStr = hasContext ? ` ${JSON.stringify(context)}` : '';
        const line = `[${ts.full}] ${level.toUpperCase()}: ${message}${contextStr}\n`;

        if (this.alsoConsole) {
            const out = level === 'error' ? process.stderr : process.stdout;
            out.write(line);
        }

        if (this.fileWriteDisabled) return;

        try {
            fs.appendFile(this.getLogFilePath(ts.date), line, (err) => {
                if (!err) return;
                if (['EACCES', 'EPERM', 'EROFS', 'ENOENT'].includes(err.code)) {
                    this.disableFileWrite(err);
                } else {
                    console.error('Erro ao gravar log:', err);
                }
            });
        } catch (err) {
            this.disableFileWrite(err);
        }
    }

    debug(message, context) { this.write('debug', message, context); }
    info(message, context) { this.write('info', message, context); }
    warning(message, context) { this.write('warning', message, context); }
    error(message, context) {
        if (context instanceof Error) {
            context = { message: context.message, stack: context.stack };
        }
        this.write('error', message, context);
    }
}

const logger = new Logger({
    minLevel: process.env.LOG_LEVEL || 'info',
    retentionDays: process.env.LOG_RETENTION_DAYS,
});

module.exports = logger;
module.exports.Logger = Logger;
