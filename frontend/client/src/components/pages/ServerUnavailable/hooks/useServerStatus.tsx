import { useState, useEffect } from 'react';
import axios from 'axios';

export const useServerStatus = () => {
    const [isServerAvailable, setIsServerAvailable] = useState<boolean | null>(null);
    const [checking, setChecking] = useState(true);

    const checkServer = async () => {
        setChecking(true);
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5027/api';
            await axios.get(`${apiUrl}/Health/ping`, { timeout: 5000 });
            setIsServerAvailable(true);
        } catch (error) {
            setIsServerAvailable(false);
        } finally {
            setChecking(false);
        }
    };

    useEffect(() => {
        checkServer();
        
        const interval = setInterval(checkServer, 30000);
        
        return () => clearInterval(interval);
    }, []);

    return { isServerAvailable, checking, checkServer };
};