import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Button, Alert, Platform } from "react-native";
import { DeviceMotion } from "expo-sensors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
    const [stepCount, setStepCount] = useState(0);
    const [isCounting, setIsCounting] = useState(false);
    const [lastStepTime, setLastStepTime] = useState(0);
    const [available, setAvailable] = useState(null);
    const subscriptionRef = useRef(null);

    const STEP_THRESHOLD = 1.5;
    const STEP_DEBOUNCE = 500;

    useEffect(() => {
        DeviceMotion.isAvailableAsync()
            .then(setAvailable)
            .catch(() => setAvailable(false));
    }, []);

    useEffect(() => {
        AsyncStorage.getItem("stepCount").then((saved) => {
            if (saved !== null) setStepCount(parseInt(saved, 10));
        });
    }, []);

    useEffect(() => {
        AsyncStorage.setItem("stepCount", String(stepCount)).catch(() => { });
    }, [stepCount]);

    const requestPermissionIfNeeded = async () => {
        if (DeviceMotion && typeof DeviceMotion.requestPermissionsAsync === "function") {
            try {
                const { status } = await DeviceMotion.requestPermissionsAsync();
                return status === "granted";
            } catch (error) {
                console.log("Erro ao solicitar permissão:", error);
                return false;
            }
        }
        return true; // Android geralmente não precisa
    };

    const startCounting = async () => {
        if (Platform.OS === "web") {
            Alert.alert("Aviso", "Sensores não funcionam no navegador. Teste no app Expo Go.");
            return;
        }
        if (available === false) {
            Alert.alert("Indisponível", "Sensor de movimento não disponível neste dispositivo.");
            return;
        }
        const ok = await requestPermissionIfNeeded();
        if (!ok) {
            Alert.alert("Permissão negada", "Ative a permissão de Movimento/Preparo Físico.");
            return;
        }
        DeviceMotion.setUpdateInterval(100);
        subscriptionRef.current = DeviceMotion.addListener(({ acceleration }) => {
            if (!acceleration) return;
            const now = Date.now();
            if (
                (acceleration.z > STEP_THRESHOLD || acceleration.z < -STEP_THRESHOLD) &&
                now - lastStepTime > STEP_DEBOUNCE
            ) {
                setStepCount((p) => p + 1);
                setLastStepTime(now);
            }
        });
        setIsCounting(true);
    };

    const stopCounting = () => {
        if (subscriptionRef.current) {
            subscriptionRef.current.remove();
            subscriptionRef.current = null;
        }
        setIsCounting(false);
    };

    useEffect(() => () => stopCounting(), []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Contador de Passos</Text>
            <Text style={styles.counter}>{stepCount}</Text>
            <Text style={styles.label}>Passos</Text>
            <Button title={isCounting ? "Parar Contagem" : "Iniciar Contagem"} onPress={isCounting ? stopCounting : startCounting} />
            <View style={{ marginTop: 10 }}>
                <Button title="Resetar" onPress={() => setStepCount(0)} />
            </View>
            {Platform.OS === "web" && <Text style={styles.note}>?? Use o app Expo Go (no navegador não funciona).</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5", padding: 20 },
    title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
    counter: { fontSize: 60, fontWeight: "bold", color: "#007bff" },
    label: { fontSize: 18, marginVertical: 10 },
    note: { marginTop: 12, fontSize: 12, color: "#888", textAlign: "center" }
});
