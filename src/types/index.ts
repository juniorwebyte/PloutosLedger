// Interface para cheques
export interface Cheque {
  banco: string;
  agencia: string;
  numeroCheque: string;
  nomeCliente: string;
  valor: number;
  dataVencimento?: string; // Para cheques predatados
}

export interface CashFlowEntry {
  dinheiro: number;
  fundoCaixa: number;
  cartao: number;
  cartaoLink: number;
  clienteCartaoLink: string;
  parcelasCartaoLink: number;
  boletos: number;
  clienteBoletos: string;
  parcelasBoletos: number;
  pixMaquininha: number;
  pixConta: number;
  cliente1Nome: string;
  cliente1Valor: number;
  cliente2Nome: string;
  cliente2Valor: number;
  cliente3Nome: string;
  cliente3Valor: number;
  
  // Novos campos para PIX Conta - múltiplos clientes
  pixContaClientes: { nome: string; valor: number }[];
  
  // Novos campos para Cartão Link - múltiplos clientes
  cartaoLinkClientes: { nome: string; valor: number; parcelas: number }[];
  
  // Novos campos para Boletos - múltiplos clientes
  boletosClientes: { nome: string; valor: number; parcelas: number }[];
  
  // Novos campos solicitados
  cheque: number;
  cheques: Cheque[];
  outros: number;
  outrosDescricao: string;
}

// Interface para múltiplas devoluções
export interface Devolucao {
  cpf: string;
  valor: number;
  incluidoNoMovimento: boolean;
}

// Interface para múltiplos envios de correios
export interface EnvioCorreios {
  tipo: '' | 'PAC' | 'SEDEX';
  estado: string;
  cliente: string;
  valor: number;
  incluidoNoMovimento: boolean;
}

// Interface para envios via transportadora
export interface EnvioTransportadora {
  nomeCliente: string;
  estado: string;
  peso: number;
  quantidade: number;
  valor: number;
}

// Interface para múltiplas saídas/retiradas
export interface SaidaRetirada {
  descricao: string;
  valor: number;
  incluidoNoMovimento: boolean;
}

export interface CashFlowExit {
  descontos: number;
  saida: number;
  justificativaSaida: string;
  justificativaCompra: string;
  valorCompra: number;
  justificativaSaidaDinheiro: string;
  valorSaidaDinheiro: number;
  
  // Múltiplas saídas/retiradas
  saidasRetiradas: SaidaRetirada[];
  
  // Crédito/Devolução - Múltiplas devoluções
  devolucoes: Devolucao[];
  
  // Correios/Frete - Múltiplos envios
  enviosCorreios: EnvioCorreios[];
  
  // Transportadora - Múltiplos envios
  enviosTransportadora: EnvioTransportadora[];
  
  valesFuncionarios: { nome: string; valor: number }[];
  valesIncluidosNoMovimento: boolean;
  puxadorNome: string;
  puxadorPorcentagem: number;
  puxadorValor: number;
  
  // Múltiplos clientes do puxador
  puxadorClientes: { nome: string; valor: number }[];
  
  // Campos legados para compatibilidade
  creditoDevolucao: number;
  cpfCreditoDevolucao: string;
  creditoDevolucaoIncluido: boolean;
  correiosFrete: number;
  correiosTipo: string;
  correiosEstado: string;
  correiosClientes: string[];
}

// Interface para cancelamentos
export interface Cancelamento {
  id: string;
  numeroPedido: string;
  horaCancelamento: string;
  vendedor: string;
  numeroNovoPedido: string;
  motivo: string;
  valor: number;
  assinaturaGerente: string;
  data: string;
}

export interface CashFlowData {
  entries: CashFlowEntry;
  exits: CashFlowExit;
  total: number;
  date: string;
  cancelamentos?: Cancelamento[];
}

// Interface para configurações da empresa
export interface CompanyConfig {
  id: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  inscricaoEstadual: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  contato: {
    telefone: string;
    email: string;
    site: string;
  };
  pix: {
    chave: string;
    tipo: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
    banco: string;
    agencia: string;
    conta: string;
  };
  personalizacao: {
    corPrimaria: string;
    corSecundaria: string;
    logo: string;
    favicon: string;
  };
  configuracao: {
    moeda: string;
    fusoHorario: string;
    formatoData: string;
    formatoHora: string;
  };
}

// Interface para cobrança PIX
export interface PixCobranca {
  id: string;
  txid: string;
  valor: number;
  chave: string;
  descricao: string;
  status: 'ATIVA' | 'CONCLUIDA' | 'REMOVIDA_PELO_USUARIO_RECEBEDOR' | 'REMOVIDA_PELO_PSP';
  qrCode: string;
  qrCodeImage: string;
  dataCriacao: string;
  dataExpiracao: string;
  cliente: {
    nome: string;
    email: string;
    telefone: string;
    empresa: string;
  };
}

// Interface para Parcela de Nota Fiscal
export interface ParcelaNotaFiscal {
  id: string;
  numeroParcela: number;
  valor: number;
  dataVencimento: string;
  status: 'pendente' | 'paga' | 'vencida';
  dataPagamento?: string;
  observacoes?: string;
}

// Interface para Nota Fiscal - Caderno de Notas com Sistema de Parcelas
export interface NotaFiscal {
  id: string;
  dataEntrada: string;
  fabricacao: string;
  numeroNfe: string;
  total: number;
  totalParcelas: number;
  valorParcela: number;
  parcelas: ParcelaNotaFiscal[];
  status: 'ativa' | 'vencida' | 'quitada' | 'parcialmente_paga';
  observacoes?: string;
  dataCriacao: string;
  dataAtualizacao: string;
  // Campos para compatibilidade com versão anterior
  vencimento?: string;
}

// Interface para o Caderno de Notas
export interface CadernoNotasData {
  notas: NotaFiscal[];
  totalNotas: number;
  valorTotal: number;
  valorVencido: number;
  valorVencendo: number;
  dataUltimaAtualizacao: string;
}