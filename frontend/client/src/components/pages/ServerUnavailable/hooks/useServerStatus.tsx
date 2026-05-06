// hooks/useServerStatus.ts
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export const useServerStatus = () => {
    const [isServerAvailable, setIsServerAvailable] = useState<boolean | null>(null);
    const [checking, setChecking] = useState(true);
    const isCheckingRef = useRef(false);

    const checkServer = async () => {
        if (isCheckingRef.current) return;
        
        isCheckingRef.current = true;
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5027/api';
            await axios.get(`${apiUrl}/Health/ping`, { timeout: 5000 });
            setIsServerAvailable(true);
        } catch (error) {
            setIsServerAvailable(false);
        } finally {
            setChecking(false);
            isCheckingRef.current = false;
        }
    };

    useEffect(() => {
        checkServer();
    }, []);

    return { isServerAvailable, checking, checkServer };
};