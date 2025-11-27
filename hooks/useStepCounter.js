import { useState, useEffect, useRef, useCallback } from 'react';
import { DeviceMotion } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STEP_THRESHOLD = 1.5;
const STEP_DEBOUNCE = 500;
const UPDATE_INTERVAL = 200; // Otimizado de 100ms para 200ms

export const useStepCounter = () => {
    const [stepCount, setStepCount] = useState(0);
    const [isCounting, setIsCounting] = useState(false);
    const [available, setAvailable] = useState(null);
    const lastStepTimeRef = useRef(0);
    const subscriptionRef = useRef(null);

    useEffect(() => {
        DeviceMotion.isAvailableAsync()
            .then(setAvailable)
            .catch(() => setAvailable(false));
    }, []);

    useEffect(() => {
        AsyncStorage.getItem('stepCount').then((saved) => {
            if (saved !== null) setStepCount(parseInt(saved, 10));
        });
    }, []);

    useEffect(() => {
        AsyncStorage.setItem('stepCount', String(stepCount)).catch(() => {});
    }, [stepCount]);

    const requestPermissionIfNeeded = useCallback(async () => {
        if (DeviceMotion && typeof DeviceMotion.requestPermissionsAsync === 'function') {
            try {
                const { status } = await DeviceMotion.requestPermissionsAsync();
                return status === 'granted';
            } catch (error) {
                console.log('Erro ao solicitar permissão:', error);
                return false;
            }
        }
        return true;
    }, []);

    const startCounting = useCallback(async () => {
        if (available === false) return false;
        const ok = await requestPermissionIfNeeded();
        if (!ok) return false;

        DeviceMotion.setUpdateInterval(UPDATE_INTERVAL);
        subscriptionRef.current = DeviceMotion.addListener(({ acceleration }) => {
            if (!acceleration) return;
            const now = Date.now();
            // Otimizado: usar magnitude do vetor aceleração
            const magnitude = Math.sqrt(
                acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2
            );
            if (magnitude > STEP_THRESHOLD && now - lastStepTimeRef.current > STEP_DEBOUNCE) {
                setStepCount((prev) => prev + 1);
                lastStepTimeRef.current = now;
            }
        });
        setIsCounting(true);
        return true;
    }, [available, requestPermissionIfNeeded]);

    const stopCounting = useCallback(() => {
        if (subscriptionRef.current) {
            subscriptionRef.current.remove();
            subscriptionRef.current = null;
        }
        setIsCounting(false);
    }, []);

    const resetCount = useCallback(() => {
        setStepCount(0);
    }, []);

    useEffect(() => {
        return () => stopCounting();
    }, [stopCounting]);

    return {
        stepCount,
        isCounting,
        available,
        startCounting,
        stopCounting,
        resetCount,
    };
};
