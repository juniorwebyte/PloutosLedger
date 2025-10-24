import React, { useState, useEffect } from 'react';
import { Cancelamento } from '../types';
import { formatCurrency } from '../utils/currency';
import { useCashFlow } from '../hooks/useCashFlow';
import { AuditLogger, validateCancelamento, verifyDataIntegrity } from '../utils/audit';
import CancelamentosCupomFiscal from './CancelamentosCupomFiscal';

interface CancelamentosProps {
  onBack: () => void;
  isDemo?: boolean;
}

const MOTIVOS_CANCELAMENTO = [
  'Produto defeituoso',
  'Cliente desistiu',
  'Erro no pedido',
  'Problema no pagamento',
  'Produto indisponível',
  'Outro'
];

export default function Cancelamentos({ onBack, isDemo = false }: CancelamentosProps) {
  const { cancelamentos, setCancelamentos } = useCashFlow();
  const [novoCancelamento, setNovoCancelamento] = useState<Partial<Cancelamento>>({
    numeroPedido: '',
    horaCancelamento: '',
    vendedor: '',
    numeroNovoPedido: '',
    motivo: '',
    valor: 0,
    assinaturaGerente: '',
    data: new Date().toISOString().split('T')[0]
  });
  const [mostrarCampos, setMostrarCampos] = useState(false);
  const [erro, setErro] = useState<string>('');
  const [auditLogger] = useState(() => AuditLogger.getInstance());

  // Salvar cancelamentos usando o hook
  const salvarCancelamentos = (novosCancelamentos: Cancelamento[]) => {
    setCancelamentos(novosCancelamentos);
  };

  // Verificar integridade dos dados ao carregar
  useEffect(() => {
    const integrityCheck = verifyDataIntegrity(cancelamentos);
    if (!integrityCheck.isValid) {
      console.warn('Problemas de integridade encontrados:', integrityCheck.issues);
    }
  }, [cancelamentos]);

  const handleNumeroPedidoChange = (valor: string) => {
    setNovoCancelamento(prev => ({ ...prev, numeroPedido: valor }));
    setMostrarCampos(valor.length > 0);
    setErro('');
  };

  const handleInputChange = (campo: keyof Cancelamento, valor: string | number) => {
    setNovoCancelamento(prev => ({ ...prev, [campo]: valor }));
    setErro('');
  };

  const validarCancelamento = (): boolean => {
    const validation = validateCancelamento(novoCancelamento);
    if (!validation.isValid) {
      setErro(validation.errors[0]); // Mostrar apenas o primeiro erro
      return false;
    }
    return true;
  };

  const adicionarCancelamento = () => {
    if (!validarCancelamento()) return;

    const cancelamento: Cancelamento = {
      id: Date.now().toString(),
      numeroPedido: novoCancelamento.numeroPedido!,
      horaCancelamento: novoCancelamento.horaCancelamento!,
      vendedor: novoCancelamento.vendedor!,
      numeroNovoPedido: novoCancelamento.numeroNovoPedido!,
      motivo: novoCancelamento.motivo!,
      valor: novoCancelamento.valor!,
      assinaturaGerente: novoCancelamento.assinaturaGerente!,
      data: novoCancelamento.data!
    };

    const novosCancelamentos = [...cancelamentos, cancelamento];
    salvarCancelamentos(novosCancelamentos);

    // Log de auditoria
    auditLogger.log(
      'CREATE',
      'CANCELAMENTO',
      cancelamento.id,
      `Cancelamento criado: Pedido ${cancelamento.numeroPedido}, Valor ${formatCurrency(cancelamento.valor)}, Motivo: ${cancelamento.motivo}`,
      'Sistema'
    );

    // Limpar formulário
    setNovoCancelamento({
      numeroPedido: '',
      horaCancelamento: '',
      vendedor: '',
      numeroNovoPedido: '',
      motivo: '',
      valor: 0,
      assinaturaGerente: '',
      data: new Date().toISOString().split('T')[0]
    });
    setMostrarCampos(false);
    setErro('');
  };

  const removerCancelamento = (id: string) => {
    const cancelamentoRemovido = cancelamentos.find(c => c.id === id);
    const novosCancelamentos = cancelamentos.filter(c => c.id !== id);
    salvarCancelamentos(novosCancelamentos);

    // Log de auditoria
    if (cancelamentoRemovido) {
      auditLogger.log(
        'DELETE',
        'CANCELAMENTO',
        id,
        `Cancelamento removido: Pedido ${cancelamentoRemovido.numeroPedido}, Valor ${formatCurrency(cancelamentoRemovido.valor)}`,
        'Sistema'
      );
    }
  };

  const obterHoraAtual = () => {
    const agora = new Date();
    return agora.toTimeString().slice(0, 5);
  };

  const totalCancelamentos = cancelamentos.reduce((total, c) => total + c.valor, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Controle de Cancelamentos</h1>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Voltar
            </button>
          </div>
          
          {isDemo && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <strong>Modo Demo:</strong> Esta é uma demonstração da funcionalidade de cancelamentos.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário de Novo Cancelamento */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Novo Cancelamento</h2>
            
            {erro && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {erro}
              </div>
            )}

            <div className="space-y-4">
              {/* Número do Pedido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número do Pedido a ser Cancelado *
                </label>
                <input
                  type="text"
                  value={novoCancelamento.numeroPedido || ''}
                  onChange={(e) => handleNumeroPedidoChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite o número do pedido"
                />
              </div>

              {/* Campos que aparecem após inserir o número do pedido */}
              {mostrarCampos && (
                <>
                  {/* Hora do Cancelamento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora do Cancelamento *
                    </label>
                    <input
                      type="time"
                      value={novoCancelamento.horaCancelamento || obterHoraAtual()}
                      onChange={(e) => handleInputChange('horaCancelamento', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Vendedor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendedor *
                    </label>
                    <input
                      type="text"
                      value={novoCancelamento.vendedor || ''}
                      onChange={(e) => handleInputChange('vendedor', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome ou código do vendedor"
                    />
                  </div>

                  {/* Número do Novo Pedido */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número do Novo Pedido que Substituiu *
                    </label>
                    <input
                      type="text"
                      value={novoCancelamento.numeroNovoPedido || ''}
                      onChange={(e) => handleInputChange('numeroNovoPedido', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Número do pedido substituto"
                    />
                  </div>

                  {/* Motivo do Cancelamento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo do Cancelamento *
                    </label>
                    <select
                      value={novoCancelamento.motivo || ''}
                      onChange={(e) => handleInputChange('motivo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione o motivo</option>
                      {MOTIVOS_CANCELAMENTO.map(motivo => (
                        <option key={motivo} value={motivo}>{motivo}</option>
                      ))}
                    </select>
                  </div>

                  {/* Valor do Cancelamento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor do Cancelamento *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={novoCancelamento.valor || ''}
                      onChange={(e) => handleInputChange('valor', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0,00"
                    />
                  </div>

                  {/* Assinatura da Gerente */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assinatura da Gerente *
                    </label>
                    <input
                      type="text"
                      value={novoCancelamento.assinaturaGerente || ''}
                      onChange={(e) => handleInputChange('assinaturaGerente', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome da gerente"
                    />
                  </div>

                  {/* Botão Adicionar */}
                  <button
                    onClick={adicionarCancelamento}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    + Adicionar Cancelamento
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Lista de Cancelamentos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Cancelamentos do Dia</h2>
              <div className="text-sm text-gray-600">
                Total: {formatCurrency(totalCancelamentos)}
              </div>
            </div>

            {cancelamentos.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Nenhum cancelamento registrado hoje
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cancelamentos.map((cancelamento) => (
                  <div key={cancelamento.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          Pedido: {cancelamento.numeroPedido}
                        </div>
                        <div className="text-sm text-gray-600">
                          Hora: {cancelamento.horaCancelamento} | Vendedor: {cancelamento.vendedor}
                        </div>
                        <div className="text-sm text-gray-600">
                          Novo Pedido: {cancelamento.numeroNovoPedido}
                        </div>
                        <div className="text-sm text-gray-600">
                          Motivo: {cancelamento.motivo}
                        </div>
                        <div className="text-sm text-gray-600">
                          Gerente: {cancelamento.assinaturaGerente}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">
                          {formatCurrency(cancelamento.valor)}
                        </div>
                        <button
                          onClick={() => removerCancelamento(cancelamento.id)}
                          className="text-red-500 hover:text-red-700 text-sm mt-1"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Botões de Impressão */}
        {cancelamentos.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <CancelamentosCupomFiscal cancelamentos={cancelamentos} />
            </div>
            <div className="text-center">
              <button
                onClick={() => {
                  // Criar elemento temporário para impressão apenas dos cancelamentos
                  const printElement = document.getElementById('print-cancelamentos');
                  if (printElement) {
                    printElement.style.display = 'block';
                    setTimeout(() => {
                      window.print();
                      setTimeout(() => {
                        printElement.style.display = 'none';
                      }, 1000);
                    }, 100);
                  }
                }}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                📄 Imprimir Relatório Detalhado
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Elemento de impressão específico para cancelamentos */}
      <div id="print-cancelamentos" className="print-only fixed inset-0 bg-white z-50 p-4 text-black" style={{ display: 'none' }}>
        <div className="max-w-xs mx-auto text-[10px]">
          {/* Cabeçalho */}
          <div className="text-center mb-4">
            <h1 className="text-lg font-bold mb-2">RELATÓRIO DE CANCELAMENTOS</h1>
            <p className="text-sm">{new Date().toLocaleDateString('pt-BR')} - {new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</p>
          </div>

          {/* Lista de cancelamentos */}
          {cancelamentos.map((cancelamento, index) => (
            <div key={index} className="border-b border-gray-300 pb-2 mb-2">
              <div className="text-xs">
                <div><strong>Pedido:</strong> {cancelamento.numeroPedido}</div>
                <div><strong>Hora:</strong> {cancelamento.horaCancelamento}</div>
                <div><strong>Vendedor:</strong> {cancelamento.vendedor}</div>
                <div><strong>Novo Pedido:</strong> {cancelamento.numeroNovoPedido}</div>
                <div><strong>Motivo:</strong> {cancelamento.motivo}</div>
                <div><strong>Valor:</strong> {formatCurrency(cancelamento.valor)}</div>
                <div><strong>Gerente:</strong> {cancelamento.assinaturaGerente}</div>
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="border-t border-gray-300 pt-2 mt-4 text-center">
            <div className="font-bold">
              <strong>TOTAL: {formatCurrency(cancelamentos.reduce((sum, c) => sum + c.valor, 0))}</strong>
            </div>
          </div>

          {/* Rodapé */}
          <div className="text-center mt-4 text-xs">
            <div>Webyte Desenvolvimentos - Rua Agrimensor Sugaya 1203, Bloco 5 Sala 32</div>
            <div>São Paulo - SP</div>
            <div>Webyte | Tecnologia Laravel</div>
          </div>
        </div>
      </div>

      {/* Estilo para impressão */}
      <style jsx>{`
        @media print {
          /* Esconder todos os elementos da página */
          body * {
            visibility: hidden !important;
          }
          
          /* Mostrar apenas o elemento de impressão de cancelamentos */
          #print-cancelamentos,
          #print-cancelamentos * {
            visibility: visible !important;
            display: block !important;
          }
          
          #print-cancelamentos {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: white !important;
            z-index: 9999 !important;
            padding: 20px !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            font-weight: bold !important;
          }
          
          * {
            font-weight: bold !important;
          }
          
          .print-header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-weight: bold !important;
          }
          
          .print-section {
            margin-bottom: 20px;
            font-weight: bold !important;
          }
          
          .print-item {
            border-bottom: 1px solid #ccc;
            padding: 5px 0;
            font-weight: bold !important;
          }
          
          .print-total {
            font-weight: bold !important;
            font-size: 14px;
            text-align: right;
            margin-top: 10px;
            border-top: 2px solid #000;
            padding-top: 10px;
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
        }
      `}</style>
    </div>
  );
}
