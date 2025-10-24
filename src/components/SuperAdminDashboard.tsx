import { useState, useEffect } from 'react';
import { 
  Shield, 
  LogOut, 
  Users, 
  Building, 
  CreditCard, 
  Settings, 
  BarChart3,
  Bell,
  TrendingUp,
  DollarSign,
  UserPlus,
  ClipboardList,
  Key,
  Trash2,
  Edit,
  Search,
  Monitor,
  Clock,
  CheckCircle,
  MessageCircle,
  Database,
  Star,
  Plus,
  Eye,
  EyeOff,
  Crown,
  Zap,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import plansService, { PlanRecord } from '../services/plansService';
import AdminPanel from './AdminPanel';
import backendService from '../services/backendService';
import CashFlow from './CashFlow';
import EcommerceConfig from './EcommerceConfig';
import ApiDocumentation from './ApiDocumentation';
import PaymentGenerator from './PaymentGenerator';
import CompleteReport from './CompleteReport';
import WebhookConfig from './WebhookConfig';
import CustomerManager from './CustomerManager';
import PDVSystemNew from './PDVSystemNew';
import AnalyticsDashboard from './AnalyticsDashboard';
import NotificationSystem from './NotificationSystem';
import ChatSystem from './ChatSystem';
import BackupSystem from './BackupSystem';
import ChatManagement from './ChatManagement';
import AuditLogsModal from './AuditLogsModal';
import SecurityPerformanceModal from './SecurityPerformanceModal';
import licenseService from '../services/licenseService';
import { securityService, performanceService } from '../services/securityService';
import paymentGatewayService from '../services/paymentGatewayService';

interface SuperAdminDashboardProps {
  onBackToLogin: () => void;
}

interface User {
  id: string;
  username: string;
  role: string;
  status: string;
  createdAt: string;
  lastLogin?: string;
  licenseKey?: string;
  tenantId?: string;
}

interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: string;
  createdAt: string;
  userCount: number;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string;
  status: string;
  createdAt: string;
  isRecommended?: boolean;
  description?: string;
  maxUsers?: number;
  featuresList?: string[];
}

interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

function SuperAdminDashboard({ onBackToLogin }: SuperAdminDashboardProps) {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([
    { id: 't1', name: 'Empresa Demo', domain: 'demo.local', status: 'active', createdAt: '2025-10-14', userCount: 1 },
    { id: 't2', name: 'Webyte', domain: 'webyte.com', status: 'active', createdAt: '2025-10-14', userCount: 2 },
  ]);
  const [plans, setPlans] = useState<Plan[]>(plansService.getPlans().map(p=>({ 
    id: p.id, 
    name: p.name, 
    price: p.priceCents, 
    features: p.features||'', 
    status: 'active', 
    createdAt: p.createdAt||'', 
    isRecommended: p.isRecommended,
    description: p.description,
    maxUsers: p.maxUsers,
    featuresList: p.featuresList
  })));
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    { id: 's1', tenantId: 't1', planId: 'p1', status: 'active', startDate: '2025-10-14', endDate: '', createdAt: '2025-10-14' },
  ]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEcommerceConfig, setShowEcommerceConfig] = useState(false);
  const [showApiDocumentation, setShowApiDocumentation] = useState(false);
  const [showPaymentGenerator, setShowPaymentGenerator] = useState(false);
  const [showCompleteReport, setShowCompleteReport] = useState(false);
  const [showWebhookConfig, setShowWebhookConfig] = useState(false);
  const [showCustomerManager, setShowCustomerManager] = useState(false);
  const [showPDVSystem, setShowPDVSystem] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [showChatManagement, setShowChatManagement] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [showSecurityPerformance, setShowSecurityPerformance] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    priceCents: 0,
    description: '',
    maxUsers: 1,
    featuresList: [''],
    interval: 'monthly' as 'monthly' | 'yearly',
    isRecommended: false
  });
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [charges, setCharges] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [cmsConfig, setCmsConfig] = useState<any>({});
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Dados simulados para o overview
  const systemStats = {
    totalUsers: 1247,
    activeUsers: 1156,
    totalTenants: 89,
    activeTenants: 82,
    totalRevenue: 45680.50,
    monthlyRevenue: 12850.00,
    systemUptime: 99.9,
    activeLicenses: 89,
    expiredLicenses: 12
  };

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3, color: 'blue' },
    { id: 'users', label: 'Usuários', icon: Users, color: 'green' },
    { id: 'leads', label: 'Leads', icon: ClipboardList, color: 'indigo' },
    { id: 'cashflow', label: 'PloutosLedger - Sistema de Gestão Financeira', icon: TrendingUp, color: 'emerald' },
    { id: 'tenants', label: 'Organizações', icon: Building, color: 'purple' },
    { id: 'plans', label: 'Planos', icon: CreditCard, color: 'orange' },
    { id: 'subscriptions', label: 'Assinaturas', icon: DollarSign, color: 'pink' },
    { id: 'licenses', label: 'Licenças', icon: Key, color: 'indigo' },
    { id: 'monitoring', label: 'Monitoramento', icon: Monitor, color: 'red' },
    { id: 'settings', label: 'Configurações', icon: Settings, color: 'gray' },
    { id: 'comms', label: 'Comunicações', icon: Bell, color: 'blue' },
    { id: 'payment-gateway', label: 'Gateway de Pagamento', icon: CreditCard, color: 'green' },
    { id: 'financial-tools', label: 'Ferramentas Financeiras', icon: BarChart3, color: 'indigo' },
    { id: 'pdv-system', label: 'Sistema PDV', icon: DollarSign, color: 'green' },
    { id: 'cms', label: 'CMS & Personalização', icon: Settings, color: 'purple' },
    { id: 'notifications', label: 'Notificações', icon: Bell, color: 'orange' },
    { id: 'chat', label: 'Chat', icon: MessageCircle, color: 'blue' },
    { id: 'chat-management', label: 'Gerenciar Chat', icon: MessageCircle, color: 'indigo' },
    { id: 'audit-logs', label: 'Logs de Auditoria', icon: FileText, color: 'purple' },
    { id: 'security-performance', label: 'Segurança & Performance', icon: Shield, color: 'red' },
    { id: 'backup', label: 'Backup', icon: Database, color: 'green' },
    { id: 'admin', label: 'Painel Admin', icon: Settings, color: 'purple' }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
      pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
      indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
      red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      gray: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
      emerald: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  useEffect(()=>{
    const loadUsers = async ()=>{
      if (activeTab !== 'users') return;
      setLoading(true);
      setLoadError(null);
      try {
        const online = await backendService.isOnline();
        if (!online) {
          setUsers([
            { id: '1', username: 'Admin', role: 'user', status: 'active', createdAt: new Date().toISOString() },
            { id: '2', username: 'Demo', role: 'user', status: 'active', createdAt: new Date().toISOString() },
            { id: '3', username: 'SuperAdmin', role: 'superadmin', status: 'active', createdAt: new Date().toISOString() },
          ]);
          return;
        }
        const base = backendService.getBaseUrl();
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${base}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        const mapped = (data||[]).map((u:any)=>({ id: u.id, username: u.username, role: u.role, status: u.license?.status || 'active', createdAt: u.createdAt || new Date().toISOString() }));
        setUsers(mapped);
      } catch (e:any) {
        setLoadError(e?.message || 'Falha ao carregar usuários');
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [activeTab]);

  // Carregar configuração CMS
  useEffect(() => {
    const loadCmsConfig = async () => {
      try {
        const base = backendService.getBaseUrl();
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${base}/api/cms/config`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (res.ok) {
          const config = await res.json();
          setCmsConfig(config);
        }
      } catch (e) {
        console.error('Erro ao carregar configuração CMS:', e);
      }
    };
    loadCmsConfig();
  }, []);

  const saveCmsConfig = async (config: any) => {
    try {
      const base = backendService.getBaseUrl();
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${base}/api/cms/config`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        const updatedConfig = await res.json();
        setCmsConfig(updatedConfig);
        alert('Configurações salvas com sucesso!');
      } else {
        throw new Error('Falha ao salvar configurações');
      }
    } catch (e: any) {
      alert(`Erro ao salvar configurações: ${e.message}`);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (userData: any) => {
    if (!editingUser) return;
    
    try {
      setLoading(true);
      const base = backendService.getBaseUrl();
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${base}/api/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...updatedUser } : u));
        setShowEditUserModal(false);
        setEditingUser(null);
        alert('Usuário atualizado com sucesso!');
      } else {
        const error = await res.text();
        throw new Error(error || 'Falha ao atualizar usuário');
      }
    } catch (error: any) {
      alert(`Erro ao atualizar usuário: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
      setLoading(true);
      const base = backendService.getBaseUrl();
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${base}/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        alert('Usuário excluído com sucesso!');
      } else {
        const error = await res.text();
        throw new Error(error || 'Falha ao excluir usuário');
      }
    } catch (error: any) {
      alert(`Erro ao excluir usuário: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Carregar leads quando aba ativa for "leads"
  useEffect(()=>{
    const loadLeads = async ()=>{
      if (activeTab !== 'leads') return;
      setLoading(true);
      setLoadError(null);
      try {
        const online = await backendService.isOnline();
        if (!online) { 
          setLeads(JSON.parse(localStorage.getItem('pending_leads')||'[]'));
          return; 
        }
        const base = backendService.getBaseUrl();
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${base}/api/leads`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setLeads(data||[]);
      } catch(e:any){
        setLoadError(e?.message || 'Falha ao carregar leads');
      } finally { setLoading(false); }
    };
    loadLeads();
  }, [activeTab]);

  // Métricas de conversão para Monitoramento
  const [leadCount, setLeadCount] = useState<number>(0);
  const [approved24h, setApproved24h] = useState<number>(0);
  const [activeUsersCount, setActiveUsersCount] = useState<number>(0);
  useEffect(()=>{
    const loadMetrics = async ()=>{
      if (activeTab !== 'monitoring') return;
      try {
        const online = await backendService.isOnline();
        if (!online) { setLeadCount(0); setApproved24h(0); setActiveUsersCount(users.length||0); return; }
        const base = backendService.getBaseUrl();
        const token = localStorage.getItem('auth_token');
        const [leadsRes, usersRes] = await Promise.all([
          fetch(`${base}/api/leads`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${base}/api/users`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const leadsData = await leadsRes.json();
        const usersData = await usersRes.json();
        setLeadCount((leadsData||[]).length);
        setActiveUsersCount((usersData||[]).length);
        // Aprovados (24h) — heurística: usuários criados nas últimas 24h
        const since = Date.now() - 24*60*60*1000;
        const approved = (usersData||[]).filter((u:any)=> new Date(u.createdAt||Date.now()).getTime() >= since).length;
        setApproved24h(approved);
      } catch {}
    };
    loadMetrics();
  }, [activeTab]);

  // Carregar dados do gateway de pagamento
  useEffect(() => {
    const loadPaymentGatewayData = async () => {
      if (activeTab !== 'payment-gateway') return;
      
      try {
        setLoading(true);
        const [methods, chargesData, stats, balanceData] = await Promise.all([
          paymentGatewayService.getPaymentMethods(),
          paymentGatewayService.getCharges({ limit: 10 }),
          paymentGatewayService.getAdvancedStatistics('today'),
          paymentGatewayService.getBalance()
        ]);
        
        setPaymentMethods(methods);
        setCharges(chargesData.data || []);
        setStatistics(stats);
        setBalance(balanceData);
      } catch (error) {
        console.error('Erro ao carregar dados do gateway:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPaymentGatewayData();
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    onBackToLogin();
  };

  const handleCreateUser = async (userData: { username: string; password: string; role: string; email?: string }) => {
    try {
      setLoading(true);
      const online = await backendService.isOnline();
      
      if (online) {
        const base = backendService.getBaseUrl();
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${base}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
          throw new Error('Falha ao criar usuário');
        }
        
        const newUser = await response.json();
        setUsers(prev => [...prev, { ...newUser, status: 'active', createdAt: new Date().toISOString() }]);
      } else {
        // Modo offline - adicionar localmente
        const newUser = {
          id: `local_${Date.now()}`,
          username: userData.username,
          role: userData.role,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        setUsers(prev => [...prev, newUser]);
      }
      
      setShowCreateUserModal(false);
    } catch (error: any) {
      setLoadError(error.message || 'Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="p-8">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total de Usuários</p>
              <p className="text-4xl font-bold mt-2">{systemStats.totalUsers.toLocaleString()}</p>
              <p className="text-blue-200 text-sm mt-1">{systemStats.activeUsers} ativos</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-300 mr-2" />
            <span className="text-sm text-green-300">+12% este mês</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Organizações</p>
              <p className="text-3xl font-bold">{systemStats.totalTenants}</p>
              <p className="text-green-200 text-sm">{systemStats.activeTenants} ativas</p>
            </div>
            <Building className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Receita Total</p>
              <p className="text-3xl font-bold">R$ {systemStats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-purple-200 text-sm">R$ {systemStats.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} este mês</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Uptime do Sistema</p>
              <p className="text-3xl font-bold">{systemStats.systemUptime}%</p>
              <p className="text-orange-200 text-sm">Disponibilidade</p>
            </div>
            <Monitor className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Gráficos e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Crescimento de Usuários</h3>
          <div className="flex items-center justify-center h-32 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">+24%</p>
              <p className="text-gray-600">Este mês</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Status das Licenças</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-green-600 font-medium">Licenças Ativas</span>
              <span className="text-2xl font-bold text-green-600">{systemStats.activeLicenses}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-red-600 font-medium">Licenças Expiradas</span>
              <span className="text-2xl font-bold text-red-600">{systemStats.expiredLicenses}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => setActiveTab('users')}
            className="flex flex-col items-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
          >
            <UserPlus className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Novo Usuário</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('tenants')}
            className="flex flex-col items-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            <Building className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Nova Organização</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('licenses')}
            className="flex flex-col items-center p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
          >
            <Key className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Gerenciar Licenças</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('monitoring')}
            className="flex flex-col items-center p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
          >
            <Monitor className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Monitoramento</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Gerenciar Usuários</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300" onClick={()=>setShowCreateUserModal(true)}>
              <UserPlus className="w-4 h-4" />
              <span>Novo Usuário</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {loading && <div className="text-sm text-gray-500 mb-2">Carregando...</div>}
        {loadError && <div className="text-sm text-red-600 mb-2">{loadError}</div>}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Usuário</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Criado em</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u=>u.username.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{(u.username||'')[0]?.toUpperCase()}</span>
                    </div>
                    <div>
                        <p className="font-medium text-gray-800">{u.username}</p>
                        <p className="text-sm text-gray-600">{u.username}@exemplo.com</p>
                    </div>
                  </div>
                </td>
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{u.role}</span></td>
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{u.status||'Ativo'}</span></td>
                  <td className="py-3 px-4 text-gray-600">{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
                <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEditUser(u)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Editar usuário"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Excluir usuário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderLeads = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Leads (Cadastro de Demo)</h2>
        <button onClick={()=>setActiveTab('leads')} className="px-3 py-2 bg-gray-100 rounded">Recarregar</button>
      </div>
      {loading && <div className="text-sm text-gray-500 mb-2">Carregando...</div>}
      {loadError && <div className="text-sm text-red-600 mb-2">{loadError}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3">Nome</th>
              <th className="text-left py-2 px-3">Email</th>
              <th className="text-left py-2 px-3">Telefone</th>
              <th className="text-left py-2 px-3">Empresa</th>
              <th className="text-left py-2 px-3">Usuário sugerido</th>
              <th className="text-left py-2 px-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {leads.length===0 && (
              <tr><td className="py-6 px-3 text-gray-500" colSpan={6}>Nenhum lead pendente.</td></tr>
            )}
            {leads.map((l:any)=> (
              <tr key={l.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">{l.name}</td>
                <td className="py-2 px-3">{l.email}</td>
                <td className="py-2 px-3">{l.phone}</td>
                <td className="py-2 px-3">{l.company}</td>
                <td className="py-2 px-3">{l.username}</td>
                <td className="py-2 px-3">
                  <button onClick={async()=>{
                    try {
                      const base = backendService.getBaseUrl();
                      const token = localStorage.getItem('auth_token');
                      const res = await fetch(`${base}/api/leads/${encodeURIComponent(l.id)}/approve`, { method:'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } });
                      if (!res.ok) {
                        const txt = await res.text();
                        throw new Error(txt || `HTTP ${res.status}`);
                      }
                      setLeads(prev=> prev.filter(x=>x.id!==l.id));
                      // atualizar usuários após aprovação
                      try {
                        const usersRes = await fetch(`${base}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
                        if (usersRes.ok) {
                          const data = await usersRes.json();
                          const mapped = (data||[]).map((u:any)=>({ id: u.id, username: u.username, role: u.role, status: u.license?.status || 'active', createdAt: u.createdAt || new Date().toISOString() }));
                          setUsers(mapped);
                        }
                      } catch {}
                      alert('Usuário criado e lead aprovado.');
                    } catch (e:any) {
                      const msg = e?.message || 'Falha ao aprovar lead';
                      alert(`Falha ao aprovar lead: ${msg}`);
                    }
                  }} className="px-3 py-1 bg-green-600 text-white rounded">Aprovar e Criar Usuário</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTenants = () => (
    <div className="space-y-6">
      {/* Header */}
    <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building className="h-8 w-8 text-indigo-600" />
              Gerenciamento de Organizações
            </h2>
            <p className="text-gray-600 mt-2">Monitore e gerencie todas as organizações da plataforma</p>
          </div>
          <button 
            onClick={() => {
          const name = prompt('Nome da organização');
          if (!name) return;
          const id = `t${Date.now()}`;
              setTenants(prev=>[{ 
                id, 
                name, 
                domain: `${name.toLowerCase().replace(/\s+/g, '')}.local`, 
                status: 'active', 
                createdAt: new Date().toISOString().slice(0,10), 
                userCount: 0 
              }, ...prev]);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nova Organização
          </button>
      </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total de Organizações</p>
                <p className="text-2xl font-bold">{tenants.length}</p>
              </div>
              <Building className="h-8 w-8 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Organizações Ativas</p>
                <p className="text-2xl font-bold">{tenants.filter(t => t.status === 'active').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total de Usuários</p>
                <p className="text-lg font-bold">{tenants.reduce((sum, t) => sum + t.userCount, 0)}</p>
              </div>
              <Users className="h-8 w-8 text-purple-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Média de Usuários</p>
                <p className="text-lg font-bold">
                  {tenants.length > 0 ? (tenants.reduce((sum, t) => sum + t.userCount, 0) / tenants.length).toFixed(1) : '0'}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Organizações */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Organizações Registradas</h3>
        </div>
        
      <div className="overflow-x-auto">
        <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organização
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Domínio
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuários
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data de Criação
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
            </tr>
          </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenants.map(tenant => (
                <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Building className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-sm text-gray-500">ID: {tenant.id}</div>
                      </div>
                    </div>
                </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{tenant.domain}</div>
                    <div className="text-sm text-gray-500">Domínio personalizado</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{tenant.userCount}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      tenant.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : tenant.status === 'suspended'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const name = prompt('Novo nome', tenant.name) || tenant.name;
                          const domain = prompt('Novo domínio', tenant.domain) || tenant.domain;
                          setTenants(prev => prev.map(t => 
                            t.id === tenant.id 
                              ? { ...t, name, domain }
                              : t
                          ));
                        }}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          const newStatus = tenant.status === 'active' ? 'suspended' : 'active';
                          setTenants(prev => prev.map(t => 
                            t.id === tenant.id 
                              ? { ...t, status: newStatus }
                              : t
                          ));
                        }}
                        className={`font-medium ${
                          tenant.status === 'active' 
                            ? 'text-red-600 hover:text-red-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {tenant.status === 'active' ? 'Suspender' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => {
                          if (!confirm('Tem certeza que deseja excluir esta organização?')) return;
                          setTenants(prev => prev.filter(t => t.id !== tenant.id));
                        }}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Excluir
                      </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {tenants.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma organização encontrada</h3>
            <p className="text-gray-500">Comece criando uma nova organização.</p>
          </div>
        )}
                    </div>
                    </div>
  );

  const openPlanModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        name: plan.name,
        priceCents: plan.price,
        description: plan.description || '',
        maxUsers: plan.maxUsers || 1,
        featuresList: plan.featuresList || [''],
        interval: 'monthly',
        isRecommended: plan.isRecommended || false
      });
    } else {
      setEditingPlan(null);
      setPlanForm({
        name: '',
        priceCents: 0,
        description: '',
        maxUsers: 1,
        featuresList: [''],
        interval: 'monthly',
        isRecommended: false
      });
    }
    setShowPlanModal(true);
  };

  const savePlan = () => {
    if (!planForm.name || planForm.priceCents <= 0) {
      alert('Nome e preço são obrigatórios');
      return;
    }

    const planId = editingPlan?.id || `p${Date.now()}`;
    const newPlan: Plan = {
      id: planId,
      name: planForm.name,
      price: planForm.priceCents,
      features: planForm.featuresList.filter(f => f.trim()).join(', '),
      status: 'active',
      createdAt: editingPlan?.createdAt || new Date().toISOString().slice(0,10),
      isRecommended: planForm.isRecommended,
      description: planForm.description,
      maxUsers: planForm.maxUsers,
      featuresList: planForm.featuresList.filter(f => f.trim())
    };

    if (editingPlan) {
      setPlans(prev => prev.map(p => p.id === planId ? newPlan : p));
    } else {
      setPlans(prev => [newPlan, ...prev]);
    }

    // Salvar no serviço
    const existing = plansService.getPlans();
    const record: PlanRecord = {
      id: planId,
      name: planForm.name,
      priceCents: planForm.priceCents,
      interval: planForm.interval,
      features: newPlan.features,
      status: 'active',
      createdAt: newPlan.createdAt,
      isRecommended: planForm.isRecommended,
      description: planForm.description,
      maxUsers: planForm.maxUsers,
      featuresList: newPlan.featuresList
    };

    if (editingPlan) {
      const updated = existing.map(p => p.id === planId ? record : p);
      plansService.savePlans(updated);
    } else {
      plansService.savePlans([record, ...existing]);
    }

    setShowPlanModal(false);
  };

  const deletePlan = (planId: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return;
    
    setPlans(prev => prev.filter(p => p.id !== planId));
    const all = plansService.getPlans().filter(p => p.id !== planId);
    plansService.savePlans(all);
  };

  const toggleRecommended = (planId: string) => {
    plansService.setRecommendedPlan(planId);
    setPlans(prev => prev.map(p => ({
      ...p,
      isRecommended: p.id === planId
    })));
  };

  const addFeature = () => {
    setPlanForm(prev => ({
      ...prev,
      featuresList: [...prev.featuresList, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setPlanForm(prev => ({
      ...prev,
      featuresList: prev.featuresList.map((f, i) => i === index ? value : f)
    }));
  };

  const removeFeature = (index: number) => {
    setPlanForm(prev => ({
      ...prev,
      featuresList: prev.featuresList.filter((_, i) => i !== index)
    }));
  };

  const renderPlans = () => (
    <div className="space-y-6">
      {/* Header */}
    <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Crown className="h-8 w-8 text-indigo-600" />
              Gerenciamento de Planos
            </h2>
            <p className="text-gray-600 mt-2">Configure e gerencie os planos de assinatura da plataforma</p>
          </div>
          <button 
            onClick={() => openPlanModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Novo Plano
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total de Planos</p>
                <p className="text-2xl font-bold">{plans.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Planos Ativos</p>
                <p className="text-2xl font-bold">{plans.filter(p => p.status === 'active').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Plano Recomendado</p>
                <p className="text-lg font-bold">{plans.find(p => p.isRecommended)?.name || 'Nenhum'}</p>
              </div>
              <Star className="h-8 w-8 text-purple-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Preço Médio</p>
                <p className="text-lg font-bold">
                  R$ {plans.length > 0 ? (plans.reduce((sum, p) => sum + p.price, 0) / plans.length / 100).toFixed(2) : '0,00'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Planos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div 
            key={plan.id} 
            className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl ${
              plan.isRecommended ? 'ring-2 ring-indigo-500 ring-opacity-50' : ''
            }`}
          >
            {/* Header do Card */}
            <div className={`p-6 ${plan.isRecommended ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${plan.isRecommended ? 'bg-white bg-opacity-20' : 'bg-indigo-100'}`}>
                    <Crown className={`h-6 w-6 ${plan.isRecommended ? 'text-white' : 'text-indigo-600'}`} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${plan.isRecommended ? 'text-white' : 'text-gray-900'}`}>
                      {plan.name}
                    </h3>
                    {plan.isRecommended && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 text-yellow-300 fill-current" />
                        <span className="text-yellow-200 text-sm font-medium">Recomendado</span>
                  </div>
                    )}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  plan.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {plan.status}
                </div>
              </div>

              {/* Preço */}
              <div className="mb-4">
                <div className={`text-3xl font-bold ${plan.isRecommended ? 'text-white' : 'text-gray-900'}`}>
                  R$ {(plan.price / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className={`text-sm ${plan.isRecommended ? 'text-indigo-100' : 'text-gray-600'}`}>
                  por mês
                </div>
              </div>

              {/* Descrição */}
              {plan.description && (
                <p className={`text-sm ${plan.isRecommended ? 'text-indigo-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
              )}
            </div>

            {/* Features */}
            <div className="p-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-indigo-600" />
                Recursos Inclusos
              </h4>
              <ul className="space-y-2 mb-6">
                {plan.featuresList && plan.featuresList.length > 0 ? (
                  plan.featuresList.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))
                ) : (
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {plan.features}
                  </li>
                )}
              </ul>

              {/* Limite de usuários */}
              {plan.maxUsers && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4 text-indigo-600" />
                    {plan.maxUsers === -1 ? 'Usuários ilimitados' : `Até ${plan.maxUsers} usuários`}
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-2">
                <button
                  onClick={() => openPlanModal(plan)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => toggleRecommended(plan.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    plan.isRecommended
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Star className={`h-4 w-4 ${plan.isRecommended ? 'fill-current' : ''}`} />
                  {plan.isRecommended ? 'Recomendado' : 'Recomendar'}
                </button>
                <button
                  onClick={() => deletePlan(plan.id)}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Criação/Edição */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingPlan ? 'Editar Plano' : 'Novo Plano'}
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Nome do Plano */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Plano *
                </label>
                <input
                  type="text"
                  value={planForm.name}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ex: Plano Pro"
                />
              </div>

              {/* Preço e Intervalo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço (centavos) *
                  </label>
                  <input
                    type="number"
                    value={planForm.priceCents}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, priceCents: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="9999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intervalo
                  </label>
                  <select
                    value={planForm.interval}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, interval: e.target.value as 'monthly' | 'yearly' }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={planForm.description}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descrição do plano..."
                />
              </div>

              {/* Limite de Usuários */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Limite de Usuários
                </label>
                <input
                  type="number"
                  value={planForm.maxUsers}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, maxUsers: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Digite -1 para ilimitado"
                />
                <p className="text-xs text-gray-500 mt-1">Digite -1 para usuários ilimitados</p>
              </div>

              {/* Recursos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recursos Inclusos
                </label>
                <div className="space-y-2">
                  {planForm.featuresList.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Ex: Suporte prioritário"
                      />
                      {planForm.featuresList.length > 1 && (
                        <button
                          onClick={() => removeFeature(index)}
                          className="px-3 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addFeature}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Recurso
                  </button>
                </div>
              </div>

              {/* Plano Recomendado */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isRecommended"
                  checked={planForm.isRecommended}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, isRecommended: e.target.checked }))}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isRecommended" className="text-sm font-medium text-gray-700">
                  Marcar como plano recomendado
                </label>
              </div>
            </div>

            {/* Footer do Modal */}
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowPlanModal(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={savePlan}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                {editingPlan ? 'Salvar Alterações' : 'Criar Plano'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSubscriptions = () => (
    <div className="space-y-6">
      {/* Header */}
    <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-indigo-600" />
              Gerenciamento de Assinaturas
            </h2>
            <p className="text-gray-600 mt-2">Monitore e gerencie todas as assinaturas ativas</p>
          </div>
          <button 
            onClick={() => {
          const tenantId = prompt('ID da organização');
          const planId = prompt('ID do plano');
          if (!tenantId || !planId) return;
          const id = `s${Date.now()}`;
              setSubscriptions(prev=>[{ 
                id, 
                tenantId, 
                planId, 
                status: 'active', 
                startDate: new Date().toISOString().slice(0,10), 
                endDate: '', 
                createdAt: new Date().toISOString().slice(0,10) 
              }, ...prev]);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nova Assinatura
          </button>
      </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total de Assinaturas</p>
                <p className="text-2xl font-bold">{subscriptions.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Assinaturas Ativas</p>
                <p className="text-2xl font-bold">{subscriptions.filter(s => s.status === 'active').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Receita Mensal</p>
                <p className="text-lg font-bold">
                  R$ {subscriptions
                    .filter(s => s.status === 'active')
                    .reduce((sum, s) => {
                      const plan = plans.find(p => p.id === s.planId);
                      return sum + (plan?.price || 0);
                    }, 0) / 100
                    .toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Organizações</p>
                <p className="text-lg font-bold">{new Set(subscriptions.map(s => s.tenantId)).size}</p>
              </div>
              <Building className="h-8 w-8 text-purple-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Assinaturas */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Assinaturas Ativas</h3>
        </div>
        
      <div className="overflow-x-auto">
        <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organização
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plano
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data de Início
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Mensal
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
            </tr>
          </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions.map(subscription => {
                const tenant = tenants.find(t => t.id === subscription.tenantId);
                const plan = plans.find(p => p.id === subscription.planId);
                
              return (
                  <tr key={subscription.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Building className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {tenant?.name || subscription.tenantId}
                          </div>
                          <div className="text-sm text-gray-500">
                            {tenant?.domain || 'Sem domínio'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          plan?.isRecommended ? 'bg-yellow-400' : 'bg-gray-300'
                        }`}></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {plan?.name || subscription.planId}
                          </div>
                          <div className="text-sm text-gray-500">
                            {plan?.maxUsers === -1 ? 'Usuários ilimitados' : `Até ${plan?.maxUsers || 0} usuários`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        subscription.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : subscription.status === 'expired'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {subscription.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(subscription.startDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      R$ {((plan?.price || 0) / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const status = prompt('Status (active|expired|suspended)', subscription.status) || subscription.status;
                            setSubscriptions(prev => prev.map(s => s.id === subscription.id ? { ...s, status } : s));
                          }}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            if (!confirm('Tem certeza que deseja excluir esta assinatura?')) return;
                            setSubscriptions(prev => prev.filter(s => s.id !== subscription.id));
                          }}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Excluir
                        </button>
                    </div>
                </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>

        {subscriptions.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma assinatura encontrada</h3>
            <p className="text-gray-500">Comece criando uma nova assinatura para uma organização.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderLicenses = () => {
    const licenses = licenseService.getAllLicenses();
    const analytics = licenseService.getAnalytics();
    const insights = licenseService.analyzeLicenseUsage();

    return (
      <div className="space-y-6">
        {/* Header */}
    <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Key className="h-8 w-8 text-indigo-600" />
                Gerenciamento de Licenças
              </h2>
              <p className="text-gray-600 mt-2">Monitore e gerencie todas as licenças do sistema</p>
        </div>
            <button 
              onClick={() => {
                const username = prompt('Nome do usuário');
                const email = prompt('Email do usuário');
                const planId = prompt('ID do plano (p1, p2, p3)');
                if (!username || !email || !planId) return;
                
                const planNames = { p1: 'Basic', p2: 'Starter', p3: 'Pro' };
                licenseService.createLicense({
                  userId: `user_${Date.now()}`,
                  username,
                  email,
                  planId,
                  planName: planNames[planId as keyof typeof planNames] || 'Basic',
                  status: 'active'
                });
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Nova Licença
            </button>
        </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Licenças Ativas</p>
                  <p className="text-2xl font-bold">{analytics.activeLicenses}</p>
        </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
      </div>
            </div>
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Licenças Expiradas</p>
                  <p className="text-2xl font-bold">{analytics.expiredLicenses}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Receita Total</p>
                  <p className="text-lg font-bold">R$ {(analytics.totalRevenue / 100).toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Uso Médio</p>
                  <p className="text-lg font-bold">{analytics.averageUsage.toFixed(1)}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-200" />
              </div>
            </div>
          </div>

          {/* Insights da IA */}
          {insights.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Insights da IA
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {insights.map((insight, index) => (
                  <li key={index}>• {insight}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Lista de Licenças */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Licenças Registradas</h3>
          </div>
          
      <div className="overflow-x-auto">
        <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chave da Licença
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plano
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uso
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiração
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
            </tr>
          </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {licenses.map(license => (
                  <tr key={license.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{license.username}</div>
                          <div className="text-sm text-gray-500">{license.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{license.key}</div>
                      <div className="text-sm text-gray-500">ID: {license.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          license.planName === 'Pro' ? 'bg-yellow-400' : 
                          license.planName === 'Starter' ? 'bg-blue-400' : 'bg-gray-400'
                        }`}></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{license.planName}</div>
                          <div className="text-sm text-gray-500">{license.features.length} recursos</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        license.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : license.status === 'expired'
                          ? 'bg-red-100 text-red-800'
                          : license.status === 'suspended'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {license.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {license.usageCount}
                        {license.maxUsage !== -1 && ` / ${license.maxUsage}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        Último uso: {license.lastUsed.toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {license.expiresAt.toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newStatus = license.status === 'active' ? 'suspended' : 'active';
                            licenseService.updateLicense(license.id, { status: newStatus });
                          }}
                          className={`font-medium ${
                            license.status === 'active' 
                              ? 'text-red-600 hover:text-red-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {license.status === 'active' ? 'Suspender' : 'Ativar'}
                        </button>
                        <button
                          onClick={() => {
                            const newKey = `PLOUTOS-${Date.now().toString(36).toUpperCase()}`;
                            licenseService.updateLicense(license.id, { key: newKey });
                          }}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Nova Chave
                        </button>
                        <button
                          onClick={() => {
                            if (!confirm('Tem certeza que deseja excluir esta licença?')) return;
                            licenseService.deleteLicense(license.id);
                          }}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Excluir
                        </button>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
          </div>

          {licenses.length === 0 && (
            <div className="text-center py-12">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma licença encontrada</h3>
              <p className="text-gray-500">Comece criando uma nova licença.</p>
            </div>
          )}
      </div>
    </div>
  );
  };

  const renderMonitoring = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Uptime</div>
          <div className="text-3xl font-bold text-green-700">{systemStats.systemUptime}%</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Fila WhatsApp</div>
          <div className="text-3xl font-bold text-indigo-700">0</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Erros (24h)</div>
          <div className="text-3xl font-bold text-red-600">0</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Tempo de Resposta</div>
          <div className="text-3xl font-bold text-blue-700">120ms</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Leads Pendentes</div>
          <div className="text-3xl font-bold text-amber-700">{leadCount}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Aprovados (24h)</div>
          <div className="text-3xl font-bold text-emerald-700">{approved24h}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Usuários Ativos</div>
          <div className="text-3xl font-bold text-purple-700">{activeUsersCount}</div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Logs Recentes</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>✔️ CallMeBot OK - Código enviado</li>
          <li>ℹ️ Admin abriu Painel Admin</li>
          <li>✔️ Modo demo ativo (backend offline)</li>
        </ul>
        <div className="mt-4">
          <button onClick={()=>setActiveTab('leads')} className="px-3 py-2 bg-indigo-600 text-white rounded">Ir para Leads</button>
        </div>
      </div>
    </div>
  );

  const renderComms = () => {
    const logs = JSON.parse(localStorage.getItem('comm_logs')||'[]');
        return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Comunicações (demo)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3">Tipo</th>
                <th className="text-left py-2 px-3">Destino</th>
                <th className="text-left py-2 px-3">Status</th>
                <th className="text-left py-2 px-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice().reverse().map((l:any, i:number)=> (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3">{l.type}</td>
                  <td className="py-2 px-3">{l.to}</td>
                  <td className="py-2 px-3">{l.ok? 'OK':'Falha'}</td>
                  <td className="py-2 px-3">{new Date(l.at).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
              {logs.length===0 && (
                <tr><td className="py-6 px-3 text-gray-500" colSpan={4}>Nenhum log.</td></tr>
              )}
            </tbody>
          </table>
        </div>
          </div>
        );
  };

  const renderSettings = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Configurações</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Branding</h3>
          <div className="space-y-2 text-sm">
            <label className="block">Nome do Produto</label>
            <input className="w-full border rounded px-3 py-2" placeholder="PloutosLedger" />
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Integrações</h3>
          <div className="space-y-2 text-sm">
            <label className="block">CallMeBot API Key</label>
            <input className="w-full border rounded px-3 py-2" placeholder="****" />
          </div>
        </div>
      </div>
      <div className="text-right">
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg" onClick={()=>alert('Configurações salvas (demo)')}>Salvar</button>
      </div>
          </div>
        );

  const renderSystems = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[{id:'cash',title:'Movimento de Caixa',desc:'Entradas, saídas e relatórios'}, {id:'notas',title:'Caderno de Notas',desc:'Notas fiscais e relatórios'}, {id:'cancel',title:'Cancelamentos',desc:'Gestão de cancelamentos'}].map(card => (
        <div key={card.id} className="bg-white rounded-xl shadow p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{card.title}</h3>
          <p className="text-sm text-gray-600 mb-4">{card.desc}</p>
          <div className="mt-auto">
            <button className="px-3 py-2 bg-indigo-600 text-white rounded" onClick={()=>alert(`${card.title} aberto (demo)`)}>Abrir</button>
          </div>
        </div>
      ))}
          </div>
        );

  const renderCashFlow = () => (
    <div className="h-full">
      <CashFlow isDemo={false} onBackToLanding={() => setActiveTab('overview')} />
          </div>
        );

  const renderPaymentGateway = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Gateway de Pagamento</h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPaymentGenerator(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300"
            >
              Gerar Pagamento
            </button>
            <button
              onClick={() => setShowApiDocumentation(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300"
            >
              Documentação API
            </button>
            <button
              onClick={() => setShowEcommerceConfig(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
            >
              Configurar E-commerce
            </button>
          </div>
        </div>
        
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">Carregando dados do gateway...</p>
          </div>
        )}

        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Cobranças Hoje</p>
                  <p className="text-3xl font-bold">{statistics.total_charges}</p>
                  <p className="text-green-200 text-sm">R$ {statistics.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <CreditCard className="w-8 h-8 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Taxa de Sucesso</p>
                  <p className="text-3xl font-bold">{statistics.success_rate}%</p>
                  <p className="text-blue-200 text-sm">Excelente</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Ticket Médio</p>
                  <p className="text-3xl font-bold">R$ {statistics.average_transaction.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-purple-200 text-sm">Por cobrança</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Métodos Ativos</p>
                  <p className="text-3xl font-bold">{paymentMethods.filter(m => m.enabled).length}</p>
                  <p className="text-orange-200 text-sm">Incluindo Crypto</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-200" />
              </div>
            </div>
          </div>
        )}

        {balance && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Saldo Disponível</p>
                  <p className="text-3xl font-bold">R$ {balance.available[0]?.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-emerald-200 text-sm">Para saque</p>
                </div>
                <DollarSign className="w-8 h-8 text-emerald-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Saldo Pendente</p>
                  <p className="text-3xl font-bold">R$ {balance.pending[0]?.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-yellow-200 text-sm">Processando</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-200" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Métodos de Pagamento</h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      method.enabled ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <span className={`text-sm font-bold ${
                        method.enabled ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {method.type === 'pix' ? '📱' : 
                         method.type === 'credit_card' ? '💳' : 
                         method.type === 'debit_card' ? '💳' :
                         method.type === 'boleto' ? '📄' : 
                         method.type === 'usdt' ? '₮' :
                         method.type === 'bitcoin' ? '₿' :
                         method.type === 'ethereum' ? 'Ξ' :
                         method.type === 'bnb' ? '🟡' : '🏦'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{method.name}</p>
                      <p className="text-sm text-gray-600">
                        Taxa: {method.fee_percentage}% + R$ {method.fee_fixed.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      method.enabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {method.enabled ? 'Ativo' : 'Inativo'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{method.processing_time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Cobranças Recentes</h3>
            <div className="space-y-3">
              {charges.map((charge) => (
                <div key={charge.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      charge.status === 'completed' ? 'bg-green-100' :
                      charge.status === 'pending' ? 'bg-yellow-100' :
                      charge.status === 'processing' ? 'bg-blue-100' :
                      charge.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      <span className={`text-sm font-bold ${
                        charge.status === 'completed' ? 'text-green-600' :
                        charge.status === 'pending' ? 'text-yellow-600' :
                        charge.status === 'processing' ? 'text-blue-600' :
                        charge.status === 'failed' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {charge.status === 'completed' ? '✓' :
                         charge.status === 'pending' ? '⏳' :
                         charge.status === 'processing' ? '🔄' :
                         charge.status === 'failed' ? '✗' : '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{charge.customer_name}</p>
                      <p className="text-sm text-gray-600">{charge.customer_email}</p>
                      {charge.crypto_address && (
                        <p className="text-xs text-purple-600">
                          {charge.payment_method.toUpperCase()}: {charge.crypto_address.slice(0, 8)}...
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      R$ {charge.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(charge.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    {charge.confirmation_count !== undefined && (
                      <p className="text-xs text-blue-600">
                        {charge.confirmation_count}/{charge.required_confirmations} confirmações
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-4">
          <button 
            onClick={() => setShowPaymentGenerator(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300"
          >
            Nova Cobrança
          </button>
          <button 
            onClick={() => setShowCompleteReport(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
          >
            Relatório Completo
          </button>
          <button 
            onClick={() => setShowWebhookConfig(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300"
          >
            Configurar Webhook
          </button>
          <button 
            onClick={() => setShowCustomerManager(true)}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300"
          >
            Gerenciar Clientes
          </button>
        </div>
      </div>
          </div>
        );

  const renderCMS = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">CMS & Personalização</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personalização da Landing Page</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título Principal</label>
                <input 
                  type="text" 
                  defaultValue={cmsConfig.landingPage?.title || "Controle Total do Seu Fluxo de Caixa"}
                  onChange={(e) => setCmsConfig(prev => ({
                    ...prev,
                    landingPage: { ...prev.landingPage, title: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtítulo</label>
                <input 
                  type="text" 
                  defaultValue={cmsConfig.landingPage?.subtitle || "Gestão Financeira Inteligente"}
                  onChange={(e) => setCmsConfig(prev => ({
                    ...prev,
                    landingPage: { ...prev.landingPage, subtitle: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor Principal</label>
                <div className="flex space-x-2">
                  <input 
                    type="color" 
                    defaultValue={cmsConfig.landingPage?.primaryColor || "#3B82F6"} 
                    onChange={(e) => setCmsConfig(prev => ({
                      ...prev,
                      landingPage: { ...prev.landingPage, primaryColor: e.target.value }
                    }))}
                    className="w-12 h-10 rounded border" 
                  />
                  <input 
                    type="text" 
                    defaultValue={cmsConfig.landingPage?.primaryColor || "#3B82F6"} 
                    onChange={(e) => setCmsConfig(prev => ({
                      ...prev,
                      landingPage: { ...prev.landingPage, primaryColor: e.target.value }
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurações de Tema</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tema Atual</label>
                <select 
                  defaultValue={cmsConfig.landingPage?.theme || "Moderno"}
                  onChange={(e) => setCmsConfig(prev => ({
                    ...prev,
                    landingPage: { ...prev.landingPage, theme: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>Moderno</option>
                  <option>Clássico</option>
                  <option>Minimalista</option>
                  <option>Escuro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const logoDataUrl = event.target?.result as string;
                          setCmsConfig(prev => ({
                            ...prev,
                            landingPage: { ...prev.landingPage, logo: logoDataUrl }
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer text-gray-500 hover:text-gray-700">
                    Clique para upload
                  </label>
                  {cmsConfig.landingPage?.logo && (
                    <div className="mt-2">
                      <img
                        src={cmsConfig.landingPage.logo}
                        alt="Logo"
                        className="h-16 mx-auto rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const faviconDataUrl = event.target?.result as string;
                          setCmsConfig(prev => ({
                            ...prev,
                            landingPage: { ...prev.landingPage, favicon: faviconDataUrl }
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    id="favicon-upload"
                  />
                  <label htmlFor="favicon-upload" className="cursor-pointer text-gray-500 hover:text-gray-700">
                    Clique para upload
                  </label>
                  {cmsConfig.landingPage?.favicon && (
                    <div className="mt-2">
                      <img
                        src={cmsConfig.landingPage.favicon}
                        alt="Favicon"
                        className="h-8 w-8 mx-auto rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Seções da Landing Page</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-800 mb-2">Hero Section</h4>
              <p className="text-sm text-gray-600 mb-3">Título principal e CTA</p>
              <button 
                onClick={() => {
                  const title = prompt('Título do Hero:', cmsConfig.sections?.hero?.title || 'Controle Total do Seu Fluxo de Caixa');
                  const subtitle = prompt('Subtítulo:', cmsConfig.sections?.hero?.subtitle || 'Gestão Financeira Inteligente');
                  if (title !== null && subtitle !== null) {
                    setCmsConfig(prev => ({
                      ...prev,
                      sections: {
                        ...prev.sections,
                        hero: { ...prev.sections?.hero, title, subtitle }
                      }
                    }));
                  }
                }}
                className="w-full px-3 py-2 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200"
              >
                Editar
              </button>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-800 mb-2">Planos</h4>
              <p className="text-sm text-gray-600 mb-3">Preços e recursos</p>
              <button 
                onClick={() => {
                  const title = prompt('Título dos Planos:', cmsConfig.sections?.plans?.title || 'Escolha seu Plano');
                  const description = prompt('Descrição:', cmsConfig.sections?.plans?.description || 'Planos flexíveis para sua empresa');
                  if (title !== null && description !== null) {
                    setCmsConfig(prev => ({
                      ...prev,
                      sections: {
                        ...prev.sections,
                        plans: { ...prev.sections?.plans, title, description }
                      }
                    }));
                  }
                }}
                className="w-full px-3 py-2 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200"
              >
                Editar
              </button>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-800 mb-2">Depoimentos</h4>
              <p className="text-sm text-gray-600 mb-3">Avaliações de clientes</p>
              <button 
                onClick={() => {
                  const title = prompt('Título dos Depoimentos:', cmsConfig.sections?.testimonials?.title || 'O que nossos clientes dizem');
                  const description = prompt('Descrição:', cmsConfig.sections?.testimonials?.description || 'Depoimentos reais de nossos usuários');
                  if (title !== null && description !== null) {
                    setCmsConfig(prev => ({
                      ...prev,
                      sections: {
                        ...prev.sections,
                        testimonials: { ...prev.sections?.testimonials, title, description }
                      }
                    }));
                  }
                }}
                className="w-full px-3 py-2 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200"
              >
                Editar
              </button>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-800 mb-2">Recursos</h4>
              <p className="text-sm text-gray-600 mb-3">Funcionalidades do sistema</p>
              <button 
                onClick={() => {
                  const title = prompt('Título dos Recursos:', cmsConfig.sections?.features?.title || 'Recursos Avançados');
                  const description = prompt('Descrição:', cmsConfig.sections?.features?.description || 'Todas as funcionalidades que você precisa');
                  if (title !== null && description !== null) {
                    setCmsConfig(prev => ({
                      ...prev,
                      sections: {
                        ...prev.sections,
                        features: { ...prev.sections?.features, title, description }
                      }
                    }));
                  }
                }}
                className="w-full px-3 py-2 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200"
              >
                Editar
              </button>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-800 mb-2">FAQ</h4>
              <p className="text-sm text-gray-600 mb-3">Perguntas frequentes</p>
              <button 
                onClick={() => {
                  const title = prompt('Título do FAQ:', cmsConfig.sections?.faq?.title || 'Perguntas Frequentes');
                  const description = prompt('Descrição:', cmsConfig.sections?.faq?.description || 'Tire suas dúvidas');
                  if (title !== null && description !== null) {
                    setCmsConfig(prev => ({
                      ...prev,
                      sections: {
                        ...prev.sections,
                        faq: { ...prev.sections?.faq, title, description }
                      }
                    }));
                  }
                }}
                className="w-full px-3 py-2 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200"
              >
                Editar
              </button>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-800 mb-2">Footer</h4>
              <p className="text-sm text-gray-600 mb-3">Links e informações</p>
              <button 
                onClick={() => {
                  const title = prompt('Título do Footer:', cmsConfig.sections?.footer?.title || 'Contato');
                  const description = prompt('Descrição:', cmsConfig.sections?.footer?.description || 'Entre em contato conosco');
                  if (title !== null && description !== null) {
                    setCmsConfig(prev => ({
                      ...prev,
                      sections: {
                        ...prev.sections,
                        footer: { ...prev.sections?.footer, title, description }
                      }
                    }));
                  }
                }}
                className="w-full px-3 py-2 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200"
              >
                Editar
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-4">
          <button 
            onClick={() => saveCmsConfig(cmsConfig)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300"
          >
            Salvar Alterações
          </button>
          <button 
            onClick={() => {
              // Preview functionality - could open a new tab with preview
              alert('Preview: As configurações serão aplicadas na próxima atualização da landing page');
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
          >
            Preview
          </button>
          <button 
            onClick={() => {
              // Publish functionality
              saveCmsConfig(cmsConfig);
              alert('Configurações publicadas com sucesso!');
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300"
          >
            Publicar
          </button>
        </div>
      </div>
    </div>
  );

  const renderPDVSystem = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Sistema PDV Completo</h2>
            <p className="text-gray-600">Ponto de Venda Profissional com todas as funcionalidades</p>
          </div>
          <button
            onClick={() => setShowPDVSystem(true)}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <DollarSign className="w-5 h-5" />
            <span>Abrir PDV</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Vendas Hoje</p>
                <p className="text-3xl font-bold">R$ 12.450,00</p>
                <p className="text-green-200 text-sm">+15% vs ontem</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Produtos</p>
                <p className="text-3xl font-bold">1.247</p>
                <p className="text-blue-200 text-sm">Em estoque</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Vendas</p>
                <p className="text-3xl font-bold">89</p>
                <p className="text-purple-200 text-sm">Este mês</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Estoque Baixo</p>
                <p className="text-3xl font-bold">3</p>
                <p className="text-orange-200 text-sm">Produtos</p>
              </div>
              <Bell className="w-8 h-8 text-orange-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Funcionalidades Principais</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">PDV Completo com Carrinho de Vendas</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Controle de Estoque Avançado</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Gestão de Lojas e Usuários</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Cadastro de Fornecedores e Fabricantes</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Sistema de Vendas e Cancelamentos</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Emissão de Cupom Fiscal</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Emissão de NFE</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Controle de Comissões</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recursos Avançados</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Integração com Gateway de Pagamento</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Relatórios Detalhados</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Backup Automático</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Multi-loja</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">API REST Completa</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Suporte a Múltiplos Usuários</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Sincronização em Tempo Real</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-800">🔓 ACESSO TOTAL LIBERADO</h4>
              <p className="text-green-700 text-sm">
                Como Super Administrador, você tem acesso completo e irrestrito a todas as funcionalidades do Sistema PDV. 
                Nenhuma restrição se aplica ao seu usuário.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinancialTools = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Ferramentas Financeiras</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Calculadora de Juros</p>
                <p className="text-2xl font-bold">Simples</p>
                <p className="text-green-200 text-sm">e Compostos</p>
              </div>
              <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🧮</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Análise de Fluxo</p>
                <p className="text-2xl font-bold">CFA</p>
                <p className="text-blue-200 text-sm">Cash Flow Analysis</p>
              </div>
              <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Projeções</p>
                <p className="text-2xl font-bold">12M</p>
                <p className="text-purple-200 text-sm">Próximos meses</p>
              </div>
              <div className="w-12 h-12 bg-purple-400/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Calculadora Financeira</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor Principal</label>
                <input
                  type="number"
                  placeholder="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Taxa de Juros (%)</label>
                <input
                  type="number"
                  placeholder="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Período (meses)</label>
                <input
                  type="number"
                  placeholder="12"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Resultado:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Juros Simples:</span>
                    <span className="font-bold text-green-600">R$ 600,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Juros Compostos:</span>
                    <span className="font-bold text-blue-600">R$ 795,86</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Diferença:</span>
                    <span className="font-bold text-purple-600">R$ 195,86</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Análise de Rentabilidade</h3>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">ROI por Método de Pagamento</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📱</span>
                      <span className="text-sm">PIX</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">98.5%</p>
                      <p className="text-xs text-gray-500">Taxa de sucesso</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">💳</span>
                      <span className="text-sm">Cartão</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">94.2%</p>
                      <p className="text-xs text-gray-500">Taxa de sucesso</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📄</span>
                      <span className="text-sm">Boleto</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">87.8%</p>
                      <p className="text-xs text-gray-500">Taxa de sucesso</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">Projeção de Receita</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Este mês:</span>
                    <span className="font-bold text-green-600">R$ 45.230,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Próximo mês:</span>
                    <span className="font-bold text-blue-600">R$ 52.180,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Crescimento:</span>
                    <span className="font-bold text-purple-600">+15.4%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ferramentas Avançadas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-800 mb-2">Simulador de Investimento</h4>
              <p className="text-sm text-gray-600 mb-3">Calcule retornos de investimentos</p>
              <button className="w-full px-3 py-2 bg-blue-100 text-blue-600 rounded text-sm">Abrir</button>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-800 mb-2">Análise de Risco</h4>
              <p className="text-sm text-gray-600 mb-3">Avalie riscos financeiros</p>
              <button className="w-full px-3 py-2 bg-red-100 text-red-600 rounded text-sm">Abrir</button>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-800 mb-2">Comparador de Taxas</h4>
              <p className="text-sm text-gray-600 mb-3">Compare taxas de mercado</p>
              <button className="w-full px-3 py-2 bg-green-100 text-green-600 rounded text-sm">Abrir</button>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-800 mb-2">Relatório Fiscal</h4>
              <p className="text-sm text-gray-600 mb-3">Gere relatórios para contador</p>
              <button className="w-full px-3 py-2 bg-purple-100 text-purple-600 rounded text-sm">Abrir</button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-4">
          <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300">
            Gerar Relatório Completo
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300">
            Exportar Dados
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300">
            Configurar Alertas
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsers();
      case 'leads':
        return renderLeads();
      case 'cashflow':
        return renderCashFlow();
      case 'tenants':
        return renderTenants();
      case 'plans':
        return renderPlans();
      case 'subscriptions':
        return renderSubscriptions();
      case 'licenses':
        return renderLicenses();
      case 'monitoring':
        return renderMonitoring();
      case 'comms':
        return renderComms();
      case 'settings':
        return renderSettings();
      case 'systems':
        return renderSystems();
      case 'payment-gateway':
        return renderPaymentGateway();
      case 'financial-tools':
        return renderFinancialTools();
      case 'pdv-system':
        return renderPDVSystem();
      case 'cms':
        return renderCMS();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  PloutosLedger
                </h1>
                <p className="text-sm text-gray-600 font-medium">Super Administrador - Painel Avançado</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
                <p className="text-xs text-indigo-600 font-medium">Super Administrador</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 bg-white/90 backdrop-blur-md shadow-xl min-h-screen border-r border-white/20">
          <nav className="p-6">
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Navegação</h2>
              <p className="text-sm text-gray-600">Gerencie todos os aspectos do sistema</p>
            </div>
            <ul className="space-y-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        if (item.id === 'admin') { setShowAdminPanel(true); return; }
                        if (item.id === 'analytics') { setShowAnalytics(true); return; }
                        if (item.id === 'notifications') { setShowNotifications(true); return; }
                        if (item.id === 'chat') { setShowChat(true); return; }
                        if (item.id === 'chat-management') { setShowChatManagement(true); return; }
                        if (item.id === 'audit-logs') { setShowAuditLogs(true); return; }
                        if (item.id === 'security-performance') { setShowSecurityPerformance(true); return; }
                        if (item.id === 'backup') { setShowBackup(true); return; }
                        setActiveTab(item.id);
                      }}
                      className={`w-full flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-300 group ${
                        isActive
                          ? `bg-gradient-to-r ${getColorClasses(item.color)} text-white shadow-lg transform scale-105`
                          : 'text-gray-600 hover:bg-white/50 hover:text-gray-800 hover:shadow-md hover:scale-102'
                      }`}
                    >
                      <div className={`p-2 rounded-lg transition-all duration-200 ${
                        isActive 
                          ? 'bg-white/20' 
                          : 'bg-gray-100 group-hover:bg-white group-hover:shadow-sm'
                      }`}>
                      <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                      <span className="font-medium">{item.label}</span>
                        {isActive && (
                          <div className="text-xs opacity-90 mt-1">Ativo</div>
                        )}
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                  </h2>
                  <p className="text-gray-600">
                    {activeTab === 'overview' && 'Visão geral do sistema e métricas principais'}
                    {activeTab === 'users' && 'Gerenciamento de usuários e permissões'}
                    {activeTab === 'leads' && 'Acompanhamento de leads e conversões'}
                    {activeTab === 'tenants' && 'Organizações e multi-tenancy'}
                    {activeTab === 'plans' && 'Planos de assinatura e preços'}
                    {activeTab === 'subscriptions' && 'Assinaturas ativas e pagamentos'}
                    {activeTab === 'licenses' && 'Licenças e chaves de acesso'}
                    {activeTab === 'monitoring' && 'Monitoramento e logs do sistema'}
                    {activeTab === 'comms' && 'Comunicações e notificações'}
                    {activeTab === 'settings' && 'Configurações gerais do sistema'}
                    {activeTab === 'payment-gateway' && 'Gateway de pagamento e transações'}
                    {activeTab === 'financial-tools' && 'Ferramentas financeiras avançadas'}
                    {activeTab === 'pdv-system' && 'Sistema PDV e vendas'}
                    {activeTab === 'cms' && 'CMS e personalização'}
                    {activeTab === 'cashflow' && 'Sistema de gestão financeira'}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 font-medium">Sistema Online</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {renderContent()}
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Configuração E-commerce */}
      {showEcommerceConfig && (
        <EcommerceConfig onClose={() => setShowEcommerceConfig(false)} />
      )}

      {/* Modal de Documentação da API */}
      {showApiDocumentation && (
        <ApiDocumentation onClose={() => setShowApiDocumentation(false)} />
      )}

      {/* Modal de Gerador de Pagamentos */}
      {showPaymentGenerator && (
        <PaymentGenerator onClose={() => setShowPaymentGenerator(false)} />
      )}

      {/* Modal de Relatório Completo */}
      {showCompleteReport && (
        <CompleteReport onClose={() => setShowCompleteReport(false)} />
      )}

      {/* Modal de Configurar Webhook */}
      {showWebhookConfig && (
        <WebhookConfig onClose={() => setShowWebhookConfig(false)} />
      )}

      {/* Modal de Gerenciar Clientes */}
      {showCustomerManager && (
        <CustomerManager onClose={() => setShowCustomerManager(false)} />
      )}

      {/* Modal PDV System */}
      {showPDVSystem && (
        <PDVSystemNew onClose={() => setShowPDVSystem(false)} />
      )}

      {/* Modal de Criação de Usuário */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Criar Novo Usuário</h3>
            </div>
            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const userData = {
                  username: formData.get('username') as string,
                  password: formData.get('password') as string,
                  role: formData.get('role') as string,
                  email: formData.get('email') as string
                };
                handleCreateUser(userData);
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome de Usuário</label>
                  <input
                    type="text"
                    name="username"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite o nome de usuário"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite o email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                  <input
                    type="password"
                    name="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite a senha"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Função</label>
                  <select
                    name="role"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                    <option value="superadmin">Super Administrador</option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateUserModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300"
                  >
                    Criar Usuário
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Painel Admin */}
      {showAdminPanel && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ring-1 ring-black/5">
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b rounded-t-2xl px-4 py-3 flex items-center justify-between">
              <div className="font-semibold text-gray-800">Painel Admin</div>
              <button onClick={()=>setShowAdminPanel(false)} className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50">Fechar</button>
            </div>
            <div className="bg-white rounded-b-2xl">
              <AdminPanel onBackToLanding={() => setShowAdminPanel(false)} />
            </div>
          </div>
        </div>
      )}
      {/* Modal de Edição de Usuário */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Editar Usuário</h3>
            </div>
            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const userData = {
                  username: formData.get('username') as string,
                  role: formData.get('role') as string,
                  password: formData.get('password') as string || undefined
                };
                handleUpdateUser(userData);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome de Usuário</label>
                    <input
                      type="text"
                      name="username"
                      defaultValue={editingUser.username}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nível de Permissão</label>
                    <select
                      name="role"
                      defaultValue={editingUser.role}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="user">Usuário</option>
                      <option value="admin">Administrador</option>
                      <option value="superadmin">Super Administrador</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha (opcional)</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Deixe em branco para manter a senha atual"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditUserModal(false);
                      setEditingUser(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                  >
                    Atualizar Usuário
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Modal Analytics */}
      {showAnalytics && (
        <AnalyticsDashboard onClose={() => setShowAnalytics(false)} />
      )}

      {/* Modal Notifications */}
      {showNotifications && (
        <NotificationSystem onClose={() => setShowNotifications(false)} />
      )}

      {/* Modal Chat */}
      {showChat && (
        <ChatSystem onClose={() => setShowChat(false)} />
      )}

      {/* Modal Chat Management */}
      {showChatManagement && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Chat</h2>
              <button
                onClick={() => setShowChatManagement(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="h-full">
              <ChatManagement />
            </div>
          </div>
        </div>
      )}

      {/* Modal Audit Logs */}
      {showAuditLogs && (
        <AuditLogsModal 
          isOpen={showAuditLogs}
          onClose={() => setShowAuditLogs(false)}
        />
      )}

      {/* Modal Security Performance */}
      {showSecurityPerformance && (
        <SecurityPerformanceModal 
          isOpen={showSecurityPerformance}
          onClose={() => setShowSecurityPerformance(false)}
        />
      )}

      {/* Modal Backup */}
      {showBackup && (
        <BackupSystem onClose={() => setShowBackup(false)} />
      )}
    </div>
  );
}

export default SuperAdminDashboard;
