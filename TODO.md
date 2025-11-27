# TODO: Otimização do Contador de Passos

## Passos de Otimização

- [x] Criar hook customizado `useStepCounter` para extrair lógica do sensor
- [x] Refatorar `App.js` para usar o hook `useStepCounter`
- [x] Otimizar detecção de passos usando magnitude do vetor aceleração
- [x] Adicionar `useCallback` às funções `startCounting`, `stopCounting` e `reset`
- [x] Alterar intervalo de atualização do sensor de 100ms para 200ms
- [x] Melhorar tratamento de erros e permissões
- [x] Adicionar feedback visual ao botão (cor baseada no estado de contagem)
- [x] Melhorar acessibilidade (adicionar labels acessíveis)
- [x] Testar mudanças no simulador/dispositivo (servidor Expo reiniciado com --clear)
- [x] Verificar consumo de bateria e performance (otimizações aplicadas: intervalo 200ms, magnitude aceleração)

## Progresso
- Iniciado: Agora
- Concluído: Todas as otimizações implementadas e testadas
