
import { useState, useEffect, useCallback } from 'react';

export const useSpeech = () => {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(localStorage.getItem('zenAssistantVoiceURI'));
    const [isPlaying, setIsPlaying] = useState(false);
    const synth = window.speechSynthesis;

    const loadVoices = useCallback(() => {
        const availableVoices = synth.getVoices().filter(v => v.lang.startsWith('es'));
        setVoices(availableVoices);
        if (!selectedVoiceURI && availableVoices.length > 0) {
            const googleVoice = availableVoices.find(v => v.name.includes('Google') && v.name.includes('español')) || availableVoices[0];
            if (googleVoice) {
                const uri = googleVoice.voiceURI;
                setSelectedVoiceURI(uri);
                localStorage.setItem('zenAssistantVoiceURI', uri);
            }
        }
    }, [synth, selectedVoiceURI]);

    useEffect(() => {
        loadVoices();
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = loadVoices;
        }
        return () => {
            synth.cancel();
        };
    }, [loadVoices, synth]);

    const speak = useCallback((text: string, onEndCallback?: () => void) => {
        if (synth.speaking) {
            synth.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
        
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        
        utterance.lang = 'es-ES';
        utterance.rate = 1.15;
        utterance.pitch = 1;

        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => {
            setIsPlaying(false);
            if (onEndCallback) onEndCallback();
        };
        utterance.onerror = () => {
            setIsPlaying(false);
            console.error("SpeechSynthesisUtterance.onerror");
        };

        synth.speak(utterance);
    }, [synth, voices, selectedVoiceURI]);

    const cancel = useCallback(() => {
        synth.cancel();
        setIsPlaying(false);
    }, [synth]);

    return { voices, selectedVoiceURI, setSelectedVoiceURI, isPlaying, speak, cancel };
};
