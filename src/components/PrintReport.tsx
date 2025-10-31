import React from 'react';
import { CashFlowData } from '../types';
import { formatCurrency } from '../utils/currency';

interface PrintReportProps {
  data: CashFlowData;
}

export default function PrintReport({ data }: PrintReportProps) {
  const handlePrint = (reduced: boolean = false) => {
    // Esconder todos os elementos de impressão primeiro
    const printFull = document.getElementById('print-full');
    const printReduced = document.getElementById('print-reduced');
    
    if (printFull) printFull.style.display = 'none';
    if (printReduced) printReduced.style.display = 'none';
    
    // Mostrar apenas o elemento solicitado
    if (reduced) {
      if (printReduced) {
        printReduced.style.display = 'block';
        // Aguardar um momento para o DOM atualizar
        setTimeout(() => {
          window.print();
          // Restaurar após impressão
          setTimeout(() => {
            if (printReduced) printReduced.style.display = 'none';
          }, 1000);
        }, 100);
      }
    } else {
      if (printFull) {
        printFull.style.display = 'block';
        // Aguardar um momento para o DOM atualizar
        setTimeout(() => {
          window.print();
          // Restaurar após impressão
          setTimeout(() => {
            if (printFull) printFull.style.display = 'none';
          }, 1000);
        }, 100);
      }
    }
  };

  // Calcular total das devoluções incluídas no movimento
  const totalDevolucoes = Array.isArray(data.exits.devolucoes)
    ? data.exits.devolucoes
        .filter(devolucao => devolucao.incluidoNoMovimento)
        .reduce((sum, devolucao) => sum + (Number(devolucao.valor) || 0), 0)
    : 0;

  // Vales de funcionários
  const totalValesFuncionarios = Array.isArray(data.exits.valesFuncionarios)
    ? data.exits.valesFuncionarios.reduce((sum: number, item: { nome: string; valor: number }) => sum + (Number(item.valor) || 0), 0)
    : 0;
  const valesImpactoEntrada = data.exits.valesIncluidosNoMovimento ? totalValesFuncionarios : 0;

  const totalEntradas = 
    data.entries.dinheiro + 
    data.entries.fundoCaixa + 
    data.entries.cartao + 
    data.entries.cartaoLink + 
    data.entries.boletos +
    data.entries.pixMaquininha + 
    data.entries.pixConta +
    totalDevolucoes +
    valesImpactoEntrada;

  const totalSaidas = 
    data.exits.descontos + 
    data.exits.saida + 
    data.exits.creditoDevolucao + 
    (Array.isArray(data.exits.valesFuncionarios) ? data.exits.valesFuncionarios.reduce((s, v) => s + (Number(v.valor) || 0), 0) : 0) +
    (Number(data.exits.puxadorValor) || 0);

  return (
    <>
      <div className="space-y-3">
        <button
          onClick={() => handlePrint(false)}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 transition-all duration-200 font-medium flex items-center justify-center gap-3 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
        >
          <span className="text-lg">🖨️</span>
          <span className="hidden sm:inline">Imprimir Completo</span>
        </button>
        
        <button
          onClick={() => handlePrint(true)}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 transition-all duration-200 font-medium flex items-center justify-center gap-3 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
        >
          <span className="text-lg">📄</span>
          <span className="hidden sm:inline">Imprimir Reduzido</span>
        </button>

      </div>

                {/* CUPOM COMPLETO */}
          <div id="print-full" className="print-only fixed inset-0 bg-white z-50 p-4 text-black">
            <div className="max-w-xs mx-auto text-[11px]">
              {/* CABEÇALHO COM LOGO */}
              <div className="text-center mb-2 border-b border-gray-300 pb-1">
                {/* Logo WebTec */}
                <div className="flex items-center justify-center mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">WebTec</span>
                    <span className="text-xs text-gray-600">®</span>
                  </div>
                </div>
                <h1 className="text-sm font-bold mb-0"><strong>MOVIMENTO DE CAIXA</strong></h1>
                <p className="text-xs mb-0 font-bold"><strong>Data: {new Date(data.date).toLocaleDateString('pt-BR')}</strong></p>
                <p className="text-xs mb-0 font-bold"><strong>Hora: {new Date().toLocaleTimeString('pt-BR')}</strong></p>
              </div>



          {/* ENTRADAS */}
          <div className="mb-2">
            <h2 className="text-sm font-bold mb-1 text-center border-b border-gray-300 pb-1">
              <strong>ENTRADAS</strong>
            </h2>
            <div className="space-y-0">
              <div className="flex justify-between">
                <span className="font-bold"><strong>Dinheiro:</strong></span>
                <span className="font-bold"><strong>{formatCurrency(data.entries.dinheiro)}</strong></span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold"><strong>Fundo Caixa:</strong></span>
                <span className="font-bold"><strong>{formatCurrency(data.entries.fundoCaixa)}</strong></span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold"><strong>Cartao:</strong></span>
                <span className="font-bold"><strong>{formatCurrency(data.entries.cartao)}</strong></span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold"><strong>Cartao Link:</strong></span>
                <span className="font-bold"><strong>{formatCurrency(data.entries.cartaoLink)}</strong></span>
              </div>
              {data.entries.cartaoLink > 0 && (
                <div className="text-xs text-gray-600 ml-2 mb-0 font-bold">
                  {data.entries.cartaoLinkClientes && data.entries.cartaoLinkClientes.length > 0 ? (
                    data.entries.cartaoLinkClientes.map((cliente, index) => (
                      <div key={index}>
                        <strong>Cliente:</strong> {cliente.nome} | <strong>Valor:</strong> {formatCurrency(cliente.valor)} | <strong>Parcelas:</strong> {cliente.parcelas}x
                      </div>
                    ))
                  ) : (
                    <div>
                      <strong>Cliente:</strong> {data.entries.clienteCartaoLink || 'Não informado'} | <strong>Parcelas:</strong> {(data.entries.parcelasCartaoLink || 1)}x
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-bold"><strong>Boletos:</strong></span>
                <span className="font-bold"><strong>{formatCurrency(data.entries.boletos || 0)}</strong></span>
              </div>
              {(data.entries.boletos || 0) > 0 && (
                <div className="text-xs text-gray-600 ml-2 mb-0 font-bold">
                  {data.entries.boletosClientes && data.entries.boletosClientes.length > 0 ? (
                    data.entries.boletosClientes.map((cliente, index) => (
                      <div key={index}>
                        <strong>Cliente:</strong> {cliente.nome} | <strong>Valor:</strong> {formatCurrency(cliente.valor)} | <strong>Parcelas:</strong> {cliente.parcelas}x
                      </div>
                    ))
                  ) : (
                    <div>
                      <strong>Cliente:</strong> {data.entries.clienteBoletos || 'Não informado'} | <strong>Parcelas:</strong> {(data.entries.parcelasBoletos || 1)}x
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-bold"><strong>Pix Maquinha:</strong></span>
                <span className="font-bold"><strong>{formatCurrency(data.entries.pixMaquininha)}</strong></span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold"><strong>Pix Conta:</strong></span>
                <span className="font-bold"><strong>{formatCurrency(data.entries.pixConta)}</strong></span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold"><strong>Cheque:</strong></span>
                <span className="font-bold"><strong>{formatCurrency(data.entries.cheque || 0)}</strong></span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold"><strong>Outros:</strong></span>
                <span className="font-bold"><strong>{formatCurrency(data.entries.outros || 0)}</strong></span>
              </div>
              
              {/* Detalhes dos cheques */}
              {(data.entries.cheques && data.entries.cheques.length > 0) && (
                <div className="text-xs text-gray-600 ml-2 mb-0 font-bold">
                  <strong>Detalhes dos Cheques:</strong>
                  {data.entries.cheques.map((cheque, index) => (
                    <div key={index} className="ml-2">
                      <strong>Cheque {index + 1}:</strong> {cheque.nomeCliente} | Banco: {cheque.banco} | Agência: {cheque.agencia} | N°: {cheque.numeroCheque} | Valor: {formatCurrency(cheque.valor)}{cheque.dataVencimento ? ` | Vencimento: ${cheque.dataVencimento}` : ''}
                    </div>
                  ))}
                </div>
              )}
              
              {(data.entries.cliente1Nome || data.entries.cliente1Valor > 0) && (
                <div className="flex justify-between">
                  <span className="font-bold"><strong>{data.entries.cliente1Nome || 'Cliente 1'}:</strong></span>
                  <span className="font-bold"><strong>{formatCurrency(data.entries.cliente1Valor)}</strong></span>
                </div>
              )}
              
              {(data.entries.cliente2Nome || data.entries.cliente2Valor > 0) && (
                <div className="flex justify-between">
                  <span className="font-bold"><strong>{data.entries.cliente2Nome || 'Cliente 2'}:</strong></span>
                  <span className="font-bold"><strong>{formatCurrency(data.entries.cliente2Valor)}</strong></span>
                </div>
              )}
              
              {(data.entries.cliente3Nome || data.entries.cliente3Valor > 0) && (
                <div className="flex justify-between">
                  <span className="font-bold"><strong>{data.entries.cliente3Nome || 'Cliente 3'}:</strong></span>
                  <span className="font-bold"><strong>{formatCurrency(data.entries.cliente3Valor)}</strong></span>
                </div>
              )}
              
              <div className="border-t border-gray-300 pt-1 mt-1">
                <div className="flex justify-between font-bold">
                  <span className="font-bold"><strong>TOTAL ENTRADAS:</strong></span>
                  <span className="font-bold"><strong>{formatCurrency(totalEntradas)}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* SAÍDAS */}
          <div className="mb-2">
            <h2 className="text-sm font-bold mb-1 text-center border-b border-gray-300 pb-1">
              <strong>SAIDAS</strong>
            </h2>
            <div className="space-y-0">
              <div className="flex justify-between">
                <span className="font-bold"><strong>Descontos:</strong></span>
                <span className="font-bold"><strong>{formatCurrency(data.exits.descontos)}</strong></span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold"><strong>Saida (Retirada):</strong></span>
                <span className="font-bold"><strong>{formatCurrency(data.exits.saida)}</strong></span>
              </div>
              {data.exits.saida > 0 && (
                <>
                  {data.exits.justificativaCompra && (
                    <div className="text-xs text-gray-600 ml-2 mb-0">
                      <strong>Compra:</strong> {data.exits.justificativaCompra} - <strong>Valor:</strong> {formatCurrency(data.exits.valorCompra)}
                    </div>
                  )}
                  {data.exits.justificativaSaidaDinheiro && (
                    <div className="text-xs text-gray-600 ml-2 mb-0">
                      <strong>Saída:</strong> {data.exits.justificativaSaidaDinheiro} - <strong>Valor:</strong> {formatCurrency(data.exits.valorSaidaDinheiro)}
                    </div>
                  )}
                  {/* Status da validação */}
                  <div className={`text-xs ml-2 mb-0 p-1 rounded ${
                    data.exits.valorCompra + data.exits.valorSaidaDinheiro === data.exits.saida
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <div className="flex items-center gap-1">
                      {data.exits.valorCompra + data.exits.valorSaidaDinheiro === data.exits.saida ? (
                        <span className="text-green-600">✅</span>
                      ) : (
                        <span className="text-red-600">❌</span>
                      )}
                      <span className="font-medium">
                        {data.exits.valorCompra + data.exits.valorSaidaDinheiro === data.exits.saida
                          ? 'Valores Conferem'
                          : 'Valores Não Conferem'
                        }
                      </span>
                    </div>
                    {data.exits.valorCompra + data.exits.valorSaidaDinheiro !== data.exits.saida && (
                      <div className="text-xs mt-1">
                        <strong>Diferença:</strong> {formatCurrency(Math.abs(data.exits.valorCompra + data.exits.valorSaidaDinheiro - data.exits.saida))}
                      </div>
                    )}
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="font-bold"><strong>Credito/Devolucao:</strong></span>
                <span className="font-bold"><strong>{formatCurrency(data.exits.creditoDevolucao)}</strong></span>
              </div>
              {data.exits.creditoDevolucao > 0 && data.exits.cpfCreditoDevolucao && (
                <div className="text-xs text-gray-600 ml-2 mb-0 font-bold">
                  <strong>CPF:</strong> {data.exits.cpfCreditoDevolucao}
                  {data.exits.creditoDevolucaoIncluido && (
                    <span className="text-green-600 font-medium"> ✅ <strong>Incluído no Movimento (Entrada)</strong></span>
                  )}
                </div>
              )}
              
              {/* Múltiplas Devoluções */}
              {Array.isArray(data.exits.devolucoes) && data.exits.devolucoes.length > 0 && (
                <div className="text-xs text-gray-600 ml-2 mb-0 font-bold">
                  <strong>Múltiplas Devoluções:</strong>
                  {data.exits.devolucoes.map((devolucao, index) => (
                    <div key={index} className="ml-2">
                      <strong>CPF:</strong> {devolucao.cpf} | <strong>Valor:</strong> {formatCurrency(devolucao.valor)}
                      {devolucao.incluidoNoMovimento && (
                        <span className="text-green-600 font-medium"> ✅ <strong>Incluído no Movimento</strong></span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {Array.isArray(data.exits.valesFuncionarios) && data.exits.valesFuncionarios.length > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="font-bold"><strong>Vales Funcionário:</strong></span>
                    <span className="font-bold"><strong>{formatCurrency(data.exits.valesFuncionarios.reduce((s, v) => s + (Number(v.valor) || 0), 0))}</strong></span>
                  </div>
                  {data.exits.valesFuncionarios.map((v, i) => (
                    <div key={i} className="text-xs text-gray-600 ml-2 mb-0">
                      <strong>{v.nome || `Funcionário ${i + 1}`}:</strong> {formatCurrency(Number(v.valor) || 0)}
                    </div>
                  ))}
                  {data.exits.valesIncluidosNoMovimento && (
                    <div className="text-xs text-green-700 ml-2 mb-0">
                      ✅ <strong>Incluído no Movimento (Saída)</strong>
                    </div>
                  )}
                </>
              )}
              
              <div className="border-t border-gray-300 pt-1 mt-1">
                <div className="flex justify-between font-bold">
                  <span className="font-bold"><strong>TOTAL SAIDAS:</strong></span>
                  <span className="font-bold"><strong>{formatCurrency(totalSaidas)}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* CANCELAMENTOS REMOVIDOS - AGORA É UM CUPOM SEPARADO */}

          {/* CORREIOS/FRETE */}
          {data.exits.correiosFrete > 0 && (
            <div className="mb-2">
              <h2 className="text-sm font-bold mb-1 text-center border-b border-gray-300 pb-1">
                <strong>CORREIOS/FRETE</strong>
              </h2>
              <div className="space-y-0">
                <div className="flex justify-between">
                  <span className="font-bold"><strong>Valor Pago:</strong></span>
                  <span className="font-bold"><strong>{formatCurrency(data.exits.correiosFrete)}</strong></span>
                </div>
                {data.exits.correiosTipo && (
                  <div className="flex justify-between">
                    <span className="font-bold"><strong>Tipo:</strong></span>
                    <span className="font-bold"><strong>{data.exits.correiosTipo}</strong></span>
                  </div>
                )}
                {data.exits.correiosEstado && (
                  <div className="flex justify-between">
                    <span className="font-bold"><strong>Estado:</strong></span>
                    <span className="font-bold"><strong>{data.exits.correiosEstado}</strong></span>
                  </div>
                )}
                {data.exits.correiosCliente && (
                  <div className="flex justify-between">
                    <span className="font-bold"><strong>Cliente:</strong></span>
                    <span className="font-bold"><strong>{data.exits.correiosCliente}</strong></span>
                  </div>
                )}
                {data.exits.correiosClientes && data.exits.correiosClientes.length > 0 && (
                  <div className="text-xs text-gray-600 ml-2 mb-0 font-bold">
                    <strong>Clientes adicionais:</strong> {data.exits.correiosClientes.filter(c => c.trim()).join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MÚLTIPLOS ENVIOS DE CORREIOS */}
          {Array.isArray(data.exits.enviosCorreios) && data.exits.enviosCorreios.length > 0 && (
            <div className="mb-2">
              <h2 className="text-sm font-bold mb-1 text-center border-b border-gray-300 pb-1">
                <strong>MÚLTIPLOS ENVIOS - CORREIOS</strong>
              </h2>
              <div className="space-y-1">
                {data.exits.enviosCorreios.map((envio, index) => (
                  <div key={index} className="border-b border-gray-200 pb-1">
                    <div className="flex justify-between">
                      <span className="font-bold"><strong>Tipo:</strong></span>
                      <span className="font-bold"><strong>{envio.tipo}</strong></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold"><strong>Cliente:</strong></span>
                      <span className="font-bold"><strong>{envio.cliente}</strong></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold"><strong>Estado:</strong></span>
                      <span className="font-bold"><strong>{envio.estado}</strong></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold"><strong>Valor:</strong></span>
                      <span className="font-bold"><strong>{formatCurrency(envio.valor)}</strong></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold"><strong>Status:</strong></span>
                      <span className={`font-bold ${envio.incluidoNoMovimento ? 'text-green-600' : 'text-gray-600'}`}>
                        <strong>{envio.incluidoNoMovimento ? '✅ Incluído no Movimento' : '❌ Apenas Registro'}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TRANSPORTADORA */}
          {Array.isArray(data.exits.enviosTransportadora) && data.exits.enviosTransportadora.length > 0 && (
            <div className="mb-2">
              <h2 className="text-sm font-bold mb-1 text-center border-b border-gray-300 pb-1">
                <strong>TRANSPORTADORA</strong>
              </h2>
              <div className="space-y-1">
                {data.exits.enviosTransportadora.map((envio, index) => (
                  <div key={index} className="border-b border-gray-200 pb-1">
                    <div className="flex justify-between">
                      <span className="font-bold"><strong>Cliente:</strong></span>
                      <span className="font-bold"><strong>{envio.nomeCliente}</strong></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold"><strong>Estado:</strong></span>
                      <span className="font-bold"><strong>{envio.estado}</strong></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold"><strong>Peso:</strong></span>
                      <span className="font-bold"><strong>{envio.peso}kg</strong></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold"><strong>Quantidade:</strong></span>
                      <span className="font-bold"><strong>{envio.quantidade}</strong></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold"><strong>Valor:</strong></span>
                      <span className="font-bold"><strong>{formatCurrency(envio.valor)}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COMISSÃO PUXADOR */}
          {(data.exits.puxadorNome || data.exits.puxadorValor > 0 || data.exits.puxadorPorcentagem > 0) && (
            <div className="mb-2">
              <h2 className="text-sm font-bold mb-1 text-center border-b border-gray-300 pb-1">
                <strong>COMISSÃO PUXADOR</strong>
              </h2>
              <div className="space-y-0 text-xs text-gray-700">
                <div><strong>Nome:</strong> {data.exits.puxadorNome || '—'}</div>
                <div><strong>Percentual:</strong> {data.exits.puxadorPorcentagem || 0}%</div>
                <div><strong>Valor:</strong> {formatCurrency(data.exits.puxadorValor)}</div>
              </div>
            </div>
          )}

          {/* TOTAL FINAL */}
          <div className="border-t-2 border-gray-400 pt-1 mb-2">
            <div className="text-center">
              <div className="font-bold text-sm mb-0"><strong>TOTAL EM CAIXA:</strong></div>
              <div className="text-lg font-bold"><strong>{formatCurrency(data.total)}</strong></div>
            </div>
          </div>

          {/* LINHA SEPARADORA */}
          <div className="text-center border-t border-gray-300 pt-1">
            <p className="text-xs mb-0 font-bold"><strong>================================</strong></p>
            <p className="text-xs mb-0 font-bold"><strong>Webyte | Tecnologia Laravel</strong></p>
            <p className="text-xs mb-0 font-bold"><strong>Gerado: {new Date().toLocaleString('pt-BR')}</strong></p>
            <p className="text-xs mb-0 font-bold"><strong>================================</strong></p>
          </div>
        </div>
      </div>

            {/* CUPOM REDUZIDO - EXATAMENTE COMO SOLICITADO */}
            <div id="print-reduced" className="print-only fixed inset-0 bg-white z-50 p-4 text-black">
              <div className="max-w-xs mx-auto text-[10px]">
                {/* CABEÇALHO REDUZIDO */}
                <div className="text-center mb-2">
                  <div className="flex items-center justify-center mb-1">
                    <div className="flex items-center space-x-1">
                      <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">P</span>
                      </div>
                      <span className="text-xs font-bold text-gray-800">WebTec</span>
                      <span className="text-xs text-gray-600">®</span>
                    </div>
                  </div>
                  <h1 className="text-xs font-bold mb-0"><strong>MOVIMENTO CAIXA</strong></h1>
                  <p className="text-xs mb-0"><strong>{new Date(data.date).toLocaleDateString('pt-BR')} - {new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</strong></p>
                </div>

                {/* RESUMO FINANCEIRO REDUZIDO */}
                <div className="mb-2">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold"><strong>ENTRADAS:</strong></span>
                      <span className="font-bold"><strong>{formatCurrency(totalEntradas)}</strong></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold"><strong>SAIDAS:</strong></span>
                      <span className="font-bold"><strong>{formatCurrency(totalSaidas)}</strong></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold"><strong>TOTAL CAIXA:</strong></span>
                      <span className="font-bold"><strong>{formatCurrency(totalEntradas)}</strong></span>
                    </div>
                  </div>
                </div>

                {/* COMISSÃO PUXADOR */}
                <div className="mb-2">
                  <div className="flex justify-between">
                    <span><strong>Comissão Puxador:</strong></span>
                    <span>-{formatCurrency(data.exits.puxadorValor)}</span>
                  </div>
                </div>

                {/* RODAPÉ REDUZIDO */}
                <div className="border-t border-gray-300 pt-2 text-center">
                  <div className="text-xs font-bold mb-1">MASTER BOYS - GENIALI - SILVA TELES, 22 - PARI</div>
                  <div className="text-xs mb-1">BRÁS - SP</div>
                  <div className="text-xs">{new Date().toLocaleDateString('pt-BR')}, {new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit', second: '2-digit'})}</div>
                  <div className="text-xs">Webyte | Tecnologia Laravel</div>
                </div>
              </div>
            </div>

      <style>{`
        @media print {
          /* Esconder todo o conteúdo da página */
          body * {
            visibility: hidden !important;
          }
          
          /* Configuração da página para impressão centralizada */
          @page {
            size: 80mm auto;
            margin: 0;
            orientation: portrait;
          }
          
          /* Mostrar apenas o elemento de impressão ativo */
          .print-only {
            display: block !important;
            position: static !important;
            inset: auto !important;
            padding: 0 !important;
            margin: 0 auto !important;
            background: #fff !important;
            visibility: visible !important;
            width: 100% !important;
            text-align: center !important;
          }
          
          .print-only * {
            visibility: visible !important;
          }

          /* CUPOM COMPLETO - CENTRALIZAÇÃO PERFEITA */
          #print-full {
            width: 100% !important;
            max-width: 80mm !important;
            margin: 0 auto !important;
            padding: 4mm !important;
            display: block !important;
            visibility: visible !important;
            text-align: center !important;
            background: white !important;
          }
          
          #print-full .max-w-xs {
            width: 100% !important;
            max-width: 76mm !important;
            margin: 0 auto !important;
            text-align: left !important;
          }
          
          /* Centralizar cabeçalho */
          #print-full .text-center {
            text-align: center !important;
            width: 100% !important;
          }
          
          /* Alinhamento das linhas de entrada/saída */
          #print-full .flex.justify-between {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            width: 100% !important;
            text-align: left !important;
          }
          
          #print-full .flex.justify-between span:first-child {
            text-align: left !important;
            flex: 1 !important;
          }
          
          #print-full .flex.justify-between span:last-child {
            text-align: right !important;
            margin-left: auto !important;
          }
          
          /* CUPOM REDUZIDO - CENTRALIZAÇÃO PERFEITA */
          #print-reduced {
            width: 100% !important;
            max-width: 80mm !important;
            margin: 0 auto !important;
            padding: 2mm !important;
            display: block !important;
            text-align: center !important;
            visibility: visible !important;
            background: white !important;
          }
          
          #print-reduced .max-w-xs {
            width: 100% !important;
            max-width: 76mm !important;
            margin: 0 auto !important;
            text-align: left !important;
          }
          
          /* Centralizar cabeçalho do cupom reduzido */
          #print-reduced .text-center {
            text-align: center !important;
            width: 100% !important;
          }
          
          /* Alinhamento das linhas do cupom reduzido */
          #print-reduced .flex.justify-between {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            width: 100% !important;
            text-align: left !important;
          }
          
          #print-reduced .flex.justify-between span:first-child {
            text-align: left !important;
            flex: 1 !important;
          }
          
          #print-reduced .flex.justify-between span:last-child {
            text-align: right !important;
            margin-left: auto !important;
          }
          
          /* Evitar quebras de página e forçar uma única página */
          #print-full, #print-reduced {
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            break-inside: avoid !important;
            height: auto !important;
            overflow: visible !important;
          }
          
          /* Garantir que não há quebras desnecessárias */
          #print-full *, #print-reduced * {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
        
        @media screen {
          .print-only {
            display: none;
          }
        }
      `}</style>
    </>
  );
}