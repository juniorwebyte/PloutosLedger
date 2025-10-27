import { useState, useEffect } from 'react';
import { BUSINESS_CONFIG } from '../config/system';
import FooterPages from './FooterPages';
import ClientRegistration from './ClientRegistration';
import {
  Calculator,
  PlayCircle,
  LogIn,
  Shield,
  TrendingUp,
  Users,
  Clock,
  Zap,
  BarChart3,
  FileText,
  Printer,
  CreditCard,
  ArrowRight,
  CheckCircle,
  DollarSign,
  Building,
  Menu,
  X,
  ChevronRight,
  Star,
  MessageCircle,
  Bell,
  Database,
  ShoppingCart,
  Target,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Server,
  Cloud,
  Shield as ShieldIcon,
  Lock,
  Unlock,
  Eye,
  Settings,
  PieChart,
  LineChart,
  AreaChart
} from 'lucide-react';
import PaymentModal from './PaymentModal';
import PaymentPage from './PaymentPage';
import plansService, { PlanRecord } from '../services/plansService';
import LiveChat from './LiveChat';
import CadernoDemo from './CadernoDemo';

interface LandingPageNewProps {
  onRequestLogin: () => void;
  onRequestDemo: () => void;
  onOpenAdmin?: () => void;
}

export default function LandingPageNew({ onRequestLogin, onRequestDemo, onOpenAdmin }: LandingPageNewProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanRecord | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFooterPage, setShowFooterPage] = useState(false);
  const [showClientRegistration, setShowClientRegistration] = useState(false);
  const [plans, setPlans] = useState<PlanRecord[]>(plansService.getPlans());
  const [showChat, setShowChat] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [showCadernoDemo, setShowCadernoDemo] = useState(false);

  useEffect(() => {
    const unsub = plansService.subscribe((updated) => setPlans(updated));
    return () => unsub();
  }, []);

  const handlePaymentComplete = (paymentData: any) => {
    setShowPaymentModal(false);
    onRequestLogin();
  };

  const handleClientRegistrationSuccess = (clientData: any) => {
    setShowClientRegistration(false);
    onRequestDemo();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{BUSINESS_CONFIG.COMPANY.BRAND}</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Gestão Financeira Profissional</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">Recursos</a>
              <a href="#pricing" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">Planos</a>
              <a href="#about" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">Sobre</a>
              <button
                onClick={onRequestLogin}
                className="text-gray-700 hover:text-emerald-600 transition-colors font-medium flex items-center space-x-1"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </button>
              <button
                onClick={() => setShowClientRegistration(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Começar Grátis
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-100 py-4">
              <div className="space-y-2">
                <a href="#features" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>Recursos</a>
                <a href="#pricing" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>Planos</a>
                <a href="#about" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>Sobre</a>
                <button onClick={() => { onRequestLogin(); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Entrar</button>
                <button onClick={() => { setShowClientRegistration(true); setIsMobileMenuOpen(false); }} className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">Começar Grátis</button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 mb-6">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 text-sm font-medium">Sistema PIX Real Integrado</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Controle Total do Seu <span className="text-emerald-600">Caixa</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Sistema completo de gestão financeira com PDV avançado, analytics em tempo real, 
                chat interno, notificações inteligentes e backup automático. 
                Transforme seu negócio com tecnologia de ponta.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => setShowClientRegistration(true)}
                  className="px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 font-medium"
                >
                  <PlayCircle className="w-5 h-5" />
                  <span>Testar Grátis por 30 Dias</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-emerald-600 hover:text-emerald-600 transition-all duration-300 flex items-center justify-center space-x-2 font-medium"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Ver Planos</span>
                </button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>Sem cartão de crédito</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>Cancelamento gratuito</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-3xl transform rotate-3"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Precisão</p>
                        <p className="text-lg font-bold text-gray-900">99.9%</p>
                      </div>
                    </div>
                    <div className="text-emerald-600 text-2xl">📈</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Economia de Tempo</p>
                        <p className="text-lg font-bold text-gray-900">80%</p>
                      </div>
                    </div>
                    <div className="text-blue-600 text-2xl">⚡</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Empresas Ativas</p>
                        <p className="text-lg font-bold text-gray-900">500+</p>
                      </div>
                    </div>
                    <div className="text-purple-600 text-2xl">🏢</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Features Highlight */}
      <section className="py-20 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Novos Recursos Revolucionários</h2>
            <p className="text-xl text-gray-600">Tecnologia de ponta para maximizar sua produtividade</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PieChart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Avançado</h3>
              <p className="text-gray-600">Dashboard executivo com métricas em tempo real e insights inteligentes</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chat em Tempo Real</h3>
              <p className="text-gray-600">Comunicação instantânea entre equipes e atendimento ao cliente</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notificações Inteligentes</h3>
              <p className="text-gray-600">Central de notificações com categorização e prioridades automáticas</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Backup Automático</h3>
              <p className="text-gray-600">Proteção total dos seus dados com backup inteligente e restauração rápida</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Sistema Completo de Gestão</h2>
            <p className="text-xl text-gray-600">Mais de 15 recursos profissionais para transformar seu negócio</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Calculator className="w-6 h-6" />,
                title: "Gestão de Entradas",
                description: "Controle total de dinheiro, cartões, PIX, boletos e cheques com interface otimizada."
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Controle de Saídas",
                description: "Registre descontos, retiradas, vales e comissões com validação automática."
              },
              {
                icon: <FileText className="w-6 h-6" />,
                title: "Notas Fiscais",
                description: "Caderno completo para controle de entrada e saída de notas fiscais."
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Comissões",
                description: "Sistema automático de cálculo de comissões para múltiplos vendedores."
              },
              {
                icon: <Printer className="w-6 h-6" />,
                title: "Relatórios Completos",
                description: "Cupons profissionais otimizados para impressoras térmicas."
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Segurança Total",
                description: "Backup automático e validações robustas para proteger seus dados."
              },
              {
                icon: <CreditCard className="w-6 h-6" />,
                title: "Gateway de Pagamento",
                description: "Aceite PIX, cartões e criptomoedas com sistema profissional."
              },
              {
                icon: <Building className="w-6 h-6" />,
                title: "PDV Completo",
                description: "Ponto de venda com leitor de código de barras e calculadora de troco."
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Performance",
                description: "Sistema rápido e responsivo para máxima produtividade."
              },
              {
                icon: <ShoppingCart className="w-6 h-6" />,
                title: "PDV Avançado",
                description: "Ponto de venda moderno com gestão de produtos e clientes integrada."
              },
              {
                icon: <PieChart className="w-6 h-6" />,
                title: "Analytics Dashboard",
                description: "Dashboard executivo com métricas avançadas e relatórios em tempo real."
              },
              {
                icon: <Bell className="w-6 h-6" />,
                title: "Sistema de Notificações",
                description: "Central de notificações inteligente com categorização e prioridades."
              },
              {
                icon: <MessageCircle className="w-6 h-6" />,
                title: "Chat Interno",
                description: "Sistema de comunicação em tempo real para equipes e clientes."
              },
              {
                icon: <Database className="w-6 h-6" />,
                title: "Backup Automático",
                description: "Sistema de backup inteligente com múltiplos tipos e restauração rápida."
              },
              {
                icon: <Activity className="w-6 h-6" />,
                title: "Monitoramento",
                description: "Monitoramento em tempo real de todas as operações do sistema."
              },
              {
                icon: <Target className="w-6 h-6" />,
                title: "Gestão de Metas",
                description: "Defina e acompanhe metas de vendas e performance da equipe."
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: "Multi-plataforma",
                description: "Acesse de qualquer dispositivo: desktop, tablet ou smartphone."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 text-emerald-600">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Demo Section */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Teste o Sistema Gratuitamente</h3>
              <p className="text-blue-100 mb-6">
                Experimente o Caderno de Notas com sistema de parcelas por 5 minutos, sem cadastro ou compromisso.
              </p>
              <button
                onClick={() => setShowCadernoDemo(true)}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2 mx-auto"
              >
                <PlayCircle className="h-5 w-5" />
                Iniciar Demo Gratuita
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Planos Transparentes</h2>
            <p className="text-xl text-gray-600">Escolha o plano ideal para o seu negócio</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.filter(plan => plan && plan.name && plan.priceCents).map((plan, index) => (
              <div 
                key={plan.id} 
                className={`relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 ${
                  plan.isRecommended 
                    ? 'border-2 border-indigo-500 ring-4 ring-indigo-100 transform scale-105' 
                    : 'border border-gray-200 hover:border-indigo-300'
                }`}
              >
                {plan.isRecommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                      <Star className="h-4 w-4 fill-current" />
                      Mais Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">R$ {(plan.priceCents / 100).toFixed(2)}</span>
                    <span className="text-gray-600 text-lg">/{plan.interval === 'monthly' ? 'mês' : 'ano'}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.featuresList && plan.featuresList.length > 0 ? (
                    plan.featuresList.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{plan.features || 'Recursos completos do sistema'}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => { 
                    if(plan && plan.name) {
                      setSelectedPlan(plan); 
                      setShowPaymentModal(true); 
                    }
                  }}
                  className={`w-full px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
                    plan.isRecommended
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  Assinar Agora
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Todos os planos incluem:</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                Segurança SSL
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-green-500" />
                Backup automático
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                Suporte 24/7
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-500" />
                Atualizações gratuitas
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para transformar sua gestão financeira?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de empresários que já otimizaram o controle do caixa
          </p>
          <button
            onClick={() => setShowClientRegistration(true)}
            className="px-8 py-4 bg-white text-emerald-600 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium inline-flex items-center space-x-2"
          >
            <span>Começar Agora - Grátis</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold">{BUSINESS_CONFIG.COMPANY.BRAND}</span>
              </div>
              <p className="text-gray-400 text-sm">
                Sistema profissional de gestão financeira para pequenas e médias empresas.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => setShowFooterPage(true)} className="text-gray-400 hover:text-white transition-colors">Recursos</button></li>
                <li><button onClick={() => setShowFooterPage(true)} className="text-gray-400 hover:text-white transition-colors">Preços</button></li>
                <li><button onClick={() => setShowFooterPage(true)} className="text-gray-400 hover:text-white transition-colors">Segurança</button></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => setShowFooterPage(true)} className="text-gray-400 hover:text-white transition-colors">Sobre</button></li>
                <li><button onClick={() => setShowFooterPage(true)} className="text-gray-400 hover:text-white transition-colors">Contato</button></li>
                <li><button onClick={() => setShowFooterPage(true)} className="text-gray-400 hover:text-white transition-colors">Blog</button></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => setShowFooterPage(true)} className="text-gray-400 hover:text-white transition-colors">Central de Ajuda</button></li>
                <li><button onClick={() => setShowFooterPage(true)} className="text-gray-400 hover:text-white transition-colors">Documentação</button></li>
                <li><button onClick={() => setShowFooterPage(true)} className="text-gray-400 hover:text-white transition-colors">Status</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 {BUSINESS_CONFIG.COMPANY.NAME}. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentComplete={handlePaymentComplete}
        selectedPlan={selectedPlan && selectedPlan.name ? { name: selectedPlan.name, priceCents: selectedPlan.priceCents, interval: selectedPlan.interval } : null}
      />

      {showFooterPage && <FooterPages onBackToLanding={() => setShowFooterPage(false)} />}
      {showClientRegistration && (
        <ClientRegistration
          onClose={() => setShowClientRegistration(false)}
          onSuccess={handleClientRegistrationSuccess}
        />
      )}

      {/* Live Chat */}
      <LiveChat 
        isOpen={showChat}
        onToggle={() => setShowChat(!showChat)}
        isMinimized={isChatMinimized}
        onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
      />

      {/* Chat Button */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-40"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Caderno Demo */}
      {showCadernoDemo && (
        <CadernoDemo onClose={() => setShowCadernoDemo(false)} />
      )}

    </div>
  );
}
