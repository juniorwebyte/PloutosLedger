import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle, 
  ArrowLeft, 
  Shield, 
  Lock,
  Clock,
  Star,
  Zap,
  Crown
} from 'lucide-react';
import { PlanRecord } from '../services/plansService';
import { useAuth } from '../contexts/AuthContext';

interface PaymentPageProps {
  selectedPlan: PlanRecord;
  onBack: () => void;
  onSuccess: (plan: PlanRecord) => void;
}

export default function PaymentPage({ selectedPlan, onBack, onSuccess }: PaymentPageProps) {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'pix' | 'boleto'>('credit');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    email: user || '',
    phone: '',
    cpf: ''
  });

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simular processamento de pagamento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simular sucesso do pagamento
    const success = Math.random() > 0.1; // 90% de chance de sucesso
    
    if (success) {
      // Ativar licença do usuário
      const licenseData = {
        userId: user || 'user_' + Date.now(),
        username: user || 'Usuário',
        email: paymentData.email,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        status: 'active',
        features: selectedPlan.featuresList || [selectedPlan.features]
      };
      
      // Salvar licença no localStorage
      const existingLicenses = JSON.parse(localStorage.getItem('ploutos_licenses') || '[]');
      const newLicense = {
        ...licenseData,
        id: 'lic_' + Date.now(),
        key: 'PLOUTOS-' + Date.now(),
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastUsed: new Date().toISOString(),
        usageCount: 0,
        maxUsage: selectedPlan.maxUsers === -1 ? -1 : selectedPlan.maxUsers * 10,
        metadata: { source: 'payment', plan: selectedPlan.name }
      };
      
      existingLicenses.push(newLicense);
      localStorage.setItem('ploutos_licenses', JSON.stringify(existingLicenses));
      
      // Gerar nota fiscal automática
      const notaFiscal = generateNotaFiscal(selectedPlan, paymentData);
      saveNotaFiscal(notaFiscal);
      
      onSuccess(selectedPlan);
    } else {
      alert('Erro no processamento do pagamento. Tente novamente.');
    }
    
    setIsProcessing(false);
  };

  // Gerar nota fiscal automática
  const generateNotaFiscal = (plan: PlanRecord, paymentData: any) => {
    const today = new Date();
    const notaNumber = `NF${Date.now().toString().slice(-6)}`;
    
    return {
      id: `nota_${Date.now()}`,
      dataEntrada: today.toISOString().split('T')[0],
      fabricacao: today.toISOString().split('T')[0],
      numeroNfe: notaNumber,
      total: plan.priceCents / 100,
      totalParcelas: 1,
      valorParcela: plan.priceCents / 100,
      parcelas: [{
        id: `parcela_${Date.now()}`,
        numeroParcela: 1,
        valor: plan.priceCents / 100,
        dataVencimento: today.toISOString().split('T')[0],
        status: 'paga' as const,
        dataPagamento: today.toISOString().split('T')[0],
        observacoes: `Pagamento do plano ${plan.name} - ${paymentData.email}`
      }],
      status: 'quitada' as const,
      observacoes: `Nota fiscal gerada automaticamente para assinatura do plano ${plan.name}. Cliente: ${paymentData.email}`,
      dataCriacao: today.toISOString(),
      dataAtualizacao: today.toISOString()
    };
  };

  // Salvar nota fiscal
  const saveNotaFiscal = (notaFiscal: any) => {
    const existingNotas = JSON.parse(localStorage.getItem('ploutos_notas_fiscais') || '[]');
    existingNotas.push(notaFiscal);
    localStorage.setItem('ploutos_notas_fiscais', JSON.stringify(existingNotas));
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'basic': return <Zap className="h-6 w-6" />;
      case 'starter': return <Star className="h-6 w-6" />;
      case 'pro': return <Crown className="h-6 w-6" />;
      default: return <CreditCard className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar para planos
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finalizar Assinatura</h1>
          <p className="text-gray-600">Complete seu pagamento para acessar todas as funcionalidades</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resumo do Plano */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumo da Assinatura</h2>
            
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-6">
              <div className="flex items-center gap-3 mb-4">
                {getPlanIcon(selectedPlan.name)}
                <h3 className="text-xl font-bold">{selectedPlan.name}</h3>
                {selectedPlan.isRecommended && (
                  <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                    RECOMENDADO
                  </span>
                )}
              </div>
              
              <div className="text-3xl font-bold mb-2">
                {formatCurrency(selectedPlan.priceCents)}
                <span className="text-lg font-normal text-blue-100">
                  /{selectedPlan.interval === 'monthly' ? 'mês' : 'ano'}
                </span>
              </div>
              
              <p className="text-blue-100 text-sm">{selectedPlan.description}</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Incluído no plano:</h4>
              <ul className="space-y-2">
                {selectedPlan.featuresList && selectedPlan.featuresList.length > 0 ? (
                  selectedPlan.featuresList.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{selectedPlan.features}</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <Shield className="h-5 w-5" />
                <span className="font-medium">Garantia de 30 dias</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Cancele a qualquer momento nos primeiros 30 dias e receba seu dinheiro de volta.
              </p>
            </div>
          </div>

          {/* Formulário de Pagamento */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Informações de Pagamento</h2>

            {/* Métodos de Pagamento */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Método de Pagamento</h3>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setPaymentMethod('credit')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'credit'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <span className="text-sm font-medium">Cartão</span>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'pix'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="h-6 w-6 mx-auto mb-2 bg-green-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">PIX</span>
                  </div>
                  <span className="text-sm font-medium">PIX</span>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('boleto')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'boleto'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="h-6 w-6 mx-auto mb-2 bg-orange-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">B</span>
                  </div>
                  <span className="text-sm font-medium">Boleto</span>
                </button>
              </div>
            </div>

            {/* Formulário de Dados */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={paymentData.email}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {paymentMethod === 'credit' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número do Cartão
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Validade
                      </label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        value={paymentData.expiryDate}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, expiryDate: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        value={paymentData.cvv}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome no Cartão
                    </label>
                    <input
                      type="text"
                      placeholder="João Silva"
                      value={paymentData.cardName}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, cardName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={paymentData.phone}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={paymentData.cpf}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, cpf: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Botão de Pagamento */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Clock className="h-5 w-5 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  Pagar {formatCurrency(selectedPlan.priceCents)}
                </>
              )}
            </button>

            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                <Shield className="h-4 w-4" />
                <span>Pagamento 100% seguro e criptografado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}