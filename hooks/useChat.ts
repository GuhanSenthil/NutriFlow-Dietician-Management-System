import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Message } from '../types';

export const useChat = (chatId: string) => {
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        if (!chatId) return;

        let isMounted = true;

        const fetchMessages = () => {
            // The getMessages API uses a callback pattern
            api.getMessages(chatId, (newMessages) => {
                if (isMounted) {
                    // Sort messages by timestamp to ensure order
                    const sortedMessages = [...newMessages].sort((a, b) => a.timestamp - b.timestamp);
                    setMessages(sortedMessages);
                }
            });
        };

        fetchMessages(); // Initial fetch
        const intervalId = setInterval(fetchMessages, 3000); // Poll every 3 seconds

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [chatId]);

    const sendMessage = (text: string, senderId: string, receiverId: string) => {
        if (!chatId) return;
        const message: Omit<Message, 'id'> = {
            text,
            senderId,
            receiverId,
            timestamp: Date.now(),
        };
        api.sendMessage(chatId, message).then(() => {
             // Immediately fetch messages after sending one for a snappier feel
             api.getMessages(chatId, (newMessages) => {
                const sortedMessages = [...newMessages].sort((a, b) => a.timestamp - b.timestamp);
                setMessages(sortedMessages);
             });
        });
    };

    return { messages, sendMessage };
};