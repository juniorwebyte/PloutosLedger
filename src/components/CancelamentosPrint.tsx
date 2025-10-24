import React from 'react';
import { Cancelamento } from '../types';
import { formatCurrency } from '../utils/currency';

interface CancelamentosPrintProps {
  cancelamentos: Cancelamento[];
}

export default function CancelamentosPrint({ cancelamentos }: CancelamentosPrintProps) {
  const handlePrint = () => {
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
  };

  const totalCancelamentos = cancelamentos.reduce((total, c) => total + c.valor, 0);

  return (
    <>
      <button
        onClick={handlePrint}
        className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        🖨️ Imprimir Relatório de Cancelamentos
      </button>

      {/* Elemento de impressão */}
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

      {/* Estilo para impressão */}
      <style jsx>{`
        @media print {
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
          
          #print-cancelamentos {
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
