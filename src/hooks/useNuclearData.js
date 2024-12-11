import { useState, useEffect } from 'react';
import nuclearPowerPlants from '../data/nuclear_power_plants.json';

export const useNuclearData = () => {
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            // Since we're importing the JSON directly, we can just set it
            setPlants(nuclearPowerPlants);
            setLoading(false);
        } catch (err) {
            setError(err);
            setLoading(false);
            console.error('Error loading nuclear power plant data:', err);
        }
    }, []);

    return {
        plants,
        loading,
        error,
    };
};