import React, { useState, useEffect } from 'react';
import { Lock, User, Eye, EyeOff, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Notification, { NotificationType } from './Notification';
import RegisterModal from './RegisterModal';
import ResetPasswordModal from './ResetPasswordModal';
import ResetUsernameModal from './ResetUsernameModal';

interface LoginProps {
  onBackToLanding?: () => void;
  loginType?: 'client' | 'superadmin';
  onBackToSelector?: () => void;
}

export default function Login({ onBackToLanding, loginType, onBackToSelector }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showResetUsernameModal, setShowResetUsernameModal] = useState(false);
  const [registerType, setRegisterType] = useState<'pessoa-fisica' | 'pessoa-juridica'>('pessoa-fisica');
  const [notification, setNotification] = useState<{
    type: NotificationType;
    message: string;
    isVisible: boolean;
  }>({
    type: 'info',
    message: '',
    isVisible: false
  });

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(username, password);
      if (success) {
        setNotification({
          type: 'success',
          message: 'Login realizado com sucesso!',
          isVisible: true
        });
      } else {
        setError('Usuário ou senha incorretos');
        setNotification({
          type: 'error',
          message: 'Credenciais inválidas. Tente novamente.',
          isVisible: true
        });
      }
    } catch (error) {
      setError('Erro ao fazer login. Tente novamente.');
      setNotification({
        type: 'error',
        message: 'Erro interno. Tente novamente.',
        isVisible: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Autologin pós-pagamento (demo)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('autologin');
      if (raw) {
        const creds = JSON.parse(raw);
        setUsername(creds.username || '');
        setPassword(creds.password || '');
        localStorage.removeItem('autologin');
      }
    } catch {}
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e as any);
    }
  };

  const handleDemoFill = (type: 'client'|'demo' = 'client') => {
    if (type==='demo') {
      setUsername('demo');
      setPassword('demo123');
    } else {
      setUsername('Webyte');
      setPassword('Webyte');
    }
    setNotification({
      type: 'info',
      message: 'Credenciais de demonstração preenchidas automaticamente!',
      isVisible: true
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/30 via-teal-100/30 to-cyan-100/30"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-sm p-6 border border-white/20 relative z-10">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Lock className="w-8 h-8 text-white relative z-10 group-hover:animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              PloutosLedger
            </h1>
            <p className="text-gray-600 text-base">
              {loginType === 'superadmin' 
                ? 'Acesso Super Administrador' 
                : loginType === 'client'
                ? 'Acesso da Loja'
                : 'Faça login para acessar o sistema'
              }
            </p>
            {loginType && (
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                loginType === 'superadmin' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {loginType === 'superadmin' ? '🔒 Super Admin' : '🏪 Dashboard da Loja'}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Usuário
              </label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 hover:border-emerald-300 focus:shadow-lg bg-white/50 backdrop-blur-sm"
                  placeholder="Digite seu usuário"
                  required
                  autoComplete="username"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-10 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 hover:border-emerald-300 focus:shadow-lg bg-white/50 backdrop-blur-sm"
                  placeholder="Digite sua senha"
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110 p-1 rounded-full hover:bg-gray-100"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-4 animate-pulse">
                <p className="text-red-700 text-sm font-medium text-center">{error}</p>
              </div>
            )}

            <div className="text-center space-y-1 text-xs">
              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setRegisterType('pessoa-fisica');
                    setShowRegisterModal(true);
                  }}
                  className="text-emerald-600 hover:text-emerald-800 transition-colors duration-200 hover:underline"
                >
                  Pessoa Física
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRegisterType('pessoa-juridica');
                    setShowRegisterModal(true);
                  }}
                  className="text-emerald-600 hover:text-emerald-800 transition-colors duration-200 hover:underline"
                >
                  Pessoa Jurídica
                </button>
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => setShowResetPasswordModal(true)}
                  className="text-gray-600 hover:text-gray-800 transition-colors duration-200 hover:underline"
                >
                  Redefinir senha
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetUsernameModal(true)}
                  className="text-gray-600 hover:text-gray-800 transition-colors duration-200 hover:underline"
                >
                  Redefinir usuário
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white py-3 px-6 rounded-lg hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 active:from-emerald-800 active:via-teal-800 active:to-cyan-800 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 font-semibold text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {isLoading ? (
                <div className="flex items-center justify-center relative z-10">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Entrando...
                </div>
              ) : (
                <span className="relative z-10">Entrar</span>
              )}
            </button>
          </form>
          
          <div className="mt-4 space-y-2">
            {onBackToSelector && (
              <button 
                onClick={onBackToSelector} 
                className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 hover:scale-105 transform"
              >
                ← Voltar ao seletor de acesso
              </button>
            )}
            {onBackToLanding && (
              <button 
                onClick={onBackToLanding} 
                className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 hover:scale-105 transform"
              >
                ← Voltar ao site
              </button>
            )}
          </div>

          <div className="mt-6 text-center p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200/50 backdrop-blur-sm">
            <p className="text-xs text-emerald-800 font-medium mb-2">
              <strong>Credenciais Disponíveis:</strong>
            </p>
            <div className="space-y-1 text-xs text-emerald-700">
              <div className="flex justify-between items-center">
                <span><strong>Webyte:</strong> Webyte</span>
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs">Cliente</span>
              </div>
              <div className="flex justify-between items-center">
                <span><strong>demo:</strong> demo123</span>
                <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">Demo</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button onClick={()=>handleDemoFill('client')} className="flex items-center justify-center gap-1 px-2 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-medium rounded-md hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow">
                <Zap className="w-3 h-3" /> Cliente
              </button>
              <button onClick={()=>handleDemoFill('demo')} className="flex items-center justify-center gap-1 px-2 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium rounded-md hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow">
                <Zap className="w-3 h-3" /> Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
        autoHide={true}
        duration={3000}
      />

      {/* Modais */}
      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={(userData) => {
            setShowRegisterModal(false);
            setNotification({
              type: 'success',
              message: 'Cadastro realizado! Aguarde aprovação do administrador.',
              isVisible: true
            });
          }}
          userType={registerType}
        />
      )}

      {showResetPasswordModal && (
        <ResetPasswordModal
          onClose={() => setShowResetPasswordModal(false)}
          onSuccess={() => {
            setShowResetPasswordModal(false);
            setNotification({
              type: 'success',
              message: 'Código de recuperação enviado! Verifique seu WhatsApp.',
              isVisible: true
            });
          }}
        />
      )}

      {showResetUsernameModal && (
        <ResetUsernameModal
          onClose={() => setShowResetUsernameModal(false)}
          onSuccess={() => {
            setShowResetUsernameModal(false);
            setNotification({
              type: 'success',
              message: 'Código de recuperação enviado! Verifique seu WhatsApp.',
              isVisible: true
            });
          }}
        />
      )}
    </>
  );
}