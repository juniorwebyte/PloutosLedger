import React, { useState, useEffect } from 'react';
import { 
  Building, 
  LogOut, 
  Settings, 
  BarChart3, 
  Package, 
  CreditCard, 
  Users, 
  Bell,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  FileText,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CashFlow from './CashFlow';
import OwnerPanel from './OwnerPanel';
import { CompanyConfig } from '../types';

interface ClientDashboardProps {
  onBackToLogin: () => void;
}

function ClientDashboard({ onBackToLogin }: ClientDashboardProps) {
  const { logout, user, role } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false);

  useEffect(()=>{
    const subs = JSON.parse(localStorage.getItem('demo_subscriptions')||'[]');
    const last = subs[subs.length-1] || null;
    setHasActiveSubscription(!!last);
  }, []);

  // Dados simulados para o dashboard
  const dashboardData = {
    totalVendas: 15420.50,
    vendasHoje: 1250.00,
    clientesAtivos: 45,
    produtosEstoque: 128,
    crescimentoVendas: 12.5,
    ticketMedio: 85.30
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'blue' },
    { id: 'caixa', label: 'Movimento de Caixa', icon: DollarSign, color: 'green' },
    { id: 'vendas', label: 'Vendas', icon: ShoppingCart, color: 'purple', premium: true },
    { id: 'estoque', label: 'Estoque', icon: Package, color: 'orange', premium: true },
    { id: 'clientes', label: 'Clientes', icon: Users, color: 'pink' },
    { id: 'relatorios', label: 'Relatórios', icon: FileText, color: 'indigo', premium: true },
    { id: 'meuplano', label: 'Meu Plano', icon: CreditCard, color: 'green' },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, color: 'gray' }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
      pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
      indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
      gray: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const handleLogout = () => {
    logout();
    onBackToLogin();
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Vendas Hoje</p>
              <p className="text-2xl font-bold">R$ {dashboardData.vendasHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Vendas</p>
              <p className="text-2xl font-bold">R$ {dashboardData.totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Clientes Ativos</p>
              <p className="text-2xl font-bold">{dashboardData.clientesAtivos}</p>
            </div>
            <Users className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Produtos em Estoque</p>
              <p className="text-2xl font-bold">{dashboardData.produtosEstoque}</p>
            </div>
            <Package className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Gráficos e Relatórios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Crescimento de Vendas</h3>
          <div className="flex items-center justify-center h-32 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">+{dashboardData.crescimentoVendas}%</p>
              <p className="text-gray-600">Este mês</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ticket Médio</h3>
          <div className="flex items-center justify-center h-32 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">R$ {dashboardData.ticketMedio}</p>
              <p className="text-gray-600">Por venda</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => setActiveTab('caixa')}
            className="flex flex-col items-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
          >
            <DollarSign className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Abrir Caixa</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('vendas')}
            className="flex flex-col items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            <ShoppingCart className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Nova Venda</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('estoque')}
            className="flex flex-col items-center p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105"
          >
            <Package className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Gerenciar Estoque</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('relatorios')}
            className="flex flex-col items-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            <FileText className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Relatórios</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderMeuPlano = () => {
    const subs = JSON.parse(localStorage.getItem('demo_subscriptions')||'[]');
    const last = subs[subs.length-1] || null;
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Minha Assinatura</h2>
        {last ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border">
              <div className="text-gray-600 text-sm">Plano</div>
              <div className="text-xl font-semibold text-gray-900">{last.plan?.name || 'Demo'}</div>
              <div className="text-sm text-gray-500">Periodicidade: {last.plan?.interval==='yearly'?'Anual':'Mensal'}</div>
            </div>
            <div className="p-4 rounded-xl border">
              <div className="text-gray-600 text-sm">Status</div>
              <div className="text-xl font-semibold text-green-700">Ativo</div>
              <div className="text-sm text-gray-500">TXID: {last.txid}</div>
            </div>
            <div className="p-4 rounded-xl border">
              <div className="text-gray-600 text-sm">Valor</div>
              <div className="text-xl font-semibold text-blue-700">R$ {((last.plan?.priceCents||2999)/100).toLocaleString('pt-BR',{minimumFractionDigits:2})}</div>
              {last.discountPct? <div className="text-xs text-emerald-700">Desconto: {last.discountPct}%</div>: null}
            </div>
            <div className="p-4 rounded-xl border">
              <div className="text-gray-600 text-sm">Início</div>
              <div className="text-xl font-semibold text-gray-900">{new Date(last.createdAt).toLocaleDateString('pt-BR')}</div>
              <div className="text-sm text-gray-500">Renovação automática (demo)</div>
            </div>
          </div>
        ) : (
          <div className="text-gray-600">Nenhuma assinatura encontrada. Contrate um plano pela landing page.</div>
        )}
        <div className="mt-6 flex gap-3">
          <button onClick={()=>setActiveTab('caixa')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Ir para o Caixa</button>
          <button onClick={()=>alert('Fatura gerada (demo)')} className="px-4 py-2 border rounded-lg">Gerar Fatura</button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'caixa':
        return <CashFlow isDemo={false} onBackToLanding={() => setActiveTab('dashboard')} />;
      case 'meuplano':
        return renderMeuPlano();
      case 'vendas':
        return (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestão de Vendas</h2>
            <p className="text-gray-600">Módulo de vendas em desenvolvimento...</p>
          </div>
        );
      case 'estoque':
        return (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestão de Estoque</h2>
            <p className="text-gray-600">Módulo de estoque em desenvolvimento...</p>
          </div>
        );
      case 'clientes':
        return (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestão de Clientes</h2>
            <p className="text-gray-600">Módulo de clientes em desenvolvimento...</p>
          </div>
        );
      case 'relatorios':
        return (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Relatórios</h2>
            <p className="text-gray-600">Módulo de relatórios em desenvolvimento...</p>
          </div>
        );
      case 'configuracoes':
        return (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Configurações da Loja</h2>
            <p className="text-gray-600">Módulo de configurações em desenvolvimento...</p>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">PloutosLedger</h1>
                <p className="text-sm text-gray-600">Dashboard da Loja</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Bem-vindo,</p>
                <p className="font-semibold text-gray-800">{user}</p>
              </div>
              
              <button
                onClick={() => setShowOwnerPanel(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
              >
                <Settings className="w-4 h-4" />
                <span>Configurações</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {!hasActiveSubscription && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-sm px-6 py-3 flex items-center justify-between">
          <div>
            Sua conta está em modo de teste. Para continuar usando sem limitações, contrate um plano.
          </div>
          <button onClick={()=>{ window.location.href = '/#plans'; }} className="px-3 py-1.5 bg-amber-600 text-white rounded-lg">Assinar agora</button>
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isDisabled = (item as any).premium && !hasActiveSubscription;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => { if (!isDisabled) setActiveTab(item.id); }}
                      disabled={isDisabled}
                      title={isDisabled? 'Requer assinatura ativa':''}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                        isActive
                          ? `bg-gradient-to-r ${getColorClasses(item.color)} text-white shadow-lg`
                          : isDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>

      {/* Painel do Proprietário */}
      <OwnerPanel
        isOpen={showOwnerPanel}
        onClose={() => setShowOwnerPanel(false)}
        onConfigUpdate={(config) => setCompanyConfig(config)}
      />
    </div>
  );
}

export default ClientDashboard;
