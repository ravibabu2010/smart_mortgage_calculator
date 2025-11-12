import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";

export interface LocationData {
  city: string;
  state: string;
  taxRate: number;
}

interface ZipcodeSearchProps {
  onSelect: (locationData: LocationData | null) => void;
}

const locationSchema = {
    type: Type.OBJECT,
    properties: {
        city: { type: Type.STRING },
        state: { type: Type.STRING },
        taxRate: { type: Type.NUMBER, description: 'Average annual property tax rate as a decimal (e.g., 0.015 for 1.5%)' },
    },
    required: ['city', 'state', 'taxRate'],
};

// Fix: Switched from import.meta.env to process.env.API_KEY to align with guidelines and fix TypeScript error.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ZipcodeSearch: React.FC<ZipcodeSearchProps> = ({ onSelect }) => {
    const [zip, setZip] = useState('');
    const [zipCache, setZipCache] = useState<{ [key: string]: { data: LocationData; timestamp: number } }>({});
    const [foundLocation, setFoundLocation] = useState<{ city: string; state: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Allow only digits
        if (value.length <= 5) {
            setZip(value);
            if (foundLocation) {
                setFoundLocation(null);
                onSelect(null);
            }
             if (error) {
                setError(null);
            }
        }
    };

    const fetchLocationData = useCallback(async (zipCode: string) => {
        if (zipCode.length !== 5) return;
        
        const now = Date.now();
        const TEN_MINUTES_IN_MS = 10 * 60 * 1000;
        const cachedEntry = zipCache[zipCode];

        if (cachedEntry && (now - cachedEntry.timestamp < TEN_MINUTES_IN_MS)) {
            setFoundLocation({ city: cachedEntry.data.city, state: cachedEntry.data.state });
            onSelect(cachedEntry.data);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);
        setFoundLocation(null);
        onSelect(null);

        try {
            const prompt = `Provide the city, state, and average annual property tax rate as a decimal (e.g., 0.015 for 1.5%) for US zip code '${zipCode}'. Respond ONLY with a JSON object containing 'city', 'state', and 'taxRate' keys.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: locationSchema,
                },
            });
            
            const jsonText = response.text.trim();
            const locationData: LocationData = JSON.parse(jsonText);

            if (locationData && locationData.city && locationData.state && typeof locationData.taxRate === 'number') {
                setFoundLocation({ city: locationData.city, state: locationData.state });
                onSelect(locationData);
                setZipCache(prevCache => ({
                    ...prevCache,
                    [zipCode]: { data: locationData, timestamp: now }
                }));
            } else {
                throw new Error("Invalid data format received.");
            }
        } catch (e) {
            console.error("Error fetching location data:", e);
            if (e instanceof Error && (e.message.includes('429') || e.message.includes('RESOURCE_EXHAUSTED'))) {
                setError('API limit reached. Please wait a moment.');
            } else {
                setError('Zip code not found or invalid.');
            }
            onSelect(null);
        } finally {
            setIsLoading(false);
        }
    }, [onSelect, zipCache]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetchLocationData(zip);
    };

    return (
        <div>
            <form onSubmit={handleSearch} className="flex items-start space-x-2">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        id="zipcode"
                        value={zip}
                        onChange={handleZipChange}
                        placeholder="Enter a 5-Digit Zip Code"
                        autoComplete="off"
                        className="w-full bg-slate-700 border-slate-600 rounded-md pl-3 pr-4 py-2 text-white transition-all duration-200 border-2 border-transparent focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        aria-label="Property Location Zip Code"
                    />
                </div>
                <button
                    type="submit"
                    disabled={zip.length !== 5 || isLoading}
                    className="px-4 py-2 h-[42px] text-sm font-semibold text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    aria-label="Search for zip code"
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : 'Find'}
                </button>
            </form>

            <div className="mt-2 text-sm p-2.5 rounded-md text-center font-medium min-h-[40px]">
                {foundLocation && (
                    <div className="text-green-300 bg-green-800/60">
                        {foundLocation.city}, {foundLocation.state}
                    </div>
                )}
                {error && (
                    <div className="text-red-300 bg-red-800/90">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ZipcodeSearch;
