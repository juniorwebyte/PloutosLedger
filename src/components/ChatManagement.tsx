import { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Send, 
  Phone, 
  Mail,
  Search,
  Filter,
  MoreVertical,
  Eye,
  EyeOff,
  Archive,
  Star,
  AlertCircle
} from 'lucide-react';
import { chatService, ChatSession, ChatMessage } from '../services/chatService';
import { notificationService } from '../services/notificationService';

// Interfaces já importadas do chatService

export default function ChatManagement() {
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: '1',
      userId: 'user1',
      userName: 'João Silva',
      userEmail: 'joao@empresa.com',
      status: 'active',
      lastMessage: 'Preciso de ajuda com a configuração do sistema',
      lastActivity: new Date(),
      messageCount: 3,
      priority: 'high'
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Maria Santos',
      userEmail: 'maria@loja.com',
      status: 'waiting',
      lastMessage: 'Qual o melhor plano para minha empresa?',
      lastActivity: new Date(Date.now() - 300000),
      messageCount: 1,
      priority: 'medium'
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Pedro Costa',
      userEmail: 'pedro@startup.com',
      status: 'closed',
      lastMessage: 'Obrigado pela ajuda!',
      lastActivity: new Date(Date.now() - 3600000),
      messageCount: 5,
      priority: 'low'
    }
  ]);

  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'waiting' | 'closed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  // Carregar dados do serviço de chat
  useEffect(() => {
    const loadData = () => {
      setSessions(chatService.getSessions());
    };

    loadData();
    
    // Subscrever para atualizações em tempo real
    const unsubscribe = chatService.subscribe((updatedSessions, updatedMessages) => {
      setSessions(updatedSessions);
      if (selectedSession) {
        setMessages(chatService.getSessionMessages(selectedSession.id));
      }
      
      // Criar notificação para novas sessões
      const newSessions = updatedSessions.filter(session => 
        session.status === 'waiting' && 
        !sessions.find(s => s.id === session.id)
      );
      
      newSessions.forEach(session => {
        notificationService.createNotification({
          type: 'chat',
          title: 'Nova Conversa de Chat',
          message: `${session.userName} iniciou uma conversa`,
          priority: 'high',
          category: 'chat',
          actionUrl: '#',
          actionText: 'Responder'
        });
      });
    });

    return unsubscribe;
  }, [selectedSession, sessions]);

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || session.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedSession) return;

    // Enviar mensagem através do serviço
    chatService.sendMessage(selectedSession.id, newMessage, true, 'Admin');
    setNewMessage('');
  };

  const handleSessionSelect = (session: ChatSession) => {
    setSelectedSession(session);
    // Carregar mensagens da sessão
    setMessages(chatService.getSessionMessages(session.id));
    // Marcar mensagens como lidas
    chatService.markMessagesAsRead(session.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <MessageCircle className="h-7 w-7 text-indigo-600" />
              Chat Management
            </h2>
            <p className="text-gray-600 mt-1">Gerencie conversas em tempo real</p>
          </div>
          
          {/* Estatísticas */}
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {sessions.filter(s => s.status === 'active').length}
              </div>
              <div className="text-sm text-gray-500">Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {sessions.filter(s => s.status === 'waiting').length}
              </div>
              <div className="text-sm text-gray-500">Aguardando</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {sessions.filter(s => s.status === 'closed').length}
              </div>
              <div className="text-sm text-gray-500">Fechadas</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Lista de Sessões */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          {/* Filtros */}
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar conversas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">Todos os status</option>
                  <option value="active">Ativas</option>
                  <option value="waiting">Aguardando</option>
                  <option value="closed">Fechadas</option>
                </select>
                
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as any)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">Todas as prioridades</option>
                  <option value="high">Alta</option>
                  <option value="medium">Média</option>
                  <option value="low">Baixa</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto">
            {filteredSessions.map(session => (
              <div
                key={session.id}
                onClick={() => handleSessionSelect(session)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedSession?.id === session.id ? 'bg-indigo-50 border-indigo-200' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{session.userName}</h4>
                      <p className="text-sm text-gray-500">{session.userEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(session.priority)}`}>
                      {session.priority}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{session.lastMessage}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{session.messageCount} mensagens</span>
                  <div className="flex items-center gap-2">
                    <button onClick={(e)=>{ e.stopPropagation(); const msgs = chatService.getSessionMessages(session.id); if (msgs.length>0) { const novo = prompt('Editar última mensagem desta conversa:'); if (novo) { const last = msgs[msgs.length-1]; chatService.editMessage(session.id, last.id, novo); } }} } className="px-2 py-1 border rounded hover:bg-gray-50">Editar última</button>
                    <button onClick={(e)=>{ e.stopPropagation(); if (confirm('Excluir conversa?')) chatService.deleteSession(session.id); }} className="px-2 py-1 border rounded text-red-600 hover:bg-red-50">Excluir</button>
                    <span>{session.lastActivity.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Área de Conversa */}
        <div className="flex-1 flex flex-col">
          {selectedSession ? (
            <>
              {/* Header da Conversa */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedSession.userName}</h3>
                      <p className="text-sm text-gray-500">{selectedSession.userEmail}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(selectedSession.status)}`}>
                      {selectedSession.status}
                    </span>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.userName === 'Admin' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.userName !== 'Admin' && (
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        message.userName === 'Admin'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <div className={`text-xs mt-1 flex items-center gap-2 ${
                        message.userName === 'Admin' ? 'text-indigo-100' : 'text-gray-500'
                      }`}>
                        <span>{message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        <button onClick={()=> chatService.deleteMessage(selectedSession!.id, message.id)} className="underline-offset-2 hover:underline">remover</button>
                      </div>
                    </div>
                    
                    {message.userName === 'Admin' && (
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-indigo-600" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Digite sua resposta..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Enviar
                  </button>
                </div>
                
                {/* Ações Rápidas */}
                <div className="flex gap-2 mt-3">
                  <button className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                    <Phone className="h-3 w-3" />
                    Ligar
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                    <Mail className="h-3 w-3" />
                    Email
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                    <Archive className="h-3 w-3" />
                    Arquivar
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione uma conversa</h3>
                <p className="text-gray-500">Escolha uma conversa da lista para começar a responder</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
