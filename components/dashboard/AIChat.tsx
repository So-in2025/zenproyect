
import React, { useState, useEffect, useRef } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { sendMessageToGemini } from '../../services/geminiService';
import { fetchPricingData } from '../../services/pricingService';
import { useDashboardDispatch } from '../../contexts/DashboardContext';
import type { ChatMessage, AllServices, MonthlyPlan, GeminiResponse } from '../../types';

const AIChat: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pricingData, setPricingData] = useState<{ allServices: AllServices; monthlyPlans: MonthlyPlan[] } | null>(null);
    const dispatch = useDashboardDispatch();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchPricingData();
            setPricingData(data);
        };
        loadData();
        
        const welcomeMessage: ChatMessage = {
            role: 'model',
            parts: [{ text: '¡Hola! Soy Zen Assistant. Describe el proyecto de tu cliente y te ayudaré a seleccionar los servicios.' }]
        };
        setMessages([welcomeMessage]);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || !pricingData) return;
        
        const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const responseText = await sendMessageToGemini(newMessages, pricingData.allServices, pricingData.monthlyPlans);
            const modelMessage: ChatMessage = { role: 'model', parts: [{ text: responseText }] };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { role: 'model', parts: [{ text: 'Lo siento, ha ocurrido un error.' }] };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const parseAndRenderModelMessage = (message: ChatMessage) => {
        try {
            const response: GeminiResponse = JSON.parse(message.parts[0].text);
            return (
                 <div>
                    <p>{response.introduction}</p>
                    <div className="mt-3 pt-3 border-t border-slate-600">
                        <p className="text-sm font-bold text-purple-300 mb-2">Servicios Recomendados:</p>
                        {response.services.map(s => (
                            <Button key={s.id} variant="ghost" className="mr-2 mb-2" onClick={() => handleServiceAdd(s)}>
                                Añadir {s.name}
                            </Button>
                        ))}
                    </div>
                    {/* Render client_questions, sales_pitch etc. */}
                </div>
            );
        } catch (e) {
            return <p>{message.parts[0].text.replace(/\n/g, '<br />')}</p>;
        }
    };
    
    const handleServiceAdd = (service: GeminiResponse['services'][0]) => {
        // This logic would need to find the service in pricing data or add a new custom one
        console.log("Adding service:", service);
        alert(`Funcionalidad para añadir "${service.name}" no implementada en este ejemplo.`);
    };

    return (
        <Card className="flex flex-col h-[500px] mb-8">
            <div className="flex items-center mb-4">
                <h2 className="text-2xl font-semibold text-purple-400">Asistente IA de Ventas</h2>
                <span className="ml-3 h-3 w-3 bg-green-400 rounded-full animate-pulse"></span>
            </div>
            
            <div className="flex-grow space-y-4 overflow-y-auto p-2 bg-slate-900/50 rounded-lg border border-slate-700">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-cyan-500 text-slate-900 rounded-br-none' : 'bg-slate-700 text-slate-50 rounded-bl-none'}`}>
                            {msg.role === 'model' ? parseAndRenderModelMessage(msg) : msg.parts[0].text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="bg-slate-700 rounded-bl-none p-3 flex items-center space-x-1">
                           <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                           <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                           <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-700">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="w-full p-3 bg-slate-700 text-slate-300 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-400"
                    placeholder="Necesito una web para..."
                    disabled={isLoading}
                />
                <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.546l4.209-1.202a.75.75 0 01.531 1.343l-4.21 1.202a.75.75 0 00-.95.546l-1.414 4.95a.75.75 0 00.826.95L19 10.354a.75.75 0 000-1.418L3.105 2.289z" />
                    </svg>
                </Button>
            </div>
        </Card>
    );
};

export default AIChat;
