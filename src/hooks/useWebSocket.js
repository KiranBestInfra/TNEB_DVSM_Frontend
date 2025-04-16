import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
const VITE_SOCKET_BASE_URL = import.meta.env.VITE_SOCKET_BASE_URL;

const useWebSocket = (onMessage) => {
    const socket = useRef(null);

    const connect = useCallback(() => {
        socket.current = io(VITE_SOCKET_BASE_URL, {
            reconnectionAttempts: 5,
            reconnectionDelay: 5000,
            autoConnect: true,
        });

        socket.current.on('connect', () => {
            console.log('Socket.IO Connected');
        });

        socket.current.on('message', (data) => {
            try {
                onMessage(data);
            } catch (error) {
                console.error('Error handling Socket.IO message:', error);
            }
        });

        socket.current.on('error', (error) => {
            console.error('Socket.IO error:', error);
        });

        socket.current.on('disconnect', () => {
            console.log('Socket.IO Disconnected');
        });
    }, [onMessage]);

    useEffect(() => {
        connect();

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [connect]);

    const sendMessage = useCallback((message) => {
        if (socket.current && socket.current.connected) {
            socket.current.emit('subscribe', message);
        }
    }, []);

    return { sendMessage };
};

export default useWebSocket;
