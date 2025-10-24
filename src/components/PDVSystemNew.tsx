import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Package, 
  Store as StoreIcon, 
  Users, 
  Truck, 
  Factory, 
  Tag, 
  Receipt, 
  FileText, 
  TrendingUp,
  DollarSign,
  BarChart3,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Calculator,
  CreditCard,
  Smartphone,
  Zap,
  Eye,
  Edit,
  Trash2,
  Save,
  ArrowLeft,
  ArrowRight,
  Minus,
  Percent,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  Heart,
  Share2,
  Printer,
  QrCode,
  Shield,
  Lock,
  Unlock,
  Bell,
  MessageCircle,
  HelpCircle,
  Info,
  ExternalLink,
  Copy,
  Check,
  Loader2
} from 'lucide-react';

interface PDVSystemNewProps {
  onClose: () => void;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  barcode?: string;
  image?: string;
  description?: string;
  cost?: number;
  margin?: number;
}

interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount: number;
  category: string;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  cnpj?: string;
  address?: string;
  points?: number;
}

function PDVSystemNew({ onClose }: PDVSystemNewProps) {
  const [activeTab, setActiveTab] = useState('pos');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentSale, setCurrentSale] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [customerCpfCnpj, setCustomerCpfCnpj] = useState<string>('');
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [saleNotes, setSaleNotes] = useState<string>('');
  const [isMobileView, setIsMobileView] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [changeAmount, setChangeAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Dados simulados para demonstração
  const mockProducts: Product[] = [
    { id: '1', name: 'Smartphone Samsung Galaxy', price: 1299.99, stock: 15, category: 'Eletrônicos', barcode: '7891234567890', description: 'Smartphone Android com 128GB' },
    { id: '2', name: 'Notebook Dell Inspiron', price: 2499.99, stock: 8, category: 'Eletrônicos', barcode: '7891234567891', description: 'Notebook Intel i5, 8GB RAM' },
    { id: '3', name: 'Fone Bluetooth', price: 199.99, stock: 25, category: 'Acessórios', barcode: '7891234567892', description: 'Fone sem fio com cancelamento de ruído' },
    { id: '4', name: 'Mouse Gamer', price: 89.99, stock: 30, category: 'Acessórios', barcode: '7891234567893', description: 'Mouse RGB com 7 botões' },
    { id: '5', name: 'Teclado Mecânico', price: 299.99, stock: 12, category: 'Acessórios', barcode: '7891234567894', description: 'Teclado RGB com switches azuis' },
    { id: '6', name: 'Monitor 24"', price: 899.99, stock: 6, category: 'Eletrônicos', barcode: '7891234567895', description: 'Monitor Full HD IPS' },
    { id: '7', name: 'Webcam HD', price: 149.99, stock: 20, category: 'Acessórios', barcode: '7891234567896', description: 'Webcam 1080p com microfone' },
    { id: '8', name: 'Tablet iPad', price: 1999.99, stock: 4, category: 'Eletrônicos', barcode: '7891234567897', description: 'Tablet Apple com 64GB' }
  ];

  const menuItems = [
    { id: 'pos', label: 'PDV', icon: ShoppingCart, color: 'emerald' },
    { id: 'products', label: 'Produtos', icon: Package, color: 'teal' },
    { id: 'customers', label: 'Clientes', icon: Users, color: 'blue' },
    { id: 'sales', label: 'Vendas', icon: DollarSign, color: 'green' },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, color: 'purple' },
    { id: 'settings', label: 'Configurações', icon: Settings, color: 'gray' }
  ];

  useEffect(() => {
    setProducts(mockProducts);
    
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const addToCart = (product: Product) => {
    const existingItem = currentSale.find(item => item.product_id === product.id);
    if (existingItem) {
      setCurrentSale(prev => prev.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1, total_price: (item.quantity + 1) * item.unit_price }
          : item
      ));
    } else {
      const newItem: SaleItem = {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.price,
        total_price: product.price,
        discount: 0,
        category: product.category
      };
      setCurrentSale(prev => [...prev, newItem]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCurrentSale(prev => prev.filter(item => item.product_id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCurrentSale(prev => prev.map(item =>
      item.product_id === productId
        ? { ...item, quantity, total_price: quantity * item.unit_price }
        : item
    ));
  };

  const calculateTotal = () => {
    const subtotal = currentSale.reduce((total, item) => total + item.total_price, 0);
    const discountAmount = subtotal * (discountPercentage / 100);
    return subtotal - discountAmount;
  };

  const calculateChange = () => {
    const total = calculateTotal();
    return cashReceived - total;
  };

  const finalizeSale = async () => {
    setIsProcessing(true);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Limpar carrinho
    setCurrentSale([]);
    setCurrentCustomer(null);
    setCustomerCpfCnpj('');
    setDiscountPercentage(0);
    setCashReceived(0);
    setChangeAmount(0);
    setSaleNotes('');
    
    setIsProcessing(false);
    setShowReceiptModal(true);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 hover:bg-blue-600 text-white',
      green: 'bg-green-500 hover:bg-green-600 text-white',
      amber: 'bg-amber-500 hover:bg-amber-600 text-white',
      orange: 'bg-orange-500 hover:bg-orange-600 text-white',
      emerald: 'bg-emerald-500 hover:bg-emerald-600 text-white',
      red: 'bg-red-500 hover:bg-red-600 text-white',
      cyan: 'bg-cyan-500 hover:bg-cyan-600 text-white',
      teal: 'bg-teal-500 hover:bg-teal-600 text-white',
      purple: 'bg-purple-500 hover:bg-purple-600 text-white',
      gray: 'bg-gray-500 hover:bg-gray-600 text-white',
      slate: 'bg-slate-500 hover:bg-slate-600 text-white'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm)
  );

  const renderPOS = () => (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Área de Produtos */}
      <div className="flex-1 bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Produtos</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-64"
              />
            </div>
            <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200 hover:border-emerald-300 hover:shadow-md"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-medium text-gray-800 text-sm mb-1">{product.name}</h3>
                <p className="text-emerald-600 font-bold text-lg">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-gray-500 mt-1">Estoque: {product.stock}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área do Carrinho */}
      <div className="w-full lg:w-96 bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Carrinho</h2>
          <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-sm font-medium">
            {currentSale.length} itens
          </span>
        </div>

        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
          {currentSale.map((item) => (
            <div key={item.product_id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800 text-sm">{item.product_name}</h4>
                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="font-bold text-gray-800">
                  R$ {item.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo da Venda */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">
              R$ {currentSale.reduce((total, item) => total + item.total_price, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Desconto:</span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                min="0"
                max="100"
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-emerald-600">
                R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-3 pt-4">
            <button
              onClick={() => setShowCustomerModal(true)}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Cliente</span>
            </button>

            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={currentSale.length === 0 || isProcessing}
              className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              <span>{isProcessing ? 'Processando...' : 'Finalizar Venda'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Gestão de Produtos</h2>
        <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Novo Produto</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Package className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{product.name}</h3>
              <p className="text-emerald-600 font-bold text-xl mb-1">
                R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-500 mb-3">{product.category}</p>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estoque:</span>
                <span className="font-medium">{product.stock}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Código:</span>
                <span className="font-medium">{product.barcode}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200 transition-colors">
                <Edit className="w-4 h-4 inline mr-1" />
                Editar
              </button>
              <button className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200 transition-colors">
                <Trash2 className="w-4 h-4 inline mr-1" />
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Gestão de Clientes</h2>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Novo Cliente</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cliente Demo */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <span className="bg-blue-400 px-2 py-1 rounded-full text-xs">VIP</span>
            </div>
            <h3 className="font-bold text-lg mb-2">João Silva</h3>
            <p className="text-blue-100 text-sm mb-1">joao@email.com</p>
            <p className="text-blue-100 text-sm mb-3">(11) 99999-9999</p>
            <div className="flex justify-between text-sm">
              <span>Pontos:</span>
              <span className="font-bold">1,250</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <span className="bg-green-400 px-2 py-1 rounded-full text-xs">Regular</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Maria Santos</h3>
            <p className="text-green-100 text-sm mb-1">maria@email.com</p>
            <p className="text-green-100 text-sm mb-3">(11) 88888-8888</p>
            <div className="flex justify-between text-sm">
              <span>Pontos:</span>
              <span className="font-bold">750</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <span className="bg-purple-400 px-2 py-1 rounded-full text-xs">Novo</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Pedro Costa</h3>
            <p className="text-purple-100 text-sm mb-1">pedro@email.com</p>
            <p className="text-purple-100 text-sm mb-3">(11) 77777-7777</p>
            <div className="flex justify-between text-sm">
              <span>Pontos:</span>
              <span className="font-bold">150</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSales = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Histórico de Vendas</h2>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
          <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2">
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Itens</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">15/10/2025</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">João Silva</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">3</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">R$ 1.299,99</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Concluída</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Ver</button>
                  <button className="text-emerald-600 hover:text-emerald-900">Reimprimir</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Relatórios e Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Vendas Hoje</p>
              <p className="text-3xl font-bold">R$ 12.450,00</p>
              <p className="text-blue-200 text-sm">+15% vs ontem</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Produtos Vendidos</p>
              <p className="text-3xl font-bold">89</p>
              <p className="text-green-200 text-sm">Este mês</p>
            </div>
            <Package className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Ticket Médio</p>
              <p className="text-3xl font-bold">R$ 145,00</p>
              <p className="text-purple-200 text-sm">+8% vs mês anterior</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Clientes Ativos</p>
              <p className="text-3xl font-bold">156</p>
              <p className="text-orange-200 text-sm">+12 novos</p>
            </div>
            <Users className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Produtos Mais Vendidos</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Package className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Smartphone Samsung</p>
                  <p className="text-sm text-gray-600">Eletrônicos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">25 vendas</p>
                <p className="text-sm text-gray-600">R$ 32.499,75</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Vendas por Categoria</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Eletrônicos</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <span className="text-sm font-medium">70%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Acessórios</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
                <span className="text-sm font-medium">30%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Configurações do Sistema</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurações Gerais</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Loja</label>
              <input type="text" defaultValue="Minha Loja" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ</label>
              <input type="text" defaultValue="12.345.678/0001-90" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
              <textarea defaultValue="Rua das Flores, 123 - Centro" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" rows={3}></textarea>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurações de Venda</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imposto Padrão (%)</label>
              <input type="number" defaultValue="18" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Desconto Máximo (%)</label>
              <input type="number" defaultValue="20" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
            <div className="flex items-center">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
              <label className="ml-2 text-sm text-gray-700">Permitir vendas sem estoque</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'pos':
        return renderPOS();
      case 'products':
        return renderProducts();
      case 'customers':
        return renderCustomers();
      case 'sales':
        return renderSales();
      case 'reports':
        return renderReports();
      case 'settings':
        return renderSettings();
      default:
        return renderPOS();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Sistema PDV</h1>
              <p className="text-gray-600">Ponto de Venda Profissional</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex space-x-1 overflow-x-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === item.id
                      ? getColorClasses(item.color)
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </div>

        {/* Modals */}
        {showCustomerModal && (
          <div className="fixed inset-0 z-60 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold text-gray-800">Selecionar Cliente</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CPF/CNPJ</label>
                    <input
                      type="text"
                      value={customerCpfCnpj}
                      onChange={(e) => setCustomerCpfCnpj(e.target.value)}
                      placeholder="Digite o CPF ou CNPJ"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowCustomerModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        setCurrentCustomer({
                          id: '1',
                          name: 'Cliente Encontrado',
                          cpf: customerCpfCnpj
                        });
                        setShowCustomerModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showPaymentModal && (
          <div className="fixed inset-0 z-60 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold text-gray-800">Forma de Pagamento</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento</label>
                    <select
                      value={selectedPaymentMethod}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">Selecione...</option>
                      <option value="cash">Dinheiro</option>
                      <option value="credit_card">Cartão de Crédito</option>
                      <option value="debit_card">Cartão de Débito</option>
                      <option value="pix">PIX</option>
                    </select>
                  </div>
                  
                  {selectedPaymentMethod === 'cash' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Valor Recebido</label>
                      <input
                        type="number"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(Number(e.target.value))}
                        placeholder="0,00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                      {cashReceived > 0 && (
                        <p className="mt-2 text-sm text-gray-600">
                          Troco: R$ {calculateChange().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        setShowPaymentModal(false);
                        finalizeSale();
                      }}
                      className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showReceiptModal && (
          <div className="fixed inset-0 z-60 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold text-gray-800">Venda Finalizada!</h3>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-gray-600">Venda processada com sucesso!</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowReceiptModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => {
                      setShowReceiptModal(false);
                      // Implementar impressão do cupom
                    }}
                    className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Imprimir Cupom
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PDVSystemNew;
