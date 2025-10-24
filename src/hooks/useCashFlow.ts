import { useState, useCallback, useEffect, useMemo } from 'react';
import { CashFlowEntry, CashFlowExit, Cancelamento, Cheque, SaidaRetirada } from '../types';

const STORAGE_KEY = 'cashFlowData';

export const useCashFlow = () => {
  const [entries, setEntries] = useState<CashFlowEntry>({
    dinheiro: 0,
    fundoCaixa: 400,
    cartao: 0,
    cartaoLink: 0,
    clienteCartaoLink: '',
    parcelasCartaoLink: 0,
    boletos: 0,
    clienteBoletos: '',
    parcelasBoletos: 0,
    pixMaquininha: 0,
    pixConta: 0,
    cliente1Nome: '',
    cliente1Valor: 0,
    cliente2Nome: '',
    cliente2Valor: 0,
    cliente3Nome: '',
    cliente3Valor: 0,
    
    // Novos campos para PIX Conta - múltiplos clientes
    pixContaClientes: [],
    
    // Novos campos para Cartão Link - múltiplos clientes
    cartaoLinkClientes: [],
    
    // Novos campos para Boletos - múltiplos clientes
    boletosClientes: [],
    
    // Novos campos solicitados
    cheque: 0,
    cheques: [],
    outros: 0,
    outrosDescricao: '',
  });

  const [exits, setExits] = useState<CashFlowExit>({
    descontos: 0,
    saida: 0,
    justificativaSaida: '',
    justificativaCompra: '',
    valorCompra: 0,
    justificativaSaidaDinheiro: '',
    valorSaidaDinheiro: 0,
    
    // Múltiplas saídas/retiradas
    saidasRetiradas: [],
    
    devolucoes: [],
    enviosCorreios: [],
    enviosTransportadora: [],
    valesFuncionarios: [],
    valesIncluidosNoMovimento: false,
    puxadorNome: '',
    puxadorPorcentagem: 0,
    puxadorValor: 0,
    
    // Múltiplos clientes do puxador
    puxadorClientes: [],
    
    // Campos legados para compatibilidade
    creditoDevolucao: 0,
    cpfCreditoDevolucao: '',
    creditoDevolucaoIncluido: false,
    correiosFrete: 0,
    correiosTipo: '',
    correiosEstado: '',
    correiosClientes: [],
  });

  const [total, setTotal] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [cancelamentos, setCancelamentos] = useState<Cancelamento[]>([]);

  // Memoizar cálculos para melhor performance
  const totalEntradas = useMemo(() => {
    return entries.dinheiro + 
           entries.fundoCaixa + 
           entries.cartao + 
           entries.cartaoLink + 
           entries.boletos + 
           entries.pixMaquininha + 
           entries.pixConta +
           // entries.cheque removido - agora é calculado pela soma dos cheques individuais
           entries.outros;
  }, [entries]);

  const totalDevolucoes = useMemo(() => {
    return Array.isArray(exits.devolucoes)
      ? exits.devolucoes
          .filter(devolucao => devolucao.incluidoNoMovimento)
          .reduce((sum, devolucao) => sum + (Number(devolucao.valor) || 0), 0)
      : 0;
  }, [exits.devolucoes]);

  const totalEnviosCorreios = useMemo(() => {
    return Array.isArray(exits.enviosCorreios)
      ? exits.enviosCorreios
          .filter(envio => envio.incluidoNoMovimento)
          .reduce((sum, envio) => sum + (Number(envio.valor) || 0), 0)
      : 0;
  }, [exits.enviosCorreios]);

  const totalValesFuncionarios = useMemo(() => {
    return Array.isArray(exits.valesFuncionarios)
      ? exits.valesFuncionarios.reduce((sum: number, item: { nome: string; valor: number }) => sum + (Number(item.valor) || 0), 0)
      : 0;
  }, [exits.valesFuncionarios]);

  const totalSaidasRetiradas = useMemo(() => {
    return Array.isArray(exits.saidasRetiradas)
      ? exits.saidasRetiradas
          .filter(saida => saida.incluidoNoMovimento)
          .reduce((sum, saida) => sum + (Number(saida.valor) || 0), 0)
      : 0;
  }, [exits.saidasRetiradas]);

  const valesImpactoEntrada = useMemo(() => {
    return exits.valesIncluidosNoMovimento ? totalValesFuncionarios : 0;
  }, [exits.valesIncluidosNoMovimento, totalValesFuncionarios]);

  // Calcular total dos cheques individuais
  const totalCheques = useMemo(() => {
    return Array.isArray(entries.cheques)
      ? entries.cheques.reduce((sum, cheque) => sum + (Number(cheque.valor) || 0), 0)
      : 0;
  }, [entries.cheques]);

  const totalFinal = useMemo(() => {
    return totalEntradas + totalCheques + totalDevolucoes + totalEnviosCorreios + valesImpactoEntrada - totalSaidasRetiradas;
  }, [totalEntradas, totalCheques, totalDevolucoes, totalEnviosCorreios, valesImpactoEntrada, totalSaidasRetiradas]);

  // Atualizar total sempre que os valores calculados mudarem
  useEffect(() => {
    setTotal(totalFinal);
  }, [totalFinal]);

  // Funções otimizadas com useCallback
  const updateEntries = useCallback((field: keyof CashFlowEntry, value: string | number | any[]) => {
    setEntries(prev => ({
      ...prev,
      [field]: Array.isArray(value) ? value : 
                typeof value === 'string' ? value : Number(value)
    }));
    setHasChanges(true);
  }, []);

  const updateExits = useCallback((field: keyof CashFlowExit, value: number | string | boolean | any[]) => {
    setExits(prev => ({
      ...prev,
      [field]: Array.isArray(value) ? value : 
                typeof value === 'string' ? value : 
                typeof value === 'boolean' ? value : Number(value)
    }));
    setHasChanges(true);
  }, []);

  // Função para validar valores de saída
  const validateSaidaValues = useCallback(() => {
    if (exits.saida > 0) {
      const totalJustificativas = exits.valorCompra + exits.valorSaidaDinheiro;
      return totalJustificativas === exits.saida;
    }
    return true;
  }, [exits.saida, exits.valorCompra, exits.valorSaidaDinheiro]);

  // Função para validar valores PIX Conta
  const validatePixContaValues = useCallback(() => {
    // Se não há valor no PIX Conta, não precisa validar
    if (entries.pixConta <= 0) {
      return true;
    }

    // Se há valor no PIX Conta mas não há clientes, é inválido
    if (entries.pixConta > 0 && entries.pixContaClientes.length === 0) {
      return false;
    }

    const totalClientes = entries.pixContaClientes.reduce((sum, cliente) => sum + (Number(cliente.valor) || 0), 0);
    // Comparar em centavos para evitar qualquer erro de ponto flutuante
    const totalClientesCents = Math.round(totalClientes * 100);
    const pixContaCents = Math.round((Number(entries.pixConta) || 0) * 100);
    return totalClientesCents === pixContaCents;
  }, [entries.pixConta, entries.pixContaClientes]);

  // Função para validar valores Cartão Link
  const validateCartaoLinkValues = useCallback(() => {
    // Se não há valor no Cartão Link, não precisa validar
    if (entries.cartaoLink <= 0) {
      return true;
    }

    // Se há valor no Cartão Link mas não há clientes, é inválido
    if (entries.cartaoLink > 0 && entries.cartaoLinkClientes.length === 0) {
      return false;
    }

    const totalClientes = entries.cartaoLinkClientes.reduce((sum, cliente) => sum + (Number(cliente.valor) || 0), 0);
    // Comparar em centavos para evitar qualquer erro de ponto flutuante
    const totalClientesCents = Math.round(totalClientes * 100);
    const cartaoLinkCents = Math.round((Number(entries.cartaoLink) || 0) * 100);
    return totalClientesCents === cartaoLinkCents;
  }, [entries.cartaoLink, entries.cartaoLinkClientes]);

  // Função para validar valores Boletos
  const validateBoletosValues = useCallback(() => {
    // Se não há valor em Boletos, não precisa validar
    if (entries.boletos <= 0) {
      return true;
    }

    // Se há valor em Boletos mas não há clientes, é inválido
    if (entries.boletos > 0 && entries.boletosClientes.length === 0) {
      return false;
    }

    const totalClientes = entries.boletosClientes.reduce((sum, cliente) => sum + (Number(cliente.valor) || 0), 0);
    // Comparar em centavos para evitar qualquer erro de ponto flutuante
    const totalClientesCents = Math.round(totalClientes * 100);
    const boletosCents = Math.round((Number(entries.boletos) || 0) * 100);
    return totalClientesCents === boletosCents;
  }, [entries.boletos, entries.boletosClientes]);

  // Função para verificar se pode salvar
  const canSave = useCallback(() => {
    return validateSaidaValues() && validatePixContaValues() && validateCartaoLinkValues() && validateBoletosValues();
  }, [validateSaidaValues, validatePixContaValues, validateCartaoLinkValues, validateBoletosValues]);

  // Função para adicionar cheque
  const adicionarCheque = useCallback((cheque: Cheque) => {
    setEntries(prev => ({
      ...prev,
      cheques: [...prev.cheques, cheque],
      cheque: prev.cheque + cheque.valor
    }));
    setHasChanges(true);
  }, []);

  // Função para remover cheque
  const removerCheque = useCallback((index: number) => {
    setEntries(prev => {
      const chequeRemovido = prev.cheques[index];
      const novosCheques = prev.cheques.filter((_, i) => i !== index);
      return {
        ...prev,
        cheques: novosCheques,
        cheque: prev.cheque - chequeRemovido.valor
      };
    });
    setHasChanges(true);
  }, []);

  // Funções para gerenciar saídas retiradas
  const adicionarSaidaRetirada = useCallback((saida: SaidaRetirada) => {
    setExits(prev => ({
      ...prev,
      saidasRetiradas: [...prev.saidasRetiradas, saida]
    }));
    setHasChanges(true);
  }, []);

  const removerSaidaRetirada = useCallback((index: number) => {
    setExits(prev => ({
      ...prev,
      saidasRetiradas: prev.saidasRetiradas.filter((_, i) => i !== index)
    }));
    setHasChanges(true);
  }, []);

  const atualizarSaidaRetirada = useCallback((index: number, saida: SaidaRetirada) => {
    setExits(prev => ({
      ...prev,
      saidasRetiradas: prev.saidasRetiradas.map((s, i) => i === index ? saida : s)
    }));
    setHasChanges(true);
  }, []);

  // Função para adicionar cliente PIX Conta
  const adicionarPixContaCliente = useCallback((nome: string, valor: number) => {
    setEntries(prev => ({
      ...prev,
      pixContaClientes: [...prev.pixContaClientes, { nome, valor }]
    }));
    setHasChanges(true);
  }, []);

  // Função para remover cliente PIX Conta
  const removerPixContaCliente = useCallback((index: number) => {
    setEntries(prev => ({
      ...prev,
      pixContaClientes: prev.pixContaClientes.filter((_, i) => i !== index)
    }));
    setHasChanges(true);
  }, []);

  // Função para adicionar cliente Cartão Link
  const adicionarCartaoLinkCliente = useCallback((nome: string, valor: number, parcelas: number) => {
    setEntries(prev => ({
      ...prev,
      cartaoLinkClientes: [...prev.cartaoLinkClientes, { nome, valor, parcelas }]
    }));
    setHasChanges(true);
  }, []);

  // Função para remover cliente Cartão Link
  const removerCartaoLinkCliente = useCallback((index: number) => {
    setEntries(prev => ({
      ...prev,
      cartaoLinkClientes: prev.cartaoLinkClientes.filter((_, i) => i !== index)
    }));
    setHasChanges(true);
  }, []);

  // Função para adicionar cliente Boletos
  const adicionarBoletosCliente = useCallback((nome: string, valor: number, parcelas: number) => {
    setEntries(prev => ({
      ...prev,
      boletosClientes: [...prev.boletosClientes, { nome, valor, parcelas }]
    }));
    setHasChanges(true);
  }, []);

  // Função para remover cliente Boletos
  const removerBoletosCliente = useCallback((index: number) => {
    setEntries(prev => ({
      ...prev,
      boletosClientes: prev.boletosClientes.filter((_, i) => i !== index)
    }));
    setHasChanges(true);
  }, []);

  // Função para limpar formulário
  const clearForm = useCallback(() => {
    setEntries({
      dinheiro: 0,
      fundoCaixa: 400,
      cartao: 0,
      cartaoLink: 0,
      clienteCartaoLink: '',
      parcelasCartaoLink: 0,
      boletos: 0,
      clienteBoletos: '',
      parcelasBoletos: 0,
      pixMaquininha: 0,
      pixConta: 0,
      cliente1Nome: '',
      cliente1Valor: 0,
      cliente2Nome: '',
      cliente2Valor: 0,
      cliente3Nome: '',
      cliente3Valor: 0,
      pixContaClientes: [],
      cheque: 0,
      cheques: [],
      outros: 0,
    });
    setExits({
      descontos: 0,
      saida: 0,
      justificativaSaida: '',
      justificativaCompra: '',
      valorCompra: 0,
      justificativaSaidaDinheiro: '',
      valorSaidaDinheiro: 0,
      devolucoes: [],
      enviosCorreios: [],
      enviosTransportadora: [],
      valesFuncionarios: [],
      valesIncluidosNoMovimento: false,
      puxadorNome: '',
      puxadorPorcentagem: 0,
      puxadorValor: 0,
      puxadorClientes: [],
      
      // Campos legados para compatibilidade
      creditoDevolucao: 0,
      cpfCreditoDevolucao: '',
      creditoDevolucaoIncluido: false,
      correiosFrete: 0,
      correiosTipo: '',
      correiosEstado: '',
      correiosClientes: [],
    });
    setHasChanges(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Função para salvar no localStorage
  const saveToLocal = useCallback(() => {
    const dataToSave = { entries, exits, cancelamentos };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    setHasChanges(false);
  }, [entries, exits, cancelamentos]);

  // Função para carregar do localStorage
  const loadFromLocal = useCallback(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.entries && parsed.exits) {
          // Garantir que os novos campos existam para compatibilidade
          const entriesWithDefault = {
            ...parsed.entries,
            boletos: parsed.entries.boletos || 0,
            clienteBoletos: parsed.entries.clienteBoletos || '',
            parcelasBoletos: parsed.entries.parcelasBoletos || 0,
            pixContaClientes: parsed.entries.pixContaClientes || [],
          } as CashFlowEntry;
          
          const exitsWithDefault = {
            ...parsed.exits,
            // Múltiplas devoluções
            devolucoes: parsed.exits.devolucoes || [],
            
            // Múltiplos envios de correios
            enviosCorreios: parsed.exits.enviosCorreios || [],
            
            // Múltiplos envios via transportadora
            enviosTransportadora: parsed.exits.enviosTransportadora || [],
            
            // Campos obrigatórios
            valesFuncionarios: parsed.exits.valesFuncionarios || [],
            valesIncluidosNoMovimento: parsed.exits.valesIncluidosNoMovimento || false,
            puxadorNome: parsed.exits.puxadorNome || '',
            puxadorPorcentagem: parsed.exits.puxadorPorcentagem || 0,
            puxadorValor: parsed.exits.puxadorValor || 0,
            puxadorClientes: parsed.exits.puxadorClientes || [],
            
            // Campos legados para compatibilidade
            creditoDevolucao: parsed.exits.creditoDevolucao || 0,
            cpfCreditoDevolucao: parsed.exits.cpfCreditoDevolucao || '',
            creditoDevolucaoIncluido: parsed.exits.creditoDevolucaoIncluido || false,
            correiosFrete: parsed.exits.correiosFrete || 0,
            correiosTipo: parsed.exits.correiosTipo || '',
            correiosEstado: parsed.exits.correiosEstado || '',
            correiosClientes: parsed.exits.correiosClientes || [],
          };
          
          setEntries(entriesWithDefault);
          setExits(exitsWithDefault);
          setCancelamentos(parsed.cancelamentos || []);
          setHasChanges(false);
          
          // Se os dados foram migrados, salvar automaticamente para evitar perda
          const entriesMigrated = !parsed.entries.hasOwnProperty('boletos') || 
                                 !parsed.entries.hasOwnProperty('clienteBoletos') || 
                                 !parsed.entries.hasOwnProperty('parcelasBoletos') || 
                                 !parsed.entries.hasOwnProperty('pixContaClientes');
          
          const exitsMigrated = !parsed.exits.hasOwnProperty('devolucoes') || 
                               !parsed.exits.hasOwnProperty('enviosCorreios') || 
                               !parsed.exits.hasOwnProperty('enviosTransportadora') || 
                               !parsed.exits.hasOwnProperty('valesFuncionarios') || 
                               !parsed.exits.hasOwnProperty('valesIncluidosNoMovimento') || 
                               !parsed.exits.hasOwnProperty('puxadorNome') || 
                               !parsed.exits.hasOwnProperty('puxadorPorcentagem') || 
                               !parsed.exits.hasOwnProperty('puxadorValor') ||
                               !parsed.exits.hasOwnProperty('puxadorClientes');
          
          if (entriesMigrated || exitsMigrated) {
            const dataToSave = { entries: entriesWithDefault, exits: exitsWithDefault, cancelamentos: parsed.cancelamentos || [] };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
      }
    }
  }, []);

  // Carregar dados automaticamente ao inicializar
  useEffect(() => {
    loadFromLocal();
  }, [loadFromLocal]);

  return {
    entries,
    exits,
    total,
    totalEntradas,
    totalCheques,
    totalDevolucoes,
    totalValesFuncionarios,
    valesImpactoEntrada,
    totalFinal,
    cancelamentos,
    setCancelamentos,
    updateEntries,
    updateExits,
    clearForm,
    hasChanges,
    saveToLocal,
    loadFromLocal,
    validateSaidaValues,
    validatePixContaValues,
    validateCartaoLinkValues,
    validateBoletosValues,
    canSave,
    adicionarCheque,
    removerCheque,
    adicionarPixContaCliente,
    removerPixContaCliente,
    adicionarCartaoLinkCliente,
    removerCartaoLinkCliente,
    adicionarBoletosCliente,
    removerBoletosCliente,
    adicionarSaidaRetirada,
    removerSaidaRetirada,
    atualizarSaidaRetirada,
    totalSaidasRetiradas,
    totalEnviosCorreios
  };
};
