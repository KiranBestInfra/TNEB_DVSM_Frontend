import { useEffect, useRef, useCallback } from 'react';

const useWebSocket = (url, onMessage) => {
    const ws = useRef(null);

    const connect = useCallback(() => {
        ws.current = new WebSocket(url);

        ws.current.onopen = () => {
            console.log('WebSocket Connected');
        };

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.current.onclose = () => {
            console.log('WebSocket Disconnected');
            setTimeout(connect, 5000);
        };
    }, [url, onMessage]);

    useEffect(() => {
        connect();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [connect]);

    const sendMessage = useCallback((message) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message));
        }
    }, []);

    return { sendMessage };
};

export default useWebSocket;
