import React, { useState, useEffect } from 'react';
import { Cancelamento } from '../types';
import { formatCurrency } from '../utils/currency';
import { useCashFlow } from '../hooks/useCashFlow';
import { AuditLogger, validateCancelamento, verifyDataIntegrity } from '../utils/audit';
import CancelamentosPrint from './CancelamentosPrint';
import CancelamentosCupomFiscal from './CancelamentosCupomFiscal';

interface CancelamentosModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export default function CancelamentosModal({ isOpen, onClose, isDemo = false }: CancelamentosModalProps) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-xl font-bold">📄</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Controle de Cancelamentos</h1>
                <p className="text-orange-100 text-sm">Gestão completa de cancelamentos do dia</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {isDemo && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mt-4 relative z-10">
              <strong>Modo Demo:</strong> Esta é uma demonstração da funcionalidade de cancelamentos.
            </div>
          )}
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulário de Novo Cancelamento */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">+</span>
                </div>
                Novo Cancelamento
              </h2>
              
              {erro && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <strong>❌ Erro:</strong> {erro}
                </div>
              )}

              <div className="space-y-4">
                {/* Número do Pedido */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Número do Pedido a ser Cancelado *
                  </label>
                  <input
                    type="text"
                    value={novoCancelamento.numeroPedido || ''}
                    onChange={(e) => handleNumeroPedidoChange(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-bold"
                    placeholder="Digite o número do pedido"
                  />
                </div>

                {/* Campos que aparecem após inserir o número do pedido */}
                {mostrarCampos && (
                  <>
                    {/* Hora do Cancelamento */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Hora do Cancelamento *
                      </label>
                      <input
                        type="time"
                        value={novoCancelamento.horaCancelamento || obterHoraAtual()}
                        onChange={(e) => handleInputChange('horaCancelamento', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-bold"
                      />
                    </div>

                    {/* Vendedor */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Vendedor *
                      </label>
                      <input
                        type="text"
                        value={novoCancelamento.vendedor || ''}
                        onChange={(e) => handleInputChange('vendedor', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-bold"
                        placeholder="Nome ou código do vendedor"
                      />
                    </div>

                    {/* Número do Novo Pedido */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Número do Novo Pedido que Substituiu *
                      </label>
                      <input
                        type="text"
                        value={novoCancelamento.numeroNovoPedido || ''}
                        onChange={(e) => handleInputChange('numeroNovoPedido', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-bold"
                        placeholder="Número do pedido substituto"
                      />
                    </div>

                    {/* Motivo do Cancelamento */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Motivo do Cancelamento *
                      </label>
                      <select
                        value={novoCancelamento.motivo || ''}
                        onChange={(e) => handleInputChange('motivo', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-bold"
                      >
                        <option value="">Selecione o motivo</option>
                        {MOTIVOS_CANCELAMENTO.map(motivo => (
                          <option key={motivo} value={motivo}>{motivo}</option>
                        ))}
                      </select>
                    </div>

                    {/* Valor do Cancelamento */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Valor do Cancelamento *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={novoCancelamento.valor || ''}
                        onChange={(e) => handleInputChange('valor', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-bold"
                        placeholder="0,00"
                      />
                    </div>

                    {/* Assinatura da Gerente */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Assinatura da Gerente *
                      </label>
                      <input
                        type="text"
                        value={novoCancelamento.assinaturaGerente || ''}
                        onChange={(e) => handleInputChange('assinaturaGerente', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-bold"
                        placeholder="Nome da gerente"
                      />
                    </div>

                    {/* Botão Adicionar */}
                    <button
                      onClick={adicionarCancelamento}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      ✅ Adicionar Cancelamento
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Lista de Cancelamentos */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">📋</span>
                  </div>
                  Cancelamentos do Dia
                </h2>
                <div className="text-sm font-bold text-gray-600 bg-white px-3 py-2 rounded-lg border">
                  Total: <span className="text-red-600">{formatCurrency(totalCancelamentos)}</span>
                </div>
              </div>

              {cancelamentos.length === 0 ? (
                <div className="text-center text-gray-500 py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-4xl mb-2">📝</div>
                  <p className="font-bold">Nenhum cancelamento registrado hoje</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {cancelamentos.map((cancelamento) => (
                    <div key={cancelamento.id} className="border-2 border-gray-200 rounded-xl p-4 bg-white hover:shadow-lg transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-bold text-gray-800 text-lg">
                            Pedido: {cancelamento.numeroPedido}
                          </div>
                          <div className="text-sm font-bold text-gray-600 space-y-1">
                            <div>🕐 Hora: {cancelamento.horaCancelamento} | 👤 Vendedor: {cancelamento.vendedor}</div>
                            <div>🔄 Novo Pedido: {cancelamento.numeroNovoPedido}</div>
                            <div>📝 Motivo: {cancelamento.motivo}</div>
                            <div>✍️ Gerente: {cancelamento.assinaturaGerente}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-red-600 text-xl">
                            {formatCurrency(cancelamento.valor)}
                          </div>
                          <button
                            onClick={() => removerCancelamento(cancelamento.id)}
                            className="text-red-500 hover:text-red-700 text-sm font-bold mt-1 bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                          >
                            🗑️ Remover
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
                    const printElement = document.getElementById('print-cancelamentos-modal');
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
      </div>

      {/* Elemento de impressão específico para cancelamentos do modal */}
      <div id="print-cancelamentos-modal" className="print-only fixed inset-0 bg-white z-50 p-4 text-black" style={{ display: 'none' }}>
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
          
          /* Mostrar apenas o elemento de impressão de cancelamentos do modal */
          #print-cancelamentos-modal,
          #print-cancelamentos-modal * {
            visibility: visible !important;
            display: block !important;
          }
          
          #print-cancelamentos-modal {
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
