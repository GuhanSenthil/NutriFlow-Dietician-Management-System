import React, { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import { Patient, Dietician } from '../../types';
import Button from '../common/Button';
import Icon from '../common/Icon';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient;
    dietician: Dietician;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, patient, dietician }) => {
    const { user } = useAuth();
    const chatId = [patient.id, dietician.id].sort().join('_');
    const { messages, sendMessage } = useChat(chatId);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = () => {
        if (newMessage.trim() && user) {
            sendMessage(newMessage, user.id, user.role === 'PATIENT' ? dietician.id : patient.id);
            setNewMessage('');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Chat with ${dietician.name}`}>
            <div className="flex flex-col h-[60vh]">
                <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-t-md">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.senderId === user?.id ? 'bg-primary-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t flex items-center bg-white rounded-b-md">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-grow w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Type a message..."
                    />
                    <Button onClick={handleSend} className="rounded-l-none">
                        <Icon name="send" className="h-5 w-5"/>
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ChatModal;
