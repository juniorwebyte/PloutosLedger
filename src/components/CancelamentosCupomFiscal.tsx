import React from 'react';
import { Cancelamento } from '../types';
import { formatCurrency } from '../utils/currency';
import { BUSINESS_CONFIG } from '../config/system';

interface CancelamentosCupomFiscalProps {
  cancelamentos: Cancelamento[];
}

export default function CancelamentosCupomFiscal({ cancelamentos }: CancelamentosCupomFiscalProps) {
  const handlePrint = () => {
    const printElement = document.getElementById('print-cupom-fiscal-cancelamentos');
    
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
        🧾 CUPOM FISCAL DE CANCELAMENTOS
      </button>

      {/* Elemento de impressão do cupom fiscal */}
      <div id="print-cupom-fiscal-cancelamentos" className="hidden">
        <div className="p-4 bg-white text-black">
          {/* Cabeçalho do Cupom Fiscal */}
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-2xl font-bold mb-2">
              <strong>🧾 CUPOM FISCAL DE CANCELAMENTOS</strong>
            </h1>
            <p className="text-lg font-bold">
              <strong>CONTROLE DE CANCELAMENTOS</strong>
            </p>
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

          {/* Informações da Empresa */}
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <p className="text-lg font-bold">
              <strong>{BUSINESS_CONFIG.COMPANY.NAME}</strong>
            </p>
            <p className="text-sm font-bold">
              <strong>{BUSINESS_CONFIG.COMPANY.ADDRESS}</strong>
            </p>
            <p className="text-sm font-bold">
              <strong>{BUSINESS_CONFIG.COMPANY.CITY}</strong>
            </p>
          </div>

          {/* Lista de Cancelamentos */}
          {cancelamentos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg font-bold">
                <strong>NENHUM CANCELAMENTO REGISTRADO</strong>
              </p>
              <p className="text-sm font-bold">
                <strong>Não há cancelamentos para o dia de hoje</strong>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cancelamentos.map((cancelamento, index) => (
                <div key={cancelamento.id} className="border-2 border-black p-4 rounded">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold">
                      <strong>🚫 CANCELAMENTO #{index + 1}</strong>
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-bold">
                        <strong>PEDIDO CANCELADO:</strong>
                      </span>
                      <span className="font-bold">
                        <strong>{cancelamento.numeroPedido}</strong>
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-bold">
                        <strong>HORA CANCELAMENTO:</strong>
                      </span>
                      <span className="font-bold">
                        <strong>{cancelamento.horaCancelamento}</strong>
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-bold">
                        <strong>VENDEDOR:</strong>
                      </span>
                      <span className="font-bold">
                        <strong>{cancelamento.vendedor}</strong>
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-bold">
                        <strong>NOVO PEDIDO:</strong>
                      </span>
                      <span className="font-bold">
                        <strong>{cancelamento.numeroNovoPedido}</strong>
                      </span>
                    </div>
                    
                    <div className="flex justify-between col-span-2">
                      <span className="font-bold">
                        <strong>MOTIVO DO CANCELAMENTO:</strong>
                      </span>
                      <span className="font-bold">
                        <strong>{cancelamento.motivo}</strong>
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-bold">
                        <strong>GERENTE RESPONSÁVEL:</strong>
                      </span>
                      <span className="font-bold">
                        <strong>{cancelamento.assinaturaGerente}</strong>
                      </span>
                    </div>
                    
                    <div className="flex justify-between border-t-2 border-black pt-2 mt-2 col-span-2">
                      <span className="font-bold text-lg">
                        <strong>💰 VALOR CANCELADO:</strong>
                      </span>
                      <span className="font-bold text-xl text-red-600">
                        <strong>{formatCurrency(cancelamento.valor)}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Resumo Total */}
              <div className="border-t-4 border-black pt-4 mt-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold">
                    <strong>📊 RESUMO GERAL DOS CANCELAMENTOS</strong>
                  </h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="font-bold">
                      <strong>TOTAL DE CANCELAMENTOS:</strong>
                    </span>
                    <span className="font-bold">
                      <strong>{cancelamentos.length}</strong>
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-bold">
                      <strong>VALOR TOTAL CANCELADO:</strong>
                    </span>
                    <span className="font-bold">
                      <strong>{formatCurrency(totalCancelamentos)}</strong>
                    </span>
                  </div>
                </div>
                
                <div className="border-t-2 border-black pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xl">
                      <strong>💰 VALOR TOTAL EM CANCELAMENTOS:</strong>
                    </span>
                    <span className="font-bold text-2xl text-red-600">
                      <strong>{formatCurrency(totalCancelamentos)}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rodapé do Cupom */}
          <div className="text-center border-t-2 border-black pt-4 mt-6">
            <p className="text-sm font-bold">
              <strong>Este cupom fiscal é um documento oficial</strong>
            </p>
            <p className="text-sm font-bold">
              <strong>do Sistema de Movimento de Caixa</strong>
            </p>
            <p className="text-xs font-bold">
              <strong>Desenvolvido por {BUSINESS_CONFIG.COMPANY.TECHNOLOGY}</strong>
            </p>
            <p className="text-xs font-bold">
              <strong>Relatório gerado automaticamente em {new Date().toLocaleString('pt-BR')}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Estilo para impressão do cupom fiscal */}
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
          
          #print-cupom-fiscal-cancelamentos {
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          /* Estilo específico para cupom fiscal */
          .cupom-fiscal {
            font-family: 'Courier New', monospace;
            font-weight: bold !important;
            font-size: 11px;
            line-height: 1.2;
          }
          
          .cupom-fiscal * {
            font-weight: bold !important;
          }
          
          .cupom-header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
            font-weight: bold !important;
          }
          
          .cupom-section {
            margin-bottom: 15px;
            font-weight: bold !important;
          }
          
          .cupom-item {
            border-bottom: 1px solid #000;
            padding: 5px 0;
            font-weight: bold !important;
          }
          
          .cupom-total {
            font-weight: bold !important;
            font-size: 14px;
            text-align: right;
            margin-top: 10px;
            border-top: 2px solid #000;
            padding-top: 10px;
          }
        }
      `}</style>
    </>
  );
}
