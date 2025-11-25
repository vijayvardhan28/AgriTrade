import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sprout, Bot, Mic, MicOff, Volume2, VolumeX, Globe } from 'lucide-react';
import ChatMessage from '../components/ChatMessage';
import axios from 'axios';

const AgriBotPage = () => {
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your Agri Assistant. Ask me anything about farming, crops, or weather!", isBot: true }
    ]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [autoSpeak, setAutoSpeak] = useState(true);
    const [language, setLanguage] = useState('en-IN'); // Default English (India)
    const [voices, setVoices] = useState([]);

    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const synth = window.speechSynthesis;

    const languages = [
        { code: 'en-IN', name: 'English', label: 'English' },
        { code: 'hi-IN', name: 'Hindi', label: 'हिंदी' },
        { code: 'te-IN', name: 'Telugu', label: 'తెలుగు' },
        { code: 'ta-IN', name: 'Tamil', label: 'தமிழ்' }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load voices
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = synth.getVoices();
            setVoices(availableVoices);
            // Debugging: Log available voices
            console.log("Available voices:", availableVoices.map(v => `${v.name} (${v.lang})`));
        };

        loadVoices();

        // Chrome loads voices asynchronously
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        // Fallback: Try loading again after a short delay
        const timer = setTimeout(loadVoices, 500);
        return () => clearTimeout(timer);
    }, []);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = language;

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputText(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, [language]);

    // Update recognition language when state changes
    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.lang = language;
        }
    }, [language]);

    // Text to Speech Function
    const speakText = (text) => {
        if (!autoSpeak) return;

        synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;

        // Normalize language code for comparison (e.g., 'te-IN' vs 'te_IN')
        const normalize = (tag) => tag.replace('_', '-').toLowerCase();
        const targetLang = normalize(language);

        // 1. Try exact match with "Google" (usually best quality)
        let matchingVoice = voices.find(v => normalize(v.lang) === targetLang && v.name.includes('Google'));

        // 2. Try exact match with any vendor
        if (!matchingVoice) {
            matchingVoice = voices.find(v => normalize(v.lang) === targetLang);
        }

        // 3. Try matching just the base language (e.g., 'te' from 'te-IN')
        if (!matchingVoice) {
            const baseLang = targetLang.split('-')[0];
            matchingVoice = voices.find(v => normalize(v.lang).startsWith(baseLang));
        }

        if (matchingVoice) {
            console.log(`Speaking with voice: ${matchingVoice.name}`);
            utterance.voice = matchingVoice;
        } else {
            console.warn(`No voice found for ${language}. Using default.`);
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
            console.error("TTS Error:", e);
            setIsSpeaking(false);
        };

        synth.speak(utterance);
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const toggleAutoSpeak = () => {
        if (autoSpeak) {
            synth.cancel();
            setIsSpeaking(false);
        }
        setAutoSpeak(!autoSpeak);
    };

    const handleSendMessage = async (e, overrideText = null) => {
        if (e) e.preventDefault();
        const textToSend = overrideText || inputText;

        if (!textToSend.trim()) return;

        setMessages(prev => [...prev, { text: textToSend, isBot: false }]);
        setInputText("");
        setIsLoading(true);

        synth.cancel();

        try {
            const selectedLangObj = languages.find(l => l.code === language);
            const response = await axios.post('http://127.0.0.1:5000/chatbot', {
                message: textToSend,
                history: messages.map(m => ({ role: m.isBot ? 'model' : 'user', parts: [m.text] })),
                language: selectedLangObj ? selectedLangObj.name : 'English'
            });

            const botResponse = response.data.text;
            setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
            speakText(botResponse);

        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                text: "Sorry, I'm having trouble connecting to the server. Please ensure the backend is running.",
                isBot: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 h-[80vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-full">
                            <Sprout size={32} />
                        </div>
                        <div>
                            <h1 className="font-bold text-2xl">AgriBot Assistant</h1>
                            <p className="text-green-100 flex items-center gap-2 text-sm">
                                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                                Multi-language Support
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Language Selector */}
                        <div className="relative group">
                            <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/30 transition-colors">
                                <Globe size={20} />
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 text-white font-medium cursor-pointer appearance-none pr-4"
                                    style={{ backgroundImage: 'none' }}
                                >
                                    {languages.map(lang => (
                                        <option key={lang.code} value={lang.code} className="text-gray-800">
                                            {lang.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={toggleAutoSpeak}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            title={autoSpeak ? "Mute Voice" : "Enable Voice"}
                        >
                            {autoSpeak ? <Volume2 size={24} /> : <VolumeX size={24} />}
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-6">
                    {messages.map((msg, index) => (
                        <ChatMessage key={index} message={msg.text} isBot={msg.isBot} />
                    ))}
                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0">
                                <Bot size={18} />
                            </div>
                            <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-tl-none">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-gray-100">
                    <form onSubmit={handleSendMessage} className="flex gap-4">
                        <button
                            type="button"
                            onClick={toggleListening}
                            className={`p-4 rounded-full transition-all duration-300 ${isListening
                                    ? 'bg-red-500 text-white animate-pulse shadow-red-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            title="Speak"
                        >
                            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                        </button>

                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={isListening ? "Listening..." : "Ask about crops, weather..."}
                            className="flex-1 px-6 py-4 border border-gray-200 rounded-full focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-lg"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !inputText.trim()}
                            className="bg-green-600 text-white p-4 rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AgriBotPage;
