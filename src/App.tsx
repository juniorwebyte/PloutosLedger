import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useVisualConfig } from './hooks/useVisualConfig';
import ErrorBoundary from './components/ErrorBoundary';
import LoginSelector from './components/LoginSelector';
import ClientDashboard from './components/ClientDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import LicenseModal from './components/LicenseModal';
import PaymentPage from './components/PaymentPage';

// Lazy load components
const Login = React.lazy(() => import('./components/Login'));
const CashFlow = React.lazy(() => import('./components/CashFlow'));
const LandingPage = React.lazy(() => import('./components/LandingPageNew'));
const AdminPanel = React.lazy(() => import('./components/AdminPanel'));

// Componente para rota de pagamento
function PaymentRoute() {
  return <PaymentPage />;
}

type LoginType = 'client' | 'superadmin' | null;

function AppContent() {
  const { isAuthenticated, role, license } = useAuth();
  const { carregarConfiguracoesVisuais } = useVisualConfig();
  const [loginType, setLoginType] = useState<LoginType>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  console.log('AppContent render - isAuthenticated:', isAuthenticated, 'loginType:', loginType, 'showLanding:', showLanding);

  // Carregar configurações visuais ao inicializar
  useEffect(() => {
    carregarConfiguracoesVisuais();
  }, [carregarConfiguracoesVisuais]);

  useEffect(() => {
    // Se logado e licença bloqueada, exibir modal
    if (isAuthenticated && license && license.status === 'blocked') {
      setShowLicenseModal(true);
    }
  }, [isAuthenticated, license]);

  // Abrir demo via evento/global flag (pós-cadastro)
  useEffect(() => {
    const handler = () => {
      setShowDemo(true);
      setShowLanding(false);
    };
    window.addEventListener('ploutos:open-demo', handler);
    // flag de segurança
    const force = localStorage.getItem('force_open_demo');
    if (force === 'true') {
      handler();
      localStorage.removeItem('force_open_demo');
    }
    return () => window.removeEventListener('ploutos:open-demo', handler);
  }, []);

  const handleSelectLogin = (type: 'client' | 'superadmin') => {
    console.log('handleSelectLogin chamado com tipo:', type);
    setLoginType(type);
    setShowLanding(false);
    console.log('Estado atualizado - loginType:', type, 'showLanding: false');
  };

  const handleBackToLogin = () => {
    setLoginType(null);
    setShowLanding(true);
  };

  const handleBackToLanding = () => {
    setShowLanding(true);
    setShowAdmin(false);
    setShowDemo(false);
  };

  const handleShowAdmin = () => {
    setShowAdmin(true);
    setShowLanding(false);
  };

  const handleShowDemo = () => {
    setShowDemo(true);
    setShowLanding(false);
  };


  // Se não está autenticado, mostrar seletor de login
  if (!isAuthenticated) {
    if (showLanding) {
      return (
        <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 flex items-center justify-center">
          <div className="text-white text-xl">Carregando...</div>
        </div>}>
          <LandingPage 
            onRequestLogin={() => handleSelectLogin('client')}
            onRequestDemo={handleShowDemo}
            onOpenAdmin={() => handleSelectLogin('superadmin')}
          />
        </Suspense>
      );
    }

    if (showAdmin) {
      return (
        <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 flex items-center justify-center">
          <div className="text-white text-xl">Carregando...</div>
        </div>}>
          <AdminPanel onBackToLanding={handleBackToLanding} />
        </Suspense>
      );
    }

    if (showDemo) {
      return (
        <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 flex items-center justify-center">
          <div className="text-white text-xl">Carregando...</div>
        </div>}>
          <CashFlow isDemo={true} onBackToLanding={handleBackToLanding} />
        </Suspense>
      );
    }


    // Se há tipo de login selecionado, mostrar tela de login
    if (loginType) {
      return (
        <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 flex items-center justify-center">
          <div className="text-white text-xl">Carregando...</div>
        </div>}>
          <Login 
            loginType={loginType}
            onBackToSelector={handleBackToLogin}
          />
        </Suspense>
      );
    }

    // Se não há tipo de login selecionado, mostrar seletor
    return <LoginSelector onSelectLogin={handleSelectLogin} />;
  }

  // Se está autenticado, mostrar dashboard baseado no role
  if (role === 'superadmin') {
    return <SuperAdminDashboard onBackToLogin={handleBackToLogin} />;
  } else {
    return <ClientDashboard onBackToLogin={handleBackToLogin} />;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <div className="text-white text-xl">Carregando PloutosLedger...</div>
              </div>
            </div>
          }>
            <Routes>
              <Route path="/pay/:linkinvoiceId" element={<PaymentRoute />} />
              <Route path="/*" element={<AppContent />} />
            </Routes>
            <LicenseModal isOpen={false} onClose={() => {}} onSubmitKey={() => {}} />
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;