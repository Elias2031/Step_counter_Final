import React from "react";
import { View, Text, StyleSheet, Button, Alert, Platform } from "react-native";
import { useStepCounter } from "./hooks/useStepCounter";

export default function App() {
    const { stepCount, isCounting, available, startCounting, stopCounting, resetCount } = useStepCounter();

    const handleStartStop = async () => {
        if (Platform.OS === "web") {
            Alert.alert("Aviso", "Sensores não funcionam no navegador. Teste no app Expo Go.");
            return;
        }
        if (available === false) {
            Alert.alert("Indisponível", "Sensor de movimento não disponível neste dispositivo.");
            return;
        }
        if (isCounting) {
            stopCounting();
        } else {
            const success = await startCounting();
            if (!success) {
                Alert.alert("Erro", "Falha ao iniciar contagem. Verifique permissões.");
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Contador de Passos</Text>
            <Text style={styles.counter}>{stepCount}</Text>
            <Text style={styles.label}>Passos</Text>
            <View style={styles.buttonContainer}>
                <Button
                    title={isCounting ? "Parar Contagem" : "Iniciar Contagem"}
                    onPress={handleStartStop}
                    color={isCounting ? "#ff4444" : "#4CAF50"}
                    accessibilityLabel={isCounting ? "Parar contagem de passos" : "Iniciar contagem de passos"}
                />
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    title="Resetar"
                    onPress={resetCount}
                    color="#2196F3"
                    accessibilityLabel="Resetar contador de passos"
                />
            </View>
            {Platform.OS === "web" && <Text style={styles.note}>💡 Use o app Expo Go (no navegador não funciona).</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5", padding: 20 },
    title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
    counter: { fontSize: 60, fontWeight: "bold", color: "#007bff" },
    label: { fontSize: 18, marginVertical: 10 },
    buttonContainer: { marginVertical: 5, width: '80%' },
    note: { marginTop: 12, fontSize: 12, color: "#888", textAlign: "center" }
});
