import { apiClient } from '../api/client';

const sendLogToBackend = async (level, message, stack = '') => {
    try {
        await apiClient.post('/log/error', {
            level,
            message,
            stack,
            time: new Date().toISOString(),
        });
    } catch (err) {
        window.originalConsole?.log('Failed to send log:', err);
    }
};

// Helper to format %s-style arguments and general args
const formatConsoleArgs = (args) => {
    if (typeof args[0] === 'string' && args[0].includes('%s')) {
        // Format %s style messages
        let formatted = args[0];
        let index = 1;
        formatted = formatted.replace(/%s/g, () => args[index++] ?? '');
        return (
            formatted +
            ' ' +
            args
                .slice(index)
                .map((arg) => {
                    return typeof arg === 'string' ? arg : JSON.stringify(arg);
                })
                .join(' ')
        );
    }

    return args
        .map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
        .join(' ');
};

const interceptConsole = () => {
    if (!window.originalConsole) {
        window.originalConsole = {
            warn: console.warn,
            error: console.error,
            log: console.log,
        };
    }

    console.warn = (...args) => {
        const message = formatConsoleArgs(args);
        sendLogToBackend('warn', message, new Error().stack);
        window.originalConsole.warn(...args);
    };

    console.error = (...args) => {
        const message = formatConsoleArgs(args);
        sendLogToBackend('error', message, new Error().stack);
        window.originalConsole.error(...args);
    };

    window.onerror = (message, source, lineno, colno, error) => {
        sendLogToBackend(
            'error',
            `${message} at ${source}:${lineno}:${colno}`,
            error?.stack || ''
        );
    };

    window.onunhandledrejection = (event) => {
        sendLogToBackend(
            'error',
            event.reason?.message || 'Unhandled promise rejection',
            event.reason?.stack || ''
        );
    };
};

export default interceptConsole;
