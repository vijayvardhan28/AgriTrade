import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff } from 'lucide-react';

const VoiceBot = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const navigate = useNavigate();

    // Speech Recognition Setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'te-IN'; // Telugu
    recognition.continuous = false;
    recognition.interimResults = false;

    const toggleListening = () => {
        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            recognition.start();
            setIsListening(true);
            setTranscript('Listening...');
        }
    };

    recognition.onresult = (event) => {
        const speechToText = event.results[0][0].transcript;
        setTranscript(speechToText);
        processCommand(speechToText);
        setIsListening(false);
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        setTranscript('Error. Try again.');
    };

    // Fuzzy Matching Logic
    const processCommand = (text) => {
        const lowerText = text.toLowerCase();
        console.log("Detected Speech:", lowerText);

        // Keywords
        const keywords = {
            PRICE: ['ధర', 'రేట్', 'మార్కెట్', 'వెల', 'price', 'rate'],
            LOAN: ['లోన్', 'అప్పు', 'డబ్బు', 'loan'],
            SCHEMES: ['పథకం', 'సబ్సిడీ', 'యోజన', 'scheme', 'subsidy'],
            CROPS: {
                'Paddy': ['వరి', 'బియ్యం', 'paddy', 'rice'],
                'Maize': ['మక్క', 'maize', 'corn'],
                'Cotton': ['పత్తి', 'cotton'],
                'Wheat': ['గోధుమ', 'wheat'],
                'Groundnut': ['వేరుశనగ', 'groundnut']
            },
            DISTRICTS: {
                'Warangal': ['వరంగల్', 'warangal'],
                'Karimnagar': ['కరీంనగర్', 'karimnagar'],
                'Nalgonda': ['నల్గొండ', 'nalgonda'],
                'Adilabad': ['ఆదిలాబాద్', 'adilabad'],
                'Khammam': ['ఖమ్మం', 'khammam']
            }
        };

        // Helper for fuzzy match
        const containsKeyword = (text, keywordList) => {
            return keywordList.some(keyword => text.includes(keyword));
        };

        // Intent Detection
        let intent = null;
        let detectedCrop = '';
        let detectedDistrict = '';

        if (containsKeyword(lowerText, keywords.PRICE)) intent = 'PRICE';
        else if (containsKeyword(lowerText, keywords.LOAN)) intent = 'LOAN';
        else if (containsKeyword(lowerText, keywords.SCHEMES)) intent = 'SCHEMES';

        // Extract Entities
        for (const [crop, synonyms] of Object.entries(keywords.CROPS)) {
            if (containsKeyword(lowerText, synonyms)) {
                detectedCrop = crop;
                if (!intent) intent = 'PRICE'; // Default to price if crop mentioned
                break;
            }
        }

        for (const [district, synonyms] of Object.entries(keywords.DISTRICTS)) {
            if (containsKeyword(lowerText, synonyms)) {
                detectedDistrict = district;
                break;
            }
        }

        // Navigation Logic
        if (intent === 'PRICE') {
            navigate('/finance', { state: { crop: detectedCrop, district: detectedDistrict, autoTrigger: true } });
        } else if (intent === 'LOAN') {
            navigate('/loan-calculator');
        } else if (intent === 'SCHEMES') {
            navigate('/schemes');
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            {transcript && (
                <div className="bg-white p-2 rounded shadow-lg border border-gray-200 text-sm max-w-xs">
                    {transcript}
                </div>
            )}
            <button
                onClick={toggleListening}
                className={`p-4 rounded-full shadow-xl transition-all transform hover:scale-110 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-600'
                    } text-white`}
            >
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
        </div>
    );
};

export default VoiceBot;
