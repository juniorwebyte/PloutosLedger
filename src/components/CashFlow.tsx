import React, { useState, useEffect, useMemo } from 'react';
import { LogOut, Calculator, TrendingUp, TrendingDown, Save, RotateCcw, Download, FileText, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCashFlow } from '../hooks/useCashFlow';
import { useDemoTimer } from '../hooks/useDemoTimer';
import { useAccessControl } from '../hooks/useAccessControl';
import { formatCurrency } from '../utils/currency';
import PrintReport from './PrintReport';
import ConfirmDialog from './ConfirmDialog';
import CancelamentosModal from './CancelamentosModal';
import Notification, { NotificationType } from './Notification';
import DemoTimer from './DemoTimer';
import DemoExpiredModal from './DemoExpiredModal';
import OwnerPanel from './OwnerPanel';
import AccessLimitationModal from './AccessLimitationModal';
import { CompanyConfig } from '../types';

interface CashFlowProps {
  isDemo?: boolean;
  onBackToLanding?: () => void;
}

function CashFlow({ isDemo = false, onBackToLanding }: CashFlowProps) {
  const { logout, user, role } = useAuth();
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig | null>(null);
  const { startDemo, resetDemo, timeInfo, isDemoActive } = useDemoTimer();
  const accessControl = useAccessControl();
  const [showAccessLimitation, setShowAccessLimitation] = useState(false);
  const {
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
    adicionarSaidaRetirada,
    removerSaidaRetirada,
    atualizarSaidaRetirada,
    totalSaidasRetiradas,
    totalEnviosCorreios
  } = useCashFlow();

  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmFechamento, setShowConfirmFechamento] = useState(false);
  const [showCancelamentosModal, setShowCancelamentosModal] = useState(false);
  const [showDemoExpiredModal, setShowDemoExpiredModal] = useState(false);
  const [novoValeNome, setNovoValeNome] = useState('');
  const [novoValeValor, setNovoValeValor] = useState(0);
  
  // Estados para múltiplas devoluções
  const [novaDevolucaoCpf, setNovaDevolucaoCpf] = useState('');
  const [novaDevolucaoValor, setNovaDevolucaoValor] = useState(0);
  
  // Estados para múltiplos envios de correios
  const [novoEnvioCorreiosTipo, setNovoEnvioCorreiosTipo] = useState<'' | 'PAC' | 'SEDEX'>('');
  const [novoEnvioCorreiosEstado, setNovoEnvioCorreiosEstado] = useState('');
  const [novoEnvioCorreiosCliente, setNovoEnvioCorreiosCliente] = useState('');
  const [novoEnvioCorreiosValor, setNovoEnvioCorreiosValor] = useState(0);
  const [novoEnvioCorreiosIncluido, setNovoEnvioCorreiosIncluido] = useState(false);

  // Estados para múltiplas saídas retiradas
  const [novaSaidaRetiradaDescricao, setNovaSaidaRetiradaDescricao] = useState('');
  const [novaSaidaRetiradaValor, setNovaSaidaRetiradaValor] = useState(0);
  const [novaSaidaRetiradaIncluida, setNovaSaidaRetiradaIncluida] = useState(false);

  // Lista de estados brasileiros
  const estadosBrasileiros = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  
  // Estados para transportadora
  const [novoEnvioTransportadoraNome, setNovoEnvioTransportadoraNome] = useState('');
  const [novoEnvioTransportadoraEstado, setNovoEnvioTransportadoraEstado] = useState('');
  const [novoEnvioTransportadoraPeso, setNovoEnvioTransportadoraPeso] = useState(0);
  const [novoEnvioTransportadoraQuantidade, setNovoEnvioTransportadoraQuantidade] = useState(0);
  const [novoEnvioTransportadoraValor, setNovoEnvioTransportadoraValor] = useState(0);
  
  // Estados para múltiplos clientes PIX Conta
  const [novoPixContaClienteNome, setNovoPixContaClienteNome] = useState('');
  const [novoPixContaClienteValor, setNovoPixContaClienteValor] = useState(0);
  
  // Estados para múltiplos clientes Cartão Link
  const [novoCartaoLinkClienteNome, setNovoCartaoLinkClienteNome] = useState('');
  const [novoCartaoLinkClienteValor, setNovoCartaoLinkClienteValor] = useState(0);
  const [novoCartaoLinkClienteParcelas, setNovoCartaoLinkClienteParcelas] = useState(1);
  
  // Estados para múltiplos clientes Boletos
  const [novoBoletosClienteNome, setNovoBoletosClienteNome] = useState('');
  const [novoBoletosClienteValor, setNovoBoletosClienteValor] = useState(0);
  const [novoBoletosClienteParcelas, setNovoBoletosClienteParcelas] = useState(1);
  
  // Estados para cheques
  const [novoChequeBanco, setNovoChequeBanco] = useState('');
  const [novoChequeAgencia, setNovoChequeAgencia] = useState('');
  const [novoChequeNumero, setNovoChequeNumero] = useState('');
  const [novoChequeNomeCliente, setNovoChequeNomeCliente] = useState('');
  const [novoChequeValor, setNovoChequeValor] = useState(0);
  const [novoChequeDataVencimento, setNovoChequeDataVencimento] = useState('');
  const [novoChequeParcelas, setNovoChequeParcelas] = useState(1);
  const [novoChequeTipo, setNovoChequeTipo] = useState<'avista' | 'predatado' | ''>('');
  // Removido mostrarCamposCheque - agora sempre mostra os campos
  
  const [notification, setNotification] = useState<{
    type: NotificationType;
    message: string;
    isVisible: boolean;
  }>({
    type: 'info',
    message: '',
    isVisible: false
  });

  // Iniciar demo quando o componente for montado
  useEffect(() => {
    if (isDemo && !isDemoActive) {
      startDemo();
    }
  }, [isDemo, isDemoActive, startDemo]);

  // Controlar expiração da demo
  useEffect(() => {
    if (isDemo && timeInfo.isExpired && !showDemoExpiredModal) {
      setShowDemoExpiredModal(true);
    }
  }, [isDemo, timeInfo.isExpired, showDemoExpiredModal]);

  const handleEntryChange = (field: keyof typeof entries, value: string | number) => {
    updateEntries(field, value);
  };

  const handleExitChange = (field: keyof typeof exits, value: any) => {
    updateExits(field, value);
  };

  const handleCurrencyInput = (
    field: keyof typeof entries | keyof typeof exits, 
    value: string, 
    isEntry: boolean
  ) => {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, '');
    
    if (numbers === '') {
      // Se não há números, define como 0
      if (isEntry) {
        handleEntryChange(field as keyof typeof entries, 0);
      } else {
        handleExitChange(field as keyof typeof exits, 0);
      }
      return;
    }
    
    // Converte para centavos e depois para reais
    const cents = parseInt(numbers);
    const reais = cents / 100;
    
    if (isEntry) {
      handleEntryChange(field as keyof typeof entries, reais);
    } else {
      handleExitChange(field as keyof typeof exits, reais);
    }
  };

  const handleClearForm = () => {
    clearForm();
    setShowConfirmClear(false);
    setNotification({
      type: 'success',
      message: 'Formulário limpo com sucesso!',
      isVisible: true
    });
  };

  const handleSaveToLocal = () => {
    // Verificar limitações de acesso
    if (!accessControl.canCreateRecords()) {
      setShowAccessLimitation(true);
      return;
    }

    saveToLocal();
    setNotification({
      type: 'success',
      message: 'Dados salvos localmente!',
      isVisible: true
    });
  };

  // Função para formatar CPF
  const formatCPF = (value: string) => {
    let formatted = value.replace(/\D/g, '');
    if (formatted.length <= 11) {
      if (formatted.length > 9) {
        formatted = formatted.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      } else if (formatted.length > 6) {
        formatted = formatted.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
      } else if (formatted.length > 3) {
        formatted = formatted.replace(/(\d{3})(\d{3})/, '$1.$2');
      }
    }
    return formatted;
  };

  // Função para adicionar nova devolução
  const adicionarDevolucao = () => {
    if (novaDevolucaoCpf && novaDevolucaoValor > 0) {
      const novaDevolucao = {
        cpf: novaDevolucaoCpf,
        valor: novaDevolucaoValor,
        incluidoNoMovimento: false
      };
      const novasDevolucoes = [...exits.devolucoes, novaDevolucao];
      handleExitChange('devolucoes', novasDevolucoes);
      setNovaDevolucaoCpf('');
      setNovaDevolucaoValor(0);
    }
  };

  // Função para remover devolução
  const removerDevolucao = (index: number) => {
    const novasDevolucoes = exits.devolucoes.filter((_, i) => i !== index);
    handleExitChange('devolucoes', novasDevolucoes);
  };

  // Função para adicionar novo envio de correios
  const adicionarEnvioCorreios = () => {
    if (novoEnvioCorreiosTipo && novoEnvioCorreiosCliente && novoEnvioCorreiosValor > 0) {
      const novoEnvio = {
        tipo: novoEnvioCorreiosTipo,
        estado: novoEnvioCorreiosEstado,
        cliente: novoEnvioCorreiosCliente,
        valor: novoEnvioCorreiosValor,
        incluidoNoMovimento: novoEnvioCorreiosIncluido
      };
      const novosEnvios = [...exits.enviosCorreios, novoEnvio];
      handleExitChange('enviosCorreios', novosEnvios);
      setNovoEnvioCorreiosTipo('');
      setNovoEnvioCorreiosEstado('');
      setNovoEnvioCorreiosCliente('');
      setNovoEnvioCorreiosValor(0);
      setNovoEnvioCorreiosIncluido(false);
    }
  };

  // Função para remover envio de correios
  const removerEnvioCorreios = (index: number) => {
    const novosEnvios = exits.enviosCorreios.filter((_, i) => i !== index);
    handleExitChange('enviosCorreios', novosEnvios);
  };

  // Função para adicionar novo envio via transportadora
  const adicionarEnvioTransportadora = () => {
    if (novoEnvioTransportadoraNome && novoEnvioTransportadoraEstado) {
      const novoEnvio = {
        nomeCliente: novoEnvioTransportadoraNome,
        estado: novoEnvioTransportadoraEstado,
        peso: novoEnvioTransportadoraPeso,
        quantidade: novoEnvioTransportadoraQuantidade,
        valor: 0 // Valor sempre 0 pois quem paga é o destinatário
      };
      const novosEnvios = [...exits.enviosTransportadora, novoEnvio];
      handleExitChange('enviosTransportadora', novosEnvios);
      setNovoEnvioTransportadoraNome('');
      setNovoEnvioTransportadoraEstado('');
      setNovoEnvioTransportadoraPeso(0);
      setNovoEnvioTransportadoraQuantidade(0);
      setNovoEnvioTransportadoraValor(0);
    }
  };

  // Função para remover envio via transportadora
  const removerEnvioTransportadora = (index: number) => {
    const novosEnvios = exits.enviosTransportadora.filter((_, i) => i !== index);
    handleExitChange('enviosTransportadora', novosEnvios);
  };

  // Função para adicionar novo cliente PIX Conta
  const adicionarPixContaCliente = () => {
    if (novoPixContaClienteNome && novoPixContaClienteValor > 0) {
      const novoCliente = {
        nome: novoPixContaClienteNome,
        valor: novoPixContaClienteValor
      };
      const novosClientes = [...entries.pixContaClientes, novoCliente];
      updateEntries('pixContaClientes', novosClientes);
      setNovoPixContaClienteNome('');
      setNovoPixContaClienteValor(0);
    }
  };

  // Função para remover cliente PIX Conta
  const removerPixContaCliente = (index: number) => {
    const novosClientes = entries.pixContaClientes.filter((_, i) => i !== index);
    updateEntries('pixContaClientes', novosClientes);
  };

  // Função para adicionar novo cliente Cartão Link
  const adicionarCartaoLinkCliente = () => {
    if (novoCartaoLinkClienteNome && novoCartaoLinkClienteValor > 0) {
      const novoCliente = {
        nome: novoCartaoLinkClienteNome,
        valor: novoCartaoLinkClienteValor,
        parcelas: novoCartaoLinkClienteParcelas
      };
      const novosClientes = [...entries.cartaoLinkClientes, novoCliente];
      updateEntries('cartaoLinkClientes', novosClientes);
      setNovoCartaoLinkClienteNome('');
      setNovoCartaoLinkClienteValor(0);
      setNovoCartaoLinkClienteParcelas(1);
    }
  };

  // Função para remover cliente Cartão Link
  const removerCartaoLinkCliente = (index: number) => {
    const novosClientes = entries.cartaoLinkClientes.filter((_, i) => i !== index);
    updateEntries('cartaoLinkClientes', novosClientes);
  };

  // Função para adicionar novo cliente Boletos
  const adicionarBoletosCliente = () => {
    if (novoBoletosClienteNome && novoBoletosClienteValor > 0) {
      const novoCliente = {
        nome: novoBoletosClienteNome,
        valor: novoBoletosClienteValor,
        parcelas: novoBoletosClienteParcelas
      };
      const novosClientes = [...entries.boletosClientes, novoCliente];
      updateEntries('boletosClientes', novosClientes);
      setNovoBoletosClienteNome('');
      setNovoBoletosClienteValor(0);
      setNovoBoletosClienteParcelas(1);
    }
  };

  // Função para remover cliente Boletos
  const removerBoletosCliente = (index: number) => {
    const novosClientes = entries.boletosClientes.filter((_, i) => i !== index);
    updateEntries('boletosClientes', novosClientes);
  };

  // Função para adicionar nova saída retirada
  const adicionarNovaSaidaRetirada = () => {
    if (novaSaidaRetiradaDescricao && novaSaidaRetiradaValor > 0) {
      const novaSaida = {
        descricao: novaSaidaRetiradaDescricao,
        valor: novaSaidaRetiradaValor,
        incluidoNoMovimento: novaSaidaRetiradaIncluida
      };
      adicionarSaidaRetirada(novaSaida);
      setNovaSaidaRetiradaDescricao('');
      setNovaSaidaRetiradaValor(0);
      setNovaSaidaRetiradaIncluida(false);
    }
  };

  // Função para adicionar novo cheque (com suporte a à vista e predatado)
  const adicionarNovoCheque = () => {
    if (novoChequeBanco && novoChequeAgencia && novoChequeNumero && novoChequeNomeCliente && novoChequeValor > 0 && novoChequeTipo) {
      if (novoChequeTipo === 'avista') {
        // Cheque à vista - valor único
        const novoCheque = {
          banco: novoChequeBanco,
          agencia: novoChequeAgencia,
          numeroCheque: novoChequeNumero,
          nomeCliente: novoChequeNomeCliente,
          valor: novoChequeValor,
          dataVencimento: undefined // À vista não tem data de vencimento
        };
        adicionarCheque(novoCheque);
        
        setNotification({
          type: 'success',
          message: `Cheque à vista de ${formatCurrency(novoChequeValor)} adicionado com sucesso!`,
          isVisible: true
        });
      } else if (novoChequeTipo === 'predatado') {
        // Cheque predatado - pode ser parcelado
        const valorPorParcela = novoChequeValor / novoChequeParcelas;
        
        // Criar cheques para cada parcela
        for (let i = 0; i < novoChequeParcelas; i++) {
          const dataVencimento = new Date();
          if (novoChequeDataVencimento) {
            dataVencimento.setTime(new Date(novoChequeDataVencimento).getTime());
          }
          // Adicionar meses para cada parcela
          dataVencimento.setMonth(dataVencimento.getMonth() + i);
          
          const novoCheque = {
            banco: novoChequeBanco,
            agencia: novoChequeAgencia,
            numeroCheque: `${novoChequeNumero}-${i + 1}`, // Adicionar sufixo da parcela
            nomeCliente: novoChequeNomeCliente,
            valor: valorPorParcela,
            dataVencimento: dataVencimento.toISOString().split('T')[0]
          };
          adicionarCheque(novoCheque);
        }
        
        setNotification({
          type: 'success',
          message: `${novoChequeParcelas} cheque(s) predatado(s) de ${formatCurrency(novoChequeValor)} adicionado(s) com sucesso!`,
          isVisible: true
        });
      }
      
      // Limpar campos
      setNovoChequeBanco('');
      setNovoChequeAgencia('');
      setNovoChequeNumero('');
      setNovoChequeNomeCliente('');
      setNovoChequeValor(0);
      setNovoChequeDataVencimento('');
      setNovoChequeParcelas(1);
      setNovoChequeTipo('');
      setMostrarCamposCheque(false);
    }
  };

  // Função para remover cheque
  const removerNovoCheque = (index: number) => {
    removerCheque(index);
  };

  // Função para formatar valores de entrada
  const formatInputValue = (value: number) => {
    if (value === 0) return '';
    return formatCurrency(value);
  };

  const handleLoadFromLocal = () => {
    loadFromLocal();
    setNotification({
      type: 'info',
      message: 'Dados carregados do armazenamento local!',
      isVisible: true
    });
  };

  // Função para gerar arquivo de fechamento para download
  const generateFechamentoFile = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR');
    
    const totalEntradas = 
      entries.dinheiro + 
      entries.fundoCaixa + 
      entries.cartao + 
      entries.cartaoLink + 
      entries.boletos + 
      entries.pixMaquininha + 
      entries.pixConta +
      entries.cheque +
      entries.outros +
      totalEnviosCorreios;

    // Calcular total das devoluções incluídas no movimento
    const totalDevolucoes = Array.isArray(exits.devolucoes)
      ? exits.devolucoes
          .filter(devolucao => devolucao.incluidoNoMovimento)
          .reduce((sum, devolucao) => sum + (Number(devolucao.valor) || 0), 0)
      : 0;

    // Vales de funcionários
    const totalValesFuncionarios = Array.isArray(exits.valesFuncionarios)
      ? exits.valesFuncionarios.reduce((sum: number, item: { nome: string; valor: number }) => sum + (Number(item.valor) || 0), 0)
      : 0;
    const valesImpactoEntrada = exits.valesIncluidosNoMovimento ? totalValesFuncionarios : 0;

    // Total final
    const totalFinal = totalEntradas + totalDevolucoes + valesImpactoEntrada;

    const totalSaidas = 
      exits.descontos + 
      exits.saida + 
      exits.creditoDevolucao +
      (Array.isArray(exits.valesFuncionarios) ? exits.valesFuncionarios.reduce((s, v) => s + (Number(v.valor) || 0), 0) : 0);

    const content = `# FECHAMENTO DE CAIXA - ${dateStr} ${timeStr}

## DADOS DO FECHAMENTO
- **Data:** ${dateStr}
- **Hora:** ${timeStr}
- **Usuário:** ${user || 'Não informado'}

## ENTRADAS
- **Dinheiro:** ${formatCurrency(entries.dinheiro)}
- **Fundo de Caixa:** ${formatCurrency(entries.fundoCaixa)}
- **Cartão:** ${formatCurrency(entries.cartao)}
- **Cartão Link:** ${formatCurrency(entries.cartaoLink)}
  ${entries.cartaoLinkClientes.length > 0 ? `  - Clientes:` : ''}
  ${entries.cartaoLinkClientes.map(cliente => `    - ${cliente.nome}: ${formatCurrency(cliente.valor)} (${cliente.parcelas}x)`).join('\n')}
  ${entries.cartaoLink > 0 && entries.cartaoLinkClientes.length === 0 ? `  - Cliente: ${entries.clienteCartaoLink || 'Não informado'}` : ''}
  ${entries.cartaoLink > 0 && entries.cartaoLinkClientes.length === 0 ? `  - Parcelas: ${entries.parcelasCartaoLink || 1}x` : ''}
- **Boletos:** ${formatCurrency(entries.boletos)}
  ${entries.boletosClientes.length > 0 ? `  - Clientes:` : ''}
  ${entries.boletosClientes.map(cliente => `    - ${cliente.nome}: ${formatCurrency(cliente.valor)} (${cliente.parcelas}x)`).join('\n')}
  ${entries.boletos > 0 && entries.boletosClientes.length === 0 ? `  - Cliente: ${entries.clienteBoletos || 'Não informado'}` : ''}
  ${entries.boletos > 0 && entries.boletosClientes.length === 0 ? `  - Parcelas: ${entries.parcelasBoletos || 1}x` : ''}
- **PIX Maquininha:** ${formatCurrency(entries.pixMaquininha)}
- **PIX Conta:** ${formatCurrency(entries.pixConta)}
- **Cheques:** ${formatCurrency(totalCheques)}
- **Outros:** ${formatCurrency(entries.outros)}
  ${entries.outros > 0 && entries.outrosDescricao ? `  - Descrição: ${entries.outrosDescricao}` : ''}

${entries.cliente1Nome || entries.cliente1Valor > 0 ? `- **${entries.cliente1Nome || 'Cliente 1'}:** ${formatCurrency(entries.cliente1Valor)}` : ''}
${entries.cliente2Nome || entries.cliente2Valor > 0 ? `- **${entries.cliente2Nome || 'Cliente 2'}:** ${formatCurrency(entries.cliente2Valor)}` : ''}
${entries.cliente3Nome || entries.cliente3Valor > 0 ? `- **${entries.cliente3Nome || 'Cliente 3'}:** ${formatCurrency(entries.cliente3Valor)}` : ''}

${entries.cheques.length > 0 ? `- **Detalhes dos Cheques:**` : ''}
${entries.cheques.length > 0 ? entries.cheques.map((cheque, i) => `  - Cheque ${i + 1}: ${cheque.nomeCliente} | Banco: ${cheque.banco} | Agência: ${cheque.agencia} | N°: ${cheque.numeroCheque} | Valor: ${formatCurrency(cheque.valor)}${cheque.dataVencimento ? ` | Vencimento: ${cheque.dataVencimento}` : ''}`).join('\n') : ''}

**TOTAL ENTRADAS:** ${formatCurrency(totalFinal)}

## SAÍDAS (APENAS REGISTRO)
- **Descontos:** ${formatCurrency(exits.descontos)}
- **Saída (Retirada):** ${formatCurrency(exits.saida)}
  ${exits.saida > 0 ? `  - Justificativa da Compra: ${exits.justificativaCompra || 'Não informada'} - Valor: ${formatCurrency(exits.valorCompra)}` : ''}
  ${exits.saida > 0 ? `  - Justificativa da Saída de Dinheiro: ${exits.justificativaSaidaDinheiro || 'Não informada'} - Valor: ${formatCurrency(exits.valorSaidaDinheiro)}` : ''}
  ${exits.saida > 0 ? `  - **Status da Validação:** ${exits.valorCompra + exits.valorSaidaDinheiro === exits.saida ? '✅ VALORES CONFEREM' : '❌ VALORES NÃO CONFEREM'}` : ''}
  ${exits.saida > 0 && exits.valorCompra + exits.valorSaidaDinheiro !== exits.saida ? `  - **Diferença:** ${formatCurrency(Math.abs(exits.valorCompra + exits.valorSaidaDinheiro - exits.saida))}` : ''}
${Array.isArray(exits.devolucoes) && exits.devolucoes.length > 0 ? `- **Múltiplas Devoluções:** ${formatCurrency(exits.devolucoes.reduce((sum, dev) => sum + dev.valor, 0))}` : ''}
${Array.isArray(exits.devolucoes) && exits.devolucoes.length > 0 ? exits.devolucoes.map((dev, i) => `  - CPF: ${dev.cpf} | Valor: ${formatCurrency(dev.valor)}${dev.incluidoNoMovimento ? ' ✅ Incluído' : ''}`).join('\n') : ''}

${Array.isArray(exits.enviosCorreios) && exits.enviosCorreios.length > 0 ? `- **Múltiplos Envios de Correios:** ${formatCurrency(exits.enviosCorreios.reduce((sum, envio) => sum + envio.valor, 0))}` : ''}
${Array.isArray(exits.enviosCorreios) && exits.enviosCorreios.length > 0 ? exits.enviosCorreios.map((envio, i) => `  - ${envio.tipo} | Cliente: ${envio.cliente} | Estado: ${envio.estado} | Valor: ${formatCurrency(envio.valor)}`).join('\n') : ''}

${Array.isArray(exits.enviosTransportadora) && exits.enviosTransportadora.length > 0 ? `- **Transportadora:** ${formatCurrency(exits.enviosTransportadora.reduce((sum, envio) => sum + envio.valor, 0))}` : ''}
${Array.isArray(exits.enviosTransportadora) && exits.enviosTransportadora.length > 0 ? exits.enviosTransportadora.map((envio, i) => `  - Cliente: ${envio.nomeCliente} | Estado: ${envio.estado} | Peso: ${envio.peso}kg | Qtd: ${envio.quantidade} | Valor: ${formatCurrency(envio.valor)}`).join('\n') : ''}

${Array.isArray(exits.valesFuncionarios) && exits.valesFuncionarios.length > 0 ? `- **Vales Funcionário:** ${formatCurrency(exits.valesFuncionarios.reduce((s, v) => s + (Number(v.valor) || 0), 0))}` : ''}
${Array.isArray(exits.valesFuncionarios) && exits.valesFuncionarios.length > 0 ? exits.valesFuncionarios.map((v, i) => `  - ${v.nome || `Funcionário ${i + 1}`}: ${formatCurrency(Number(v.valor) || 0)}`).join('\n') : ''}
${exits.valesFuncionarios.length > 0 && exits.valesIncluidosNoMovimento ? `  - ✅ INCLUÍDO NO MOVIMENTO (Entrada)` : ''}

${(exits.puxadorNome || exits.puxadorPorcentagem > 0 || exits.puxadorValor > 0) ? `- **Comissão Puxador (registro):** ${formatCurrency(exits.puxadorValor)}\n  - Nome: ${exits.puxadorNome || '—'} | Percentual: ${exits.puxadorPorcentagem || 0}%` : ''}

**TOTAL SAÍDAS (Registro):** ${formatCurrency(totalSaidas)}

## RESUMO FINAL
- **Total Entradas:** ${formatCurrency(totalEntradas)}
- **Total Saídas (Registro):** ${formatCurrency(totalSaidas)}
- **SALDO EM CAIXA:** ${formatCurrency(total)}

---
*Arquivo gerado automaticamente pelo Sistema de Movimento de Caixa*
*Webyte | Tecnologia Laravel*
`;

    // Criar blob e download
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fechamento_caixa_${dateStr.replace(/\//g, '-')}_${timeStr.replace(/:/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Função para fechar movimento (imprimir + gerar arquivo + zerar valores)
  const handleFecharMovimento = () => {
    // 1. Gerar arquivo de fechamento
    generateFechamentoFile();
    
    // 2. Abrir impressão automaticamente
    setTimeout(() => {
      // Criar um elemento temporário para impressão
      const printElement = document.getElementById('print-full');
      if (printElement) {
        printElement.style.display = 'block';
      }
      
      // Esconder a versão reduzida
      const reducedElement = document.getElementById('print-reduced');
      if (reducedElement) {
        reducedElement.style.display = 'none';
      }
      
      // Executar impressão
      window.print();
      
      // Restaurar o estado original após a impressão
      setTimeout(() => {
        if (printElement) printElement.style.display = 'none';
        if (reducedElement) reducedElement.style.display = 'none';
        
        // Mostrar confirmação após impressão
        setShowConfirmFechamento(true);
      }, 1000);
    }, 500);
    
    // 3. Mostrar notificação
    setNotification({
      type: 'success',
      message: 'Movimento fechado! Arquivo gerado e impressão aberta.',
      isVisible: true
    });
  };

  // Função para confirmar fechamento e zerar valores
  const handleConfirmFechamento = () => {
    clearForm();
    setShowConfirmFechamento(false);
    setNotification({
      type: 'success',
      message: 'Movimento confirmado e valores zerados com sucesso!',
      isVisible: true
    });
  };

  const cashFlowData = {
    entries,
    exits,
    total,
    date: new Date().toISOString(),
    cancelamentos,
  };



  // Calcular total sempre que entries ou exits mudarem
  useEffect(() => {
    const totalEntradas = 
      entries.dinheiro + 
      entries.fundoCaixa + 
      entries.cartao + 
      entries.cartaoLink + 
      entries.boletos + 
      entries.pixMaquininha + 
      entries.pixConta +
      // entries.cheque removido - agora é calculado pela soma dos cheques individuais
      entries.outros +
      totalEnviosCorreios;

    // Calcular total das devoluções incluídas no movimento
    const totalDevolucoes = Array.isArray(exits.devolucoes)
      ? exits.devolucoes
          .filter(devolucao => devolucao.incluidoNoMovimento)
          .reduce((sum, devolucao) => sum + (Number(devolucao.valor) || 0), 0)
      : 0;

    // Vales de funcionários
    const totalValesFuncionarios = Array.isArray(exits.valesFuncionarios)
      ? exits.valesFuncionarios.reduce((sum: number, item: { nome: string; valor: number }) => sum + (Number(item.valor) || 0), 0)
      : 0;
    const valesImpactoEntrada = exits.valesIncluidosNoMovimento ? totalValesFuncionarios : 0;

    // Total final (sincronizado com o hook)
    const totalFinal = totalEntradas + totalCheques + totalDevolucoes + valesImpactoEntrada;

    // O total exibido no card é calculado pelo hook e já inclui as entradas opcionais
  }, [entries, exits]);



  const totalCancelamentos = useMemo(() => (
    cancelamentos.reduce((total, c) => total + c.valor, 0)
  ), [cancelamentos]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-transparent to-indigo-100/20"></div>
        </div>
        <div className="relative z-10">
        {/* HEADER MODERNO */}
        <header className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-2xl border-b border-purple-500/20 animate-slide-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-24 py-8 sm:py-0 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-all duration-300 animate-bounce-in relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 via-pink-400/30 to-red-400/30 rounded-2xl animate-rotate-slow"></div>
                    <Calculator className="w-8 h-8 text-white relative z-10 animate-float" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-slate-900 animate-pulse-glow"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                    {isDemo ? 'Demonstração - Sistema de Movimento de Caixa' : 'Sistema de Movimento de Caixa'}
                  </h1>
                  <p className="text-purple-200 text-sm mt-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    {isDemo ? 'Teste todas as funcionalidades sem compromisso' : 'Controle financeiro inteligente e automatizado'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                {isDemo && onBackToLanding ? (
                  <button
                    onClick={onBackToLanding}
                    className="group flex items-center space-x-3 bg-gradient-to-r from-gray-500 via-slate-500 to-gray-600 text-white px-6 py-3 rounded-xl hover:from-gray-600 hover:via-slate-600 hover:to-gray-700 active:from-gray-700 active:via-slate-700 active:to-gray-800 transition-all duration-300 text-sm font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 relative overflow-hidden animate-bounce-in"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer"></div>
                    <span className="text-lg relative z-10">←</span>
                    <span className="hidden sm:inline relative z-10">Voltar à Landing Page</span>
                  </button>
                ) : (
                  <>
                    <div className="text-right hidden sm:block">
                      <p className="text-purple-200 text-sm font-medium">Usuário Ativo</p>
                      <p className="font-bold text-white text-xl">{user}</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowOwnerPanel(true)}
                        className="group flex items-center space-x-3 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700 active:from-blue-700 active:via-cyan-700 active:to-blue-800 transition-all duration-300 text-sm font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 relative overflow-hidden animate-bounce-in"
                        style={{animationDelay: '100ms'}}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer"></div>
                        <Building className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300 relative z-10 animate-float" />
                        <span className="hidden sm:inline relative z-10">Proprietário</span>
                      </button>
                      <button
                        onClick={logout}
                        className="group flex items-center space-x-3 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:via-pink-600 hover:to-red-700 active:from-red-700 active:via-pink-700 active:to-red-800 transition-all duration-300 text-sm font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 relative overflow-hidden animate-bounce-in"
                        style={{animationDelay: '200ms'}}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer"></div>
                        <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300 relative z-10 animate-float" />
                        <span className="hidden sm:inline relative z-10">Sair do Sistema</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Demo Timer */}
        {isDemo && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <DemoTimer timeInfo={timeInfo} />
          </div>
        )}

        {/* MAIN CONTENT */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* FORMULÁRIO DE ENTRADAS */}
            <div className="xl:col-span-2 space-y-6">
              {/* ENTRADAS */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-200/50 hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-[1.02]">
                <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white p-8 rounded-t-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                  <h2 className="text-2xl font-bold flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <TrendingUp className="w-7 h-7" />
                    </div>
                    ENTRADAS
                  </h2>
                  <p className="text-emerald-100 text-sm mt-3 relative z-10">Registro de todas as entradas de caixa</p>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dinheiro
                      </label>
                      <input
                        type="text"
                        value={formatInputValue(entries.dinheiro)}
                        onChange={(e) => handleCurrencyInput('dinheiro', e.target.value, true)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 focus:shadow-lg"
                        placeholder="R$ 0,00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fundo de Caixa
                      </label>
                      <input
                        type="text"
                        value={formatCurrency(entries.fundoCaixa)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gradient-to-r from-gray-50 to-gray-100 cursor-not-allowed"
                        placeholder="R$ 400,00"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cartão
                      </label>
                      <input
                        type="text"
                        value={formatInputValue(entries.cartao)}
                        onChange={(e) => handleCurrencyInput('cartao', e.target.value, true)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 focus:shadow-lg"
                        placeholder="R$ 0,00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cartão Link
                      </label>
                      <input
                        type="text"
                        value={formatInputValue(entries.cartaoLink)}
                        onChange={(e) => handleCurrencyInput('cartaoLink', e.target.value, true)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 focus:shadow-lg"
                        placeholder="R$ 0,00"
                      />
                      {entries.cartaoLink > 0 && (
                        <div className="mt-6 border-t border-gray-200 pt-6">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs font-bold">💳</span>
                            </div>
                            Clientes Cartão Link
                          </h3>
                          
                          {/* Formulário para adicionar novo cliente */}
                          <div className="space-y-4 mb-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Nome do Cliente
                                </label>
                                <input
                                  type="text"
                                  value={novoCartaoLinkClienteNome}
                                  onChange={(e) => setNovoCartaoLinkClienteNome(e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-blue-300 focus:shadow-lg"
                                  placeholder="Nome do cliente"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Valor
                                </label>
                                <input
                                  type="text"
                                  value={formatInputValue(novoCartaoLinkClienteValor)}
                                  onChange={(e) => {
                                    const numbers = e.target.value.replace(/\D/g, '');
                                    const cents = numbers === '' ? 0 : parseInt(numbers);
                                    const reais = cents / 100;
                                    setNovoCartaoLinkClienteValor(reais);
                                  }}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-blue-300 focus:shadow-lg"
                                  placeholder="R$ 0,00"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Parcelas
                                </label>
                                <select
                                  value={novoCartaoLinkClienteParcelas}
                                  onChange={(e) => setNovoCartaoLinkClienteParcelas(parseInt(e.target.value) || 1)}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-blue-300 focus:shadow-lg"
                                >
                                  <option value={1}>1x</option>
                                  <option value={2}>2x</option>
                                  <option value={3}>3x</option>
                                  <option value={4}>4x</option>
                                  <option value={5}>5x</option>
                                  <option value={6}>6x</option>
                                  <option value={7}>7x</option>
                                  <option value={8}>8x</option>
                                  <option value={9}>9x</option>
                                  <option value={10}>10x</option>
                                  <option value={11}>11x</option>
                                  <option value={12}>12x</option>
                                </select>
                              </div>
                            </div>
                            {novoCartaoLinkClienteNome && novoCartaoLinkClienteValor > 0 && (
                              <div className="flex justify-center">
                                <button
                                  type="button"
                                  onClick={adicionarCartaoLinkCliente}
                                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                                  title="Adicionar cliente"
                                >
                                  ➕ Adicionar Cliente Cartão Link
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Lista de clientes Cartão Link */}
                          {entries.cartaoLinkClientes.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-gray-700">Clientes Registrados:</h4>
                              {entries.cartaoLinkClientes.map((cliente, index) => (
                                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">{cliente.nome}</div>
                                    <div className="text-sm text-gray-600">
                                      Valor: {formatCurrency(cliente.valor)} | Parcelas: {cliente.parcelas}x
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => removerCartaoLinkCliente(index)}
                                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 text-sm font-medium"
                                    title="Remover cliente"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Validação dos valores */}
                          {entries.cartaoLinkClientes.length > 0 && (
                            <div className={`mt-4 p-3 rounded-xl border text-sm ${
                              entries.cartaoLinkClientes.reduce((sum, cliente) => sum + cliente.valor, 0) === entries.cartaoLink
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : 'bg-red-50 border-red-200 text-red-800'
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                {entries.cartaoLinkClientes.reduce((sum, cliente) => sum + cliente.valor, 0) === entries.cartaoLink ? (
                                  <span className="text-green-600">✅</span>
                                ) : (
                                  <span className="text-red-600">❌</span>
                                )}
                                <span className="font-medium">
                                  {entries.cartaoLinkClientes.reduce((sum, cliente) => sum + cliente.valor, 0) === entries.cartaoLink
                                    ? 'Valores Conferem'
                                    : 'Valores Não Conferem'
                                  }
                                </span>
                              </div>
                              <div className="text-xs space-y-1">
                                <div>Total dos Clientes: {formatCurrency(entries.cartaoLinkClientes.reduce((sum, cliente) => sum + cliente.valor, 0))}</div>
                                <div className="font-medium">
                                  Valor Cartão Link: {formatCurrency(entries.cartaoLink)}
                                </div>
                                {entries.cartaoLinkClientes.reduce((sum, cliente) => sum + cliente.valor, 0) !== entries.cartaoLink && (
                                  <div className="font-bold mt-1">
                                    Diferença: {formatCurrency(Math.abs(entries.cartaoLinkClientes.reduce((sum, cliente) => sum + cliente.valor, 0) - entries.cartaoLink))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Boletos
                      </label>
                      <input
                        type="text"
                        value={formatInputValue(entries.boletos)}
                        onChange={(e) => handleCurrencyInput('boletos', e.target.value, true)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 focus:shadow-lg"
                        placeholder="R$ 0,00"
                      />
                      {entries.boletos > 0 && (
                        <div className="mt-6 border-t border-gray-200 pt-6">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs font-bold">📄</span>
                            </div>
                            Clientes Boletos
                          </h3>
                          
                          {/* Formulário para adicionar novo cliente */}
                          <div className="space-y-4 mb-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Nome do Cliente
                                </label>
                                <input
                                  type="text"
                                  value={novoBoletosClienteNome}
                                  onChange={(e) => setNovoBoletosClienteNome(e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-blue-300 focus:shadow-lg"
                                  placeholder="Nome do cliente"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Valor
                                </label>
                                <input
                                  type="text"
                                  value={formatInputValue(novoBoletosClienteValor)}
                                  onChange={(e) => {
                                    const numbers = e.target.value.replace(/\D/g, '');
                                    const cents = numbers === '' ? 0 : parseInt(numbers);
                                    const reais = cents / 100;
                                    setNovoBoletosClienteValor(reais);
                                  }}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-blue-300 focus:shadow-lg"
                                  placeholder="R$ 0,00"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Parcelas
                                </label>
                                <select
                                  value={novoBoletosClienteParcelas}
                                  onChange={(e) => setNovoBoletosClienteParcelas(parseInt(e.target.value) || 1)}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-blue-300 focus:shadow-lg"
                                >
                                  <option value={1}>1x</option>
                                  <option value={2}>2x</option>
                                  <option value={3}>3x</option>
                                  <option value={4}>4x</option>
                                  <option value={5}>5x</option>
                                  <option value={6}>6x</option>
                                  <option value={7}>7x</option>
                                  <option value={8}>8x</option>
                                  <option value={9}>9x</option>
                                  <option value={10}>10x</option>
                                  <option value={11}>11x</option>
                                  <option value={12}>12x</option>
                                </select>
                              </div>
                            </div>
                            {novoBoletosClienteNome && novoBoletosClienteValor > 0 && (
                              <div className="flex justify-center">
                                <button
                                  type="button"
                                  onClick={adicionarBoletosCliente}
                                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                                  title="Adicionar cliente"
                                >
                                  ➕ Adicionar Cliente Boleto
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Lista de clientes Boletos */}
                          {entries.boletosClientes.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-gray-700">Clientes Registrados:</h4>
                              {entries.boletosClientes.map((cliente, index) => (
                                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">{cliente.nome}</div>
                                    <div className="text-sm text-gray-600">
                                      Valor: {formatCurrency(cliente.valor)} | Parcelas: {cliente.parcelas}x
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => removerBoletosCliente(index)}
                                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 text-sm font-medium"
                                    title="Remover cliente"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Validação dos valores */}
                          {entries.boletosClientes.length > 0 && (
                            <div className={`mt-4 p-3 rounded-xl border text-sm ${
                              entries.boletosClientes.reduce((sum, cliente) => sum + cliente.valor, 0) === entries.boletos
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : 'bg-red-50 border-red-200 text-red-800'
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                {entries.boletosClientes.reduce((sum, cliente) => sum + cliente.valor, 0) === entries.boletos ? (
                                  <span className="text-green-600">✅</span>
                                ) : (
                                  <span className="text-red-600">❌</span>
                                )}
                                <span className="font-medium">
                                  {entries.boletosClientes.reduce((sum, cliente) => sum + cliente.valor, 0) === entries.boletos
                                    ? 'Valores Conferem'
                                    : 'Valores Não Conferem'
                                  }
                                </span>
                              </div>
                              <div className="text-xs space-y-1">
                                <div>Total dos Clientes: {formatCurrency(entries.boletosClientes.reduce((sum, cliente) => sum + cliente.valor, 0))}</div>
                                <div className="font-medium">
                                  Valor Boletos: {formatCurrency(entries.boletos)}
                                </div>
                                {entries.boletosClientes.reduce((sum, cliente) => sum + cliente.valor, 0) !== entries.boletos && (
                                  <div className="font-bold mt-1">
                                    Diferença: {formatCurrency(Math.abs(entries.boletosClientes.reduce((sum, cliente) => sum + cliente.valor, 0) - entries.boletos))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PIX Maquininha
                      </label>
                      <input
                        type="text"
                        value={formatInputValue(entries.pixMaquininha)}
                        onChange={(e) => handleCurrencyInput('pixMaquininha', e.target.value, true)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 focus:shadow-lg"
                        placeholder="R$ 0,00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PIX Conta
                      </label>
                      <input
                        type="text"
                        value={formatInputValue(entries.pixConta)}
                        onChange={(e) => handleCurrencyInput('pixConta', e.target.value, true)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 focus:shadow-lg"
                        placeholder="R$ 0,00"
                      />
                    </div>

                    {/* Seção de Cheques */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valor Total dos Cheques
                      </label>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 mb-2">
                            {formatCurrency(totalCheques)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {entries.cheques.length > 0 
                              ? `${entries.cheques.length} cheque(s) adicionado(s)` 
                              : 'Nenhum cheque adicionado'
                            }
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Outros
                      </label>
                      <input
                        type="text"
                        value={formatInputValue(entries.outros)}
                        onChange={(e) => handleCurrencyInput('outros', e.target.value, true)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-green-300 focus:shadow-lg"
                        placeholder="R$ 0,00"
                      />
                      {entries.outros > 0 && (
                        <div className="mt-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Descrição
                          </label>
                          <input
                            type="text"
                            value={entries.outrosDescricao}
                            onChange={(e) => handleEntryChange('outrosDescricao', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all duration-200 hover:border-green-300 focus:shadow-lg"
                            placeholder="Descreva o que foi lançado neste campo"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Seção de detalhes do cheque */}
                  <div className="mt-6 border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">📄</span>
                        </div>
                        Adicionar Cheques
                      </h3>
                      
                      {/* Formulário para adicionar novo cheque */}
                      <div className="space-y-4 mb-4">
                        {/* Seleção do tipo de cheque */}
                        <div className="mb-4">
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Tipo de Cheque
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setNovoChequeTipo('avista')}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                novoChequeTipo === 'avista'
                                  ? 'bg-green-500 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              💰 À Vista
                            </button>
                            <button
                              type="button"
                              onClick={() => setNovoChequeTipo('predatado')}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                novoChequeTipo === 'predatado'
                                  ? 'bg-blue-500 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              📅 Predatado
                            </button>
                          </div>
                        </div>

                        {novoChequeTipo && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Banco
                            </label>
                            <input
                              type="text"
                              value={novoChequeBanco}
                              onChange={(e) => setNovoChequeBanco(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Nome do banco"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Agência
                            </label>
                            <input
                              type="text"
                              value={novoChequeAgencia}
                              onChange={(e) => setNovoChequeAgencia(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Número da agência"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Cheque N°
                            </label>
                            <input
                              type="text"
                              value={novoChequeNumero}
                              onChange={(e) => setNovoChequeNumero(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Número do cheque"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Nome do Cliente
                            </label>
                            <input
                              type="text"
                              value={novoChequeNomeCliente}
                              onChange={(e) => setNovoChequeNomeCliente(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Nome do cliente"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Valor
                            </label>
                            <input
                              type="text"
                              value={formatInputValue(novoChequeValor)}
                              onChange={(e) => {
                                const numbers = e.target.value.replace(/\D/g, '');
                                const cents = numbers === '' ? 0 : parseInt(numbers);
                                const reais = cents / 100;
                                setNovoChequeValor(reais);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="R$ 0,00"
                            />
                          </div>
                          {/* Campos específicos para predatado */}
                          {novoChequeTipo === 'predatado' && (
                            <>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Número de Parcelas
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="12"
                                  value={novoChequeParcelas}
                                  onChange={(e) => setNovoChequeParcelas(parseInt(e.target.value) || 1)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  placeholder="1"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Data do Primeiro Vencimento
                                </label>
                                <input
                                  type="date"
                                  value={novoChequeDataVencimento}
                                  onChange={(e) => setNovoChequeDataVencimento(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                              </div>
                            </>
                          )}
                          </div>
                        )}
                        
                        {novoChequeBanco && novoChequeAgencia && novoChequeNumero && novoChequeNomeCliente && novoChequeValor > 0 && novoChequeTipo && (
                          <div className="space-y-3">
                            {/* Resumo do cheque */}
                            <div className={`border rounded-lg p-3 ${
                              novoChequeTipo === 'avista' 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-blue-50 border-blue-200'
                            }`}>
                              <div className={`text-sm ${
                                novoChequeTipo === 'avista' ? 'text-green-800' : 'text-blue-800'
                              }`}>
                                <div className="font-medium mb-1">
                                  Resumo do Cheque {novoChequeTipo === 'avista' ? 'À Vista' : 'Predatado'}:
                                </div>
                                <div>• Valor Total: {formatCurrency(novoChequeValor)}</div>
                                {novoChequeTipo === 'predatado' && (
                                  <>
                                    <div>• Parcelas: {novoChequeParcelas}x de {formatCurrency(novoChequeValor / novoChequeParcelas)}</div>
                                    <div>• Primeiro Vencimento: {novoChequeDataVencimento || 'Não definido'}</div>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex justify-center">
                              <button
                                type="button"
                                onClick={adicionarNovoCheque}
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                                title={`Adicionar cheque ${novoChequeTipo === 'avista' ? 'à vista' : 'predatado'}`}
                              >
                                ➕ Adicionar Cheque {novoChequeTipo === 'avista' ? 'À Vista' : `Predatado (${novoChequeParcelas}x)`}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Lista de cheques */}
                      {entries.cheques.length > 0 && (
                        <div className="space-y-3">
                          <div className="text-sm font-medium text-gray-700">
                            Cheques Adicionados ({entries.cheques.length}):
                          </div>
                          {entries.cheques.map((cheque, index) => (
                            <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                <div><span className="font-medium">Banco:</span> {cheque.banco}</div>
                                <div><span className="font-medium">Agência:</span> {cheque.agencia}</div>
                                <div><span className="font-medium">Cheque N°:</span> {cheque.numeroCheque}</div>
                                <div><span className="font-medium">Cliente:</span> {cheque.nomeCliente}</div>
                                <div><span className="font-medium">Valor:</span> {formatCurrency(cheque.valor)}</div>
                                <div><span className="font-medium">Vencimento:</span> {cheque.dataVencimento || 'À vista'}</div>
                              </div>
                              <div className="flex justify-end mt-3">
                                <button
                                  onClick={() => removerCheque(index)}
                                  className="text-red-500 hover:text-red-700 text-sm px-3 py-1 rounded hover:bg-red-50 transition-colors"
                                >
                                  🗑️ Remover
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  {/* CLIENTES PIX CONTA */}
                  {entries.pixConta > 0 && (
                    <div className="mt-6 border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">👥</span>
                        </div>
                        Clientes PIX Conta
                      </h3>
                      
                      {/* Formulário para adicionar novo cliente */}
                      <div className="space-y-4 mb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Nome do Cliente
                            </label>
                            <input
                              type="text"
                              value={novoPixContaClienteNome}
                              onChange={(e) => setNovoPixContaClienteNome(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-blue-300 focus:shadow-lg"
                              placeholder="Nome do cliente"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Valor
                            </label>
                            <input
                              type="text"
                              value={formatInputValue(novoPixContaClienteValor)}
                              onChange={(e) => {
                                const numbers = e.target.value.replace(/\D/g, '');
                                const cents = numbers === '' ? 0 : parseInt(numbers);
                                const reais = cents / 100;
                                setNovoPixContaClienteValor(reais);
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-blue-300 focus:shadow-lg"
                              placeholder="R$ 0,00"
                            />
                          </div>
                        </div>
                        {novoPixContaClienteNome && novoPixContaClienteValor > 0 && (
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={adicionarPixContaCliente}
                              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                              title="Adicionar cliente"
                            >
                              ➕ Adicionar Cliente PIX
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Lista de clientes PIX Conta */}
                      {entries.pixContaClientes.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">Clientes Registrados:</h4>
                          {entries.pixContaClientes.map((cliente, index) => (
                            <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="text-sm font-medium">{cliente.nome}</div>
                                <div className="text-sm text-gray-600">
                                  Valor: {formatCurrency(cliente.valor)}
                                </div>
                              </div>
                              <button
                                onClick={() => removerPixContaCliente(index)}
                                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 text-sm font-medium"
                                title="Remover cliente"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Validação dos valores */}
                      {entries.pixContaClientes.length > 0 && (
                        <div className={`mt-4 p-3 rounded-xl border text-sm ${
                          entries.pixContaClientes.reduce((sum, cliente) => sum + cliente.valor, 0) === entries.pixConta
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            {entries.pixContaClientes.reduce((sum, cliente) => sum + cliente.valor, 0) === entries.pixConta ? (
                              <span className="text-green-600">✅</span>
                            ) : (
                              <span className="text-red-600">❌</span>
                            )}
                            <span className="font-medium">
                              {entries.pixContaClientes.reduce((sum, cliente) => sum + cliente.valor, 0) === entries.pixConta
                                ? 'Valores Conferem'
                                : 'Valores Não Conferem'
                              }
                            </span>
                          </div>
                          <div className="text-xs space-y-1">
                            <div>Total dos Clientes: {formatCurrency(entries.pixContaClientes.reduce((sum, cliente) => sum + cliente.valor, 0))}</div>
                            <div className="font-medium">
                              Valor PIX Conta: {formatCurrency(entries.pixConta)}
                            </div>
                            {entries.pixContaClientes.reduce((sum, cliente) => sum + cliente.valor, 0) !== entries.pixConta && (
                              <div className="font-bold mt-1">
                                Diferença: {formatCurrency(Math.abs(entries.pixContaClientes.reduce((sum, cliente) => sum + cliente.valor, 0) - entries.pixConta))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>


              {/* SAÍDAS */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-red-200/50 hover:shadow-red-500/25 transition-all duration-500 transform hover:scale-[1.02]">
                <div className="bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 text-white p-8 rounded-t-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                  <h2 className="text-2xl font-bold flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <TrendingDown className="w-7 h-7" />
                    </div>
                    SAÍDAS
                  </h2>
                  <p className="text-rose-100 text-sm mt-3 relative z-10">Registro de saídas para controle contábil</p>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descontos <span className="text-xs text-gray-500">(apenas registro)</span>
                      </label>
                      <input
                        type="text"
                        value={formatInputValue(exits.descontos)}
                        onChange={(e) => handleCurrencyInput('descontos', e.target.value, false)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 hover:border-red-300 focus:shadow-lg"
                        placeholder="R$ 0,00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Saída (Retirada) <span className="text-xs text-gray-500">(apenas registro)</span>
                      </label>
                      <input
                        type="text"
                        value={formatInputValue(exits.saida)}
                        onChange={(e) => handleCurrencyInput('saida', e.target.value, false)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 hover:border-red-300 focus:shadow-lg"
                        placeholder="R$ 0,00"
                      />
                      {exits.saida > 0 && (
                        <div className="mt-2 space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Justificativa da Compra
                            </label>
                            <input
                              type="text"
                              value={exits.justificativaCompra}
                              onChange={(e) => handleExitChange('justificativaCompra', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-200 hover:border-red-300 focus:shadow-lg"
                              placeholder="Descreva o que foi comprado..."
                            />
                            <div className="mt-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Valor da Compra
                              </label>
                              <input
                                type="text"
                                value={formatInputValue(exits.valorCompra)}
                                onChange={(e) => handleCurrencyInput('valorCompra', e.target.value, false)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-200 hover:border-red-300 focus:shadow-lg"
                                placeholder="R$ 0,00"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Justificativa da Saída de Dinheiro
                            </label>
                            <input
                              type="text"
                              value={exits.justificativaSaidaDinheiro}
                              onChange={(e) => handleExitChange('justificativaSaidaDinheiro', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-200 hover:border-red-300 focus:shadow-lg"
                              placeholder="Descreva o motivo da saída de dinheiro..."
                            />
                            <div className="mt-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Valor da Saída de Dinheiro
                              </label>
                              <input
                                type="text"
                                value={formatInputValue(exits.valorSaidaDinheiro)}
                                onChange={(e) => handleCurrencyInput('valorSaidaDinheiro', e.target.value, false)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-200 hover:border-red-300 focus:shadow-lg"
                                placeholder="R$ 0,00"
                              />
                            </div>
                          </div>
                          
                          {/* VALIDAÇÃO DOS VALORES */}
                          {exits.saida > 0 && (exits.valorCompra > 0 || exits.valorSaidaDinheiro > 0) && (
                            <div className={`mt-3 p-3 rounded-xl border text-sm ${
                              exits.valorCompra + exits.valorSaidaDinheiro === exits.saida
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : 'bg-red-50 border-red-200 text-red-800'
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                {exits.valorCompra + exits.valorSaidaDinheiro === exits.saida ? (
                                  <span className="text-green-600">✅</span>
                                ) : (
                                  <span className="text-red-600">❌</span>
                                )}
                                <span className="font-medium">
                                  {exits.valorCompra + exits.valorSaidaDinheiro === exits.saida
                                    ? 'Valores Conferem'
                                    : 'Valores Não Conferem'
                                  }
                                </span>
                              </div>
                              <div className="text-xs space-y-1">
                                <div>Valor da Compra: {formatCurrency(exits.valorCompra)}</div>
                                <div>Valor da Saída: {formatCurrency(exits.valorSaidaDinheiro)}</div>
                                <div className="font-medium">
                                  Total das Justificativas: {formatCurrency(exits.valorCompra + exits.valorSaidaDinheiro)}
                                </div>
                                <div className="font-medium">
                                  Valor Total (Saída Retirada): {formatCurrency(exits.saida)}
                                </div>
                                {exits.valorCompra + exits.valorSaidaDinheiro !== exits.saida && (
                                  <div className="font-bold text-red-700 mt-2">
                                    ⚠️ Os valores devem bater exatamente! Ajuste os valores para continuar.
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* VALIDAÇÃO DOS VALORES PIX CONTA */}
                          {entries.pixConta > 0 && (
                            <div className={`mt-3 p-3 rounded-xl border text-sm ${
                              validatePixContaValues()
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : 'bg-red-50 border-red-200 text-red-800'
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                {validatePixContaValues() ? (
                                  <span className="text-green-600">✅</span>
                                ) : (
                                  <span className="text-red-600">❌</span>
                                )}
                                <span className="font-medium">
                                  {validatePixContaValues()
                                    ? 'Valores PIX Conta Conferem'
                                    : 'Valores PIX Conta Não Conferem'
                                  }
                                </span>
                              </div>
                              <div className="text-xs space-y-1">
                                <div>Total dos Clientes: {formatCurrency(entries.pixContaClientes.reduce((sum, cliente) => sum + cliente.valor, 0))}</div>
                                <div className="font-medium">
                                  Valor PIX Conta: {formatCurrency(entries.pixConta)}
                                </div>
                                {!validatePixContaValues() && (
                                  <div className="font-bold text-red-700 mt-2">
                                    ⚠️ Os valores devem bater exatamente! Ajuste os valores para continuar.
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Crédito/Devolução <span className="text-xs text-gray-500">(múltiplas devoluções)</span>
                      </label>
                      
                      {/* Formulário para adicionar nova devolução */}
                      <div className="space-y-4 mb-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              CPF da Pessoa
                            </label>
                            <input
                              type="text"
                              value={novaDevolucaoCpf}
                              onChange={(e) => setNovaDevolucaoCpf(formatCPF(e.target.value))}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-200 hover:border-red-300 focus:shadow-lg"
                              placeholder="000.000.000-00"
                              maxLength={14}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Valor da Devolução
                            </label>
                            <input
                              type="text"
                              value={novaDevolucaoValor === 0 ? '' : formatCurrency(novaDevolucaoValor)}
                              onChange={(e) => {
                                const numbers = e.target.value.replace(/\D/g, '');
                                const cents = numbers === '' ? 0 : parseInt(numbers);
                                const reais = cents / 100;
                                setNovaDevolucaoValor(reais);
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-200 hover:border-red-300 focus:shadow-lg"
                              placeholder="R$ 0,00"
                            />
                          </div>
                        </div>
                        {novaDevolucaoCpf && novaDevolucaoValor > 0 && (
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={adicionarDevolucao}
                              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                              title="Adicionar devolução"
                            >
                              💰 Adicionar Devolução
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Lista de devoluções */}
                      {exits.devolucoes.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">Devoluções Registradas:</h4>
                          {exits.devolucoes.map((devolucao, index) => (
                            <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="text-sm font-medium">CPF: {devolucao.cpf}</div>
                                <div className="text-sm text-gray-600">Valor: {formatCurrency(devolucao.valor)}</div>
                              </div>
                              <button
                                onClick={() => {
                                  const novasDevolucoes = [...exits.devolucoes];
                                  novasDevolucoes[index].incluidoNoMovimento = !novasDevolucoes[index].incluidoNoMovimento;
                                  handleExitChange('devolucoes', novasDevolucoes);
                                }}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                                  devolucao.incluidoNoMovimento
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                              >
                                {devolucao.incluidoNoMovimento ? '✅ Incluído' : '➕ Incluir'}
                              </button>
                              <button
                                onClick={() => removerDevolucao(index)}
                                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 text-sm font-medium"
                                title="Remover devolução"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}


                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correios/Frete <span className="text-xs text-gray-500">(múltiplos envios)</span>
                      </label>
                      
                      {/* Formulário para adicionar novo envio de correios */}
                      <div className="space-y-4 mb-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Tipo de Envio
                            </label>
                            <select
                              value={novoEnvioCorreiosTipo}
                              onChange={(e) => {
                                const tipo = e.target.value as '' | 'PAC' | 'SEDEX';
                                setNovoEnvioCorreiosTipo(tipo);
                                // Se for SEDEX, preencher automaticamente com SP
                                if (tipo === 'SEDEX') {
                                  setNovoEnvioCorreiosEstado('SP');
                                } else {
                                  setNovoEnvioCorreiosEstado('');
                                }
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-200 hover:border-red-300 focus:shadow-lg"
                            >
                              <option value="">Selecione o tipo</option>
                              <option value="PAC">PAC</option>
                              <option value="SEDEX">SEDEX</option>
                            </select>
                          </div>
                          {novoEnvioCorreiosTipo && (
                            <>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Estado
                                </label>
                                {novoEnvioCorreiosTipo === 'SEDEX' ? (
                                  <input
                                    type="text"
                                    value={novoEnvioCorreiosEstado}
                                    readOnly
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 text-sm"
                                    placeholder="SP (automático para SEDEX)"
                                  />
                                ) : (
                                  <select
                                    value={novoEnvioCorreiosEstado}
                                    onChange={(e) => setNovoEnvioCorreiosEstado(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-200 hover:border-red-300 focus:shadow-lg"
                                  >
                                    <option value="">Selecione o estado</option>
                                    {estadosBrasileiros.map((estado) => (
                                      <option key={estado} value={estado}>{estado}</option>
                                    ))}
                                  </select>
                                )}
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Nome do Cliente
                                </label>
                                <input
                                  type="text"
                                  value={novoEnvioCorreiosCliente}
                                  onChange={(e) => setNovoEnvioCorreiosCliente(e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-200 hover:border-red-300 focus:shadow-lg"
                                  placeholder="Nome do cliente"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Valor
                                </label>
                                <input
                                  type="text"
                                  value={novoEnvioCorreiosValor === 0 ? '' : formatCurrency(novoEnvioCorreiosValor)}
                                  onChange={(e) => {
                                    const numbers = e.target.value.replace(/\D/g, '');
                                    const cents = numbers === '' ? 0 : parseInt(numbers);
                                    const reais = cents / 100;
                                    setNovoEnvioCorreiosValor(reais);
                                  }}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-200 hover:border-red-300 focus:shadow-lg"
                                  placeholder="R$ 0,00"
                                />
                              </div>
                              <div>
                                <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={novoEnvioCorreiosIncluido}
                                    onChange={(e) => setNovoEnvioCorreiosIncluido(e.target.checked)}
                                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                  />
                                  Incluir ao Movimento de Caixa
                                </label>
                              </div>
                            </>
                          )}
                        </div>
                        {novoEnvioCorreiosTipo && novoEnvioCorreiosCliente && novoEnvioCorreiosValor > 0 && (
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={adicionarEnvioCorreios}
                              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                              title="Adicionar envio"
                            >
                              ➕ Adicionar Envio de Correios
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Lista de envios de correios */}
                      {exits.enviosCorreios.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">Envios Registrados:</h4>
                          {exits.enviosCorreios.map((envio, index) => (
                            <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="text-sm font-medium">{envio.tipo} - {envio.cliente}</div>
                                <div className="text-sm text-gray-600">
                                  Estado: {envio.estado} | Valor: {formatCurrency(envio.valor)}
                                </div>
                                <div className={`text-xs ${envio.incluidoNoMovimento ? 'text-green-600' : 'text-gray-500'}`}>
                                  {envio.incluidoNoMovimento ? '✅ Incluído no Movimento' : '❌ Apenas Registro'}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    const novosEnvios = [...exits.enviosCorreios];
                                    novosEnvios[index].incluidoNoMovimento = !novosEnvios[index].incluidoNoMovimento;
                                    handleExitChange('enviosCorreios', novosEnvios);
                                  }}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                                    envio.incluidoNoMovimento
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                  }`}
                                >
                                  {envio.incluidoNoMovimento ? '✅ Incluído' : '➕ Incluir'}
                                </button>
                                <button
                                  onClick={() => removerEnvioCorreios(index)}
                                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 text-sm font-medium"
                                  title="Remover envio"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}


                    </div>

                    {/* TRANSPORTADORA */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transportadora <span className="text-xs text-gray-500">(envio para destinatário)</span>
                      </label>
                      
                      {/* Formulário para adicionar novo envio via transportadora */}
                      <div className="space-y-4 mb-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Nome do Cliente
                            </label>
                            <input
                              type="text"
                              value={novoEnvioTransportadoraNome}
                              onChange={(e) => setNovoEnvioTransportadoraNome(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-200 hover:border-red-300 focus:shadow-lg"
                              placeholder="Nome do cliente"
                            />
                          </div>
                          {novoEnvioTransportadoraNome && (
                            <>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Estado
                                </label>
                                <input
                                  type="text"
                                  value={novoEnvioTransportadoraEstado}
                                  onChange={(e) => setNovoEnvioTransportadoraEstado(e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-200 hover:border-red-300 focus:shadow-lg"
                                  placeholder="Ex: SP, RJ, MG..."
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Peso (kg)
                                </label>
                                <input
                                  type="number"
                                  value={novoEnvioTransportadoraPeso || ''}
                                  onChange={(e) => setNovoEnvioTransportadoraPeso(Number(e.target.value) || 0)}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-200 hover:border-red-300 focus:shadow-lg"
                                  placeholder="0.0"
                                  step="0.1"
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Quantidade
                                </label>
                                <input
                                  type="number"
                                  value={novoEnvioTransportadoraQuantidade || ''}
                                  onChange={(e) => setNovoEnvioTransportadoraQuantidade(Number(e.target.value) || 0)}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-200 hover:border-red-300 focus:shadow-lg"
                                  placeholder="1"
                                  min="1"
                                />
                              </div>
                            </>
                          )}
                        </div>
                        {novoEnvioTransportadoraNome && novoEnvioTransportadoraEstado && (
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={adicionarEnvioTransportadora}
                              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                              title="Adicionar envio"
                            >
                              🚚 Adicionar Envio via Transportadora
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Lista de envios via transportadora */}
                      {exits.enviosTransportadora.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">Envios via Transportadora:</h4>
                          {exits.enviosTransportadora.map((envio, index) => (
                            <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                              <div className="flex-1">
                                <div className="text-sm font-medium">{envio.nomeCliente}</div>
                                <div className="text-sm text-gray-600">
                                  Estado: {envio.estado} | Peso: {envio.peso}kg | Qtd: {envio.quantidade} | Valor: {formatCurrency(envio.valor)}
                                </div>
                              </div>
                              <button
                                onClick={() => removerEnvioTransportadora(index)}
                                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 text-sm font-medium"
                                title="Remover envio"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* OUTROS (VALE FUNCIONÁRIO) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Outros (Vale Funcionário) <span className="text-xs text-gray-500">(apenas registro)</span>
                      </label>
                      <div className="space-y-2">
                        {/* Linha de inclusão (o botão + aparece somente quando digitar o valor) */}
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <input
                            type="text"
                            value={novoValeNome}
                            onChange={(e) => setNovoValeNome(e.target.value)}
                            className="col-span-7 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-200 hover:border-red-300 focus:shadow-lg"
                            placeholder="Funcionário"
                          />
                          <input
                            type="text"
                            value={novoValeValor === 0 ? '' : formatCurrency(novoValeValor)}
                            onChange={(e) => {
                              const numbers = e.target.value.replace(/\D/g, '');
                              const cents = numbers === '' ? 0 : parseInt(numbers);
                              const reais = cents / 100;
                              setNovoValeValor(reais);
                            }}
                            className="col-span-4 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-200 hover:border-red-300 focus:shadow-lg"
                            placeholder="R$ 0,00"
                          />
                          {novoValeValor > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const novosVales = [...(exits.valesFuncionarios || []), { nome: novoValeNome, valor: novoValeValor }];
                                handleExitChange('valesFuncionarios', novosVales);
                                setNovoValeNome('');
                                setNovoValeValor(0);
                              }}
                              className="col-span-1 px-3 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                              title="Adicionar vale de funcionário"
                            >
                              +
                            </button>
                          )}
                        </div>

                        {/* Lista de Vales */}
                        {Array.isArray(exits.valesFuncionarios) && exits.valesFuncionarios.length > 0 && (
                          <div className="space-y-2">
                            {exits.valesFuncionarios.map((vale, index) => (
                              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                <input
                                  type="text"
                                  value={vale.nome}
                                  onChange={(e) => {
                                    const novosVales = [...exits.valesFuncionarios];
                                    novosVales[index] = { ...novosVales[index], nome: e.target.value };
                                    handleExitChange('valesFuncionarios', novosVales);
                                  }}
                                  className="col-span-7 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-200 hover:border-red-300 focus:shadow-lg"
                                  placeholder={`Funcionário ${index + 1}`}
                                />
                                <input
                                  type="text"
                                  value={formatInputValue(Number(vale.valor) || 0)}
                                  onChange={(e) => {
                                    const numbers = e.target.value.replace(/\D/g, '');
                                    const cents = numbers === '' ? 0 : parseInt(numbers);
                                    const reais = cents / 100;
                                    const novosVales = [...exits.valesFuncionarios];
                                    novosVales[index] = { ...novosVales[index], valor: reais };
                                    handleExitChange('valesFuncionarios', novosVales);
                                  }}
                                  className="col-span-4 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-200 hover:border-red-300 focus:shadow-lg"
                                  placeholder="R$ 0,00"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const novosVales = exits.valesFuncionarios.filter((_, i) => i !== index);
                                    handleExitChange('valesFuncionarios', novosVales);
                                  }}
                                  className="col-span-1 px-3 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                                  title="Remover vale"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Total e opção de incluir no movimento */}
                        {Array.isArray(exits.valesFuncionarios) && exits.valesFuncionarios.length > 0 && (
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                              <span className="text-gray-700 text-sm font-medium">Total Vales:</span>
                              <span className="font-bold text-red-700 text-lg">
                                {formatCurrency(exits.valesFuncionarios.reduce((s, v) => s + (Number(v.valor) || 0), 0))}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleExitChange('valesIncluidosNoMovimento', !exits.valesIncluidosNoMovimento)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                                  exits.valesIncluidosNoMovimento
                                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                                }`}
                              >
                                {exits.valesIncluidosNoMovimento ? '✅ Incluído no Movimento (Entrada)' : '➕ Adicionar ao Movimento de Caixa'}
                              </button>
                              {exits.valesIncluidosNoMovimento && (
                                <span className="text-xs text-green-600 font-medium">
                                  Valor somado ao caixa: {formatCurrency(exits.valesFuncionarios.reduce((s, v) => s + (Number(v.valor) || 0), 0))}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* COMISSÃO PUXADOR (APENAS REGISTRO) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comissão Puxador <span className="text-xs text-gray-500">(apenas registro)</span>
                      </label>
                      <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <input
                            type="text"
                            value={exits.puxadorNome}
                            onChange={(e) => handleExitChange('puxadorNome', e.target.value)}
                            className="col-span-5 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-200 hover:border-red-300 focus:shadow-lg"
                            placeholder="Nome do puxador"
                          />
                          <div className="col-span-3 px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-sm text-gray-600 flex items-center justify-center">
                            4% (Fixo)
                          </div>
                          <input
                            type="text"
                            value={formatInputValue(exits.puxadorValor)}
                            onChange={(e) => {
                              const numbers = e.target.value.replace(/\D/g, '');
                              const cents = numbers === '' ? 0 : parseInt(numbers);
                              const reais = cents / 100;
                              handleExitChange('puxadorValor', reais);
                              // Definir porcentagem fixa de 4%
                              if (reais > 0) {
                                handleExitChange('puxadorPorcentagem', 4);
                              }
                            }}
                            className="col-span-4 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-200 hover:border-red-300 focus:shadow-lg"
                            placeholder="Valor da comissão"
                          />
                        </div>
                        
                        {/* Botão para adicionar mais clientes do puxador */}
                        {exits.puxadorNome && exits.puxadorValor > 0 && (
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={() => {
                                // Adicionar novo campo para cliente do puxador
                                const novoCliente = {
                                  nome: `Cliente ${exits.puxadorClientes ? exits.puxadorClientes.length + 1 : 1}`,
                                  valor: 0
                                };
                                const novosClientes = [...(exits.puxadorClientes || []), novoCliente];
                                handleExitChange('puxadorClientes', novosClientes);
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                              title="Adicionar cliente do puxador"
                            >
                              ➕ Adicionar Cliente
                            </button>
                          </div>
                        )}

                        {/* Lista de clientes do puxador */}
                        {exits.puxadorClientes && exits.puxadorClientes.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700">Clientes do Puxador:</h4>
                            {exits.puxadorClientes.map((cliente, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                <input
                                  type="text"
                                  value={cliente.nome}
                                  onChange={(e) => {
                                    const novosClientes = [...exits.puxadorClientes];
                                    novosClientes[index].nome = e.target.value;
                                    handleExitChange('puxadorClientes', novosClientes);
                                  }}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                                  placeholder="Nome do cliente"
                                />
                                <input
                                  type="text"
                                  value={formatInputValue(cliente.valor)}
                                  onChange={(e) => {
                                    const numbers = e.target.value.replace(/\D/g, '');
                                    const cents = numbers === '' ? 0 : parseInt(numbers);
                                    const reais = cents / 100;
                                    const novosClientes = [...exits.puxadorClientes];
                                    novosClientes[index].valor = reais;
                                    handleExitChange('puxadorClientes', novosClientes);
                                  }}
                                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                                  placeholder="R$ 0,00"
                                />
                                <button
                                  onClick={() => {
                                    const novosClientes = exits.puxadorClientes.filter((_, i) => i !== index);
                                    handleExitChange('puxadorClientes', novosClientes);
                                  }}
                                  className="px-2 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 text-sm"
                                  title="Remover cliente"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {exits.puxadorNome && exits.puxadorValor > 0 && (
                          <div className="text-xs text-gray-600 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                            <span className="font-medium">Registro:</span> {exits.puxadorNome} | 4% | Valor da Comissão: {formatCurrency(exits.puxadorValor)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RESUMO E AÇÕES */}
            <div className="xl:col-span-1">
              <div className="space-y-6">
                {/* Total em Caixa */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-200/50 hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-[1.02]">
                  <div className="bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 text-white p-8 rounded-t-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                    <h2 className="text-2xl font-bold flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <Calculator className="w-7 h-7" />
                      </div>
                      TOTAL EM CAIXA
                    </h2>
                  </div>
                  <div className="p-8">
                    <div className="text-center">
                      <span className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent drop-shadow-lg">{formatCurrency(total)}</span>
                    </div>
                    {total < 0 && (
                      <div className="mt-6 p-6 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl shadow-lg">
                        <p className="text-red-600 text-sm text-center font-semibold flex items-center justify-center gap-3">
                          <span className="text-xl">⚠️</span>
                          Valor negativo detectado!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-200/50 hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-[1.02]">
                  <div className="p-8 space-y-8">
                    <PrintReport 
                      data={cashFlowData} 
                    />
                    
                    {/* Botões de Ação Principais */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={handleSaveToLocal}
                        disabled={!canSave()}
                        className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 active:bg-green-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-lg disabled:shadow-none"
                      >
                        <Save className="w-4 h-4" />
                        <span className="hidden sm:inline">Salvar</span>
                      </button>
                      
                      {/* Mensagem de erro quando os valores não conferem */}
                      {hasChanges && !canSave() && (
                        <div className="col-span-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-red-600">⚠️</span>
                            <span className="font-medium">Não é possível salvar</span>
                          </div>
                          
                          {/* Erro de validação de Saída (Retirada) */}
                          {exits.saida > 0 && !validateSaidaValues() && (
                            <div className="mb-2">
                              <p>❌ Os valores das justificativas devem bater exatamente com o valor total de "Saída (Retirada)".</p>
                              <p className="mt-1 text-xs">
                                Total das justificativas: {formatCurrency(exits.valorCompra + exits.valorSaidaDinheiro)} | 
                                Valor total: {formatCurrency(exits.saida)}
                              </p>
                            </div>
                          )}
                          
                          {/* Erro de validação PIX Conta */}
                          {entries.pixConta > 0 && !validatePixContaValues() && (
                            <div className="mb-2">
                              <p>❌ Os valores dos clientes PIX Conta devem bater exatamente com o valor total de "PIX Conta".</p>
                              <p className="mt-1 text-xs">
                                Total dos clientes: {formatCurrency(entries.pixContaClientes.reduce((sum, cliente) => sum + cliente.valor, 0))} | 
                                Valor PIX Conta: {formatCurrency(entries.pixConta)}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <button
                        onClick={handleLoadFromLocal}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span className="hidden sm:inline">Carregar</span>
                      </button>
                    </div>

                    {/* Botão de Cancelamentos */}
                    <div className="mb-4">
                      <button
                        onClick={() => setShowCancelamentosModal(true)}
                        className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white px-6 py-4 rounded-xl hover:from-orange-600 hover:via-red-600 hover:to-orange-700 active:from-orange-700 active:via-red-700 active:to-orange-800 transition-all duration-300 font-semibold text-sm flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="text-xl relative z-10 group-hover:animate-bounce">📋</span>
                        <span className="relative z-10">Controle de Cancelamentos</span>
                      </button>
                    </div>

                    {/* Botões de Fechamento */}
                    <div className="space-y-3">
                      <button
                        onClick={generateFechamentoFile}
                        className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white px-6 py-4 rounded-xl hover:from-purple-700 hover:via-indigo-700 hover:to-purple-800 active:from-purple-800 active:via-indigo-800 active:to-purple-900 transition-all duration-300 font-semibold text-sm flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Download className="w-5 h-5 relative z-10 group-hover:animate-bounce" />
                        <span className="relative z-10 hidden sm:inline">Gerar Arquivo de Fechamento</span>
                      </button>

                      <button
                        onClick={handleFecharMovimento}
                        className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white px-6 py-4 rounded-xl hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 active:from-orange-700 active:via-amber-700 active:to-orange-800 transition-all duration-300 font-semibold text-sm flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <FileText className="w-5 h-5 relative z-10 group-hover:animate-bounce" />
                        <span className="relative z-10 hidden sm:inline">Fechar Movimento</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setShowConfirmClear(true)}
                      className="w-full bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white px-6 py-4 rounded-xl hover:from-red-600 hover:via-pink-600 hover:to-red-700 active:from-red-700 active:via-pink-700 active:to-red-800 transition-all duration-300 font-semibold text-sm flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="text-xl relative z-10 group-hover:animate-bounce">🗑️</span>
                      <span className="relative z-10 hidden sm:inline">Limpar Formulário</span>
                    </button>
                  </div>
                </div>

                {/* Resumo Rápido */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-200/50 hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-[1.02]">
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm font-bold">📊</span>
                      </div>
                      Resumo Rápido
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                        <span className="text-gray-700 text-sm font-medium">Total Entradas:</span>
                        <span className="font-bold text-green-700 text-lg">
                          {formatCurrency(totalFinal)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
                        <span className="text-gray-700 text-sm font-medium">Total Saídas (Registro):</span>
                        <span className="font-bold text-red-700 text-lg">
                          {formatCurrency(
                            exits.descontos + 
                            exits.saida + 
                            exits.creditoDevolucao +
                            (Array.isArray(exits.valesFuncionarios) ? exits.valesFuncionarios.reduce((s, v) => s + (Number(v.valor) || 0), 0) : 0) +
                            (Number(exits.puxadorValor) || 0)
                          )}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                        <p className="font-bold text-gray-800 mb-3 text-center">📋 CAMPOS APENAS PARA REGISTRO</p>
                        
                        {/* DESCONTOS */}
                        <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <p className="font-medium text-gray-700">• Descontos: {formatCurrency(exits.descontos)}</p>
                        </div>

                        {/* SAÍDA (RETIRADA) */}
                        <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <p className="font-medium text-gray-700">• Saída (Retirada): {formatCurrency(exits.saida)}</p>
                          {exits.saida > 0 && (
                            <>
                              {exits.justificativaCompra && (
                                <p className="ml-4 text-gray-500 mt-1">- Compra: {exits.justificativaCompra} ({formatCurrency(exits.valorCompra)})</p>
                              )}
                              {exits.justificativaSaidaDinheiro && (
                                <p className="ml-4 text-gray-500 mt-1">- Saída: {exits.justificativaSaidaDinheiro} ({formatCurrency(exits.valorSaidaDinheiro)})</p>
                              )}
                              {/* Status da validação */}
                              <div className={`ml-4 mt-2 p-2 rounded-lg text-xs ${
                                exits.valorCompra + exits.valorSaidaDinheiro === exits.saida
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : 'bg-red-100 text-red-800 border border-red-200'
                              }`}>
                                <div className="flex items-center gap-2 mb-1">
                                  {exits.valorCompra + exits.valorSaidaDinheiro === exits.saida ? (
                                    <span className="text-green-600">✅</span>
                                  ) : (
                                    <span className="text-red-600">❌</span>
                                  )}
                                  <span className="font-medium">
                                    {exits.valorCompra + exits.valorSaidaDinheiro === exits.saida
                                      ? 'Valores Conferem'
                                      : 'Valores Não Conferem'
                                    }
                                  </span>
                                </div>
                                <div className="text-xs">
                                  <div>Total das justificativas: {formatCurrency(exits.valorCompra + exits.valorSaidaDinheiro)}</div>
                                  <div>Valor total: {formatCurrency(exits.saida)}</div>
                                  {exits.valorCompra + exits.valorSaidaDinheiro !== exits.saida && (
                                    <div className="font-bold mt-1">
                                      Diferença: {formatCurrency(Math.abs(exits.valorCompra + exits.valorSaidaDinheiro - exits.saida))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* CRÉDITO/DEVOLUÇÃO */}
                        <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <p className="font-medium text-gray-700">• Crédito/Devolução: {formatCurrency(exits.creditoDevolucao)} 
                            {exits.creditoDevolucaoIncluido && (
                              <span className="text-green-600 font-medium"> ✅ Incluído no Movimento</span>
                            )}
                          </p>
                          {exits.creditoDevolucao > 0 && exits.cpfCreditoDevolucao && (
                            <p className="ml-4 text-gray-500 mt-1">- CPF: {exits.cpfCreditoDevolucao}</p>
                          )}
                        </div>

                        {/* VALES FUNCIONÁRIO */}
                        {Array.isArray(exits.valesFuncionarios) && exits.valesFuncionarios.length > 0 && (
                          <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <p className="font-medium text-gray-700">• Vales Funcionário: {formatCurrency(exits.valesFuncionarios.reduce((s, v) => s + (Number(v.valor) || 0), 0))}
                              {exits.valesIncluidosNoMovimento && (
                                <span className="text-green-600 text-xs font-medium"> ✅ Incluído no Movimento</span>
                              )}
                            </p>
                          </div>
                        )}

                        {/* COMISSÃO PUXADOR */}
                        <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <p className="font-medium text-gray-700">• Comissão Puxador: {formatCurrency(exits.puxadorValor)}</p>
                          {exits.puxadorNome && (
                            <p className="ml-4 text-gray-500 mt-1">- Puxador: {exits.puxadorNome} (4%)</p>
                          )}
                          {exits.puxadorClientes && exits.puxadorClientes.length > 0 && (
                            <div className="ml-4 mt-1">
                              <p className="text-gray-500 text-xs">- Clientes:</p>
                              {exits.puxadorClientes.map((cliente, index) => (
                                <p key={index} className="ml-4 text-gray-500 text-xs">
                                  • {cliente.nome}: {formatCurrency(cliente.valor)}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* CORREIOS/FRETE */}
                        {exits.correiosFrete > 0 && (
                          <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <p className="font-medium text-gray-700">• Correios/Frete: {formatCurrency(exits.correiosFrete)} <span className="text-blue-600 text-xs">(registro separado)</span></p>
                            {exits.correiosFrete > 0 && exits.correiosClientes.length > 0 && (
                              <p className="ml-4 text-gray-500 mt-1">- Clientes adicionais: {exits.correiosClientes.filter(c => c.trim()).join(', ')}</p>
                            )}
                          </div>
                        )}

                        {/* TOTAL SAÍDAS */}
                        <div className="mt-4 p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
                          <p className="font-bold text-red-800 text-center">
                            <strong>Total Saídas (Registro):</strong> {formatCurrency(
                              exits.descontos + 
                              exits.saida + 
                              exits.creditoDevolucao +
                              (Array.isArray(exits.valesFuncionarios) ? exits.valesFuncionarios.reduce((s, v) => s + (Number(v.valor) || 0), 0) : 0) +
                              (Number(exits.puxadorValor) || 0)
                            )}
                          </p>
                        </div>

                        {/* CRÉDITO/DEVOLUÇÃO INCLUÍDO */}
                        {exits.creditoDevolucaoIncluido && (
                          <div className="mt-3 p-2 bg-green-100 rounded-lg border border-green-200">
                            <p className="text-green-800 font-medium text-center">
                              <strong>Crédito/Devolução incluído no movimento (entrada):</strong> +{formatCurrency(exits.creditoDevolucao)}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                          <span className="text-gray-800 font-bold text-sm">Saldo Final:</span>
                          <span className={`text-xl font-bold ${total >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {formatCurrency(total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        </div>
      </div>

      {/* CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={showConfirmClear}
        title="Limpar Formulário"
        message="Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita."
        confirmText="Sim, Limpar"
        cancelText="Cancelar"
        onConfirm={handleClearForm}
        onCancel={() => setShowConfirmClear(false)}
        type="danger"
      />

      {/* CONFIRM FECHAMENTO DIALOG */}
      <ConfirmDialog
        isOpen={showConfirmFechamento}
        title="Confirmar Fechamento"
        message="O movimento foi fechado e impresso. Deseja confirmar o fechamento e zerar todos os valores?"
        confirmText="Sim, Confirmar"
        cancelText="Não, Manter Dados"
        onConfirm={handleConfirmFechamento}
        onCancel={() => setShowConfirmFechamento(false)}
        type="info"
      />

      {/* NOTIFICATION */}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
        autoHide={true}
        duration={3000}
      />

      {/* MODAL DE CANCELAMENTOS */}
      <CancelamentosModal
        isOpen={showCancelamentosModal}
        onClose={() => setShowCancelamentosModal(false)}
        isDemo={isDemo}
      />

      {/* ELEMENTO DE IMPRESSÃO DE CANCELAMENTOS */}
      <div id="print-cancelamentos" className="hidden">
        <div className="p-4 bg-white text-black">
          {/* Cabeçalho */}
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-2xl font-bold mb-2">
              <strong>🚫 RELATÓRIO DE CANCELAMENTOS</strong>
            </h1>
            <p className="text-lg font-bold">
              <strong>Sistema de Movimento de Caixa</strong>
            </p>
            <p className="text-sm font-bold">
              <strong>Data: {new Date().toLocaleDateString('pt-BR')}</strong>
            </p>
            <p className="text-sm font-bold">
              <strong>Hora: {new Date().toLocaleTimeString('pt-BR')}</strong>
            </p>
          </div>

          {/* Lista de Cancelamentos */}
          {cancelamentos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg font-bold">
                <strong>Nenhum cancelamento registrado hoje</strong>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cancelamentos.map((cancelamento, index) => (
                <div key={cancelamento.id} className="border-2 border-black p-4 rounded">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-bold">
                        <strong>Pedido:</strong>
                      </span>
                      <span className="font-bold">
                        <strong>{cancelamento.numeroPedido}</strong>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">
                        <strong>Hora:</strong>
                      </span>
                      <span className="font-bold">
                        <strong>{cancelamento.horaCancelamento}</strong>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">
                        <strong>Vendedor:</strong>
                      </span>
                      <span className="font-bold">
                        <strong>{cancelamento.vendedor}</strong>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">
                        <strong>Novo Pedido:</strong>
                      </span>
                      <span className="font-bold">
                        <strong>{cancelamento.numeroNovoPedido}</strong>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">
                        <strong>Motivo:</strong>
                      </span>
                      <span className="font-bold">
                        <strong>{cancelamento.motivo}</strong>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">
                        <strong>Gerente:</strong>
                      </span>
                      <span className="font-bold">
                        <strong>{cancelamento.assinaturaGerente}</strong>
                      </span>
                    </div>
                    <div className="flex justify-between col-span-2 border-t-2 border-black pt-2 mt-2">
                      <span className="font-bold text-lg">
                        <strong>Valor:</strong>
                      </span>
                      <span className="font-bold text-xl text-red-600">
                        <strong>{formatCurrency(cancelamento.valor)}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="border-t-4 border-black pt-4 mt-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xl">
                    <strong>💰 TOTAL CANCELAMENTOS:</strong>
                  </span>
                  <span className="font-bold text-2xl text-red-600">
                    <strong>{formatCurrency(totalCancelamentos)}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Rodapé */}
          <div className="text-center border-t-2 border-black pt-4 mt-6">
            <p className="text-sm font-bold">
              <strong>Webyte | Tecnologia Laravel</strong>
            </p>
            <p className="text-xs font-bold">
              <strong>Relatório gerado automaticamente pelo Sistema de Movimento de Caixa</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Estilo para impressão de cancelamentos */}
      <style jsx>{`
        @media print {
          #print-cancelamentos {
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            position: static !important;
            z-index: auto !important;
          }
          
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            font-weight: bold !important;
            margin: 0;
            padding: 0;
          }
          
          * {
            font-weight: bold !important;
          }
          
          h1, h2, h3, h4, h5, h6 {
            font-weight: bold !important;
          }
          
          p, div, span, label, input, button, select {
            font-weight: bold !important;
          }
          
          .text-sm, .text-xs, .text-lg, .text-xl, .text-2xl {
            font-weight: bold !important;
          }
          
          .font-medium, .font-semibold, .font-bold {
            font-weight: bold !important;
          }
          
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Modal de Demo Expirada */}
      <DemoExpiredModal
        isOpen={showDemoExpiredModal}
        onClose={() => setShowDemoExpiredModal(false)}
        onContact={() => {
          setShowDemoExpiredModal(false);
          if (onBackToLanding) {
            onBackToLanding();
          }
        }}
      />

      {/* Painel do Proprietário */}
      <OwnerPanel
        isOpen={showOwnerPanel}
        onClose={() => setShowOwnerPanel(false)}
        onConfigUpdate={(config) => setCompanyConfig(config)}
      />

      {/* Modal de Limitação de Acesso */}
      <AccessLimitationModal
        isOpen={showAccessLimitation}
        onClose={() => setShowAccessLimitation(false)}
        onUpgrade={() => {
          setShowAccessLimitation(false);
          if (onBackToLanding) {
            onBackToLanding();
          }
        }}
        limitation={{
          maxRecords: accessControl.maxRecords,
          currentRecords: accessControl.currentRecords,
          isTrialExpired: accessControl.isTrialExpired,
          daysLeftInTrial: accessControl.daysLeftInTrial
        }}
      />

    </>
  );
}

export default React.memo(CashFlow);