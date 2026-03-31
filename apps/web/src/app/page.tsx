import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle,
  Users,
  FileText,
  ClipboardList,
  DollarSign,
  BarChart3,
  Bell,
  Shield,
  Zap,
  Clock,
  Globe,
  Smartphone,
  Moon,
  Sun
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header/Navigation */}
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-lg border-b border-border z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Solid Service
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Funcionalidades
              </a>
              <a href="#benefits" className="text-muted-foreground hover:text-foreground transition-colors">
                Benefícios
              </a>
              <Link
                href="/auth/login"
                className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/auth/register"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Começar Grátis
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <div className="inline-block px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full text-blue-600 text-sm font-medium">
              🚀 Sistema completo de gestão de serviços
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Gerencie seu negócio de
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                serviços com eficiência
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Sistema ERP completo e moderno para empresas de serviços. Controle clientes, orçamentos,
              ordens de serviço, financeiro e muito mais em uma única plataforma.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/auth/register"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/25"
              >
                Começar Gratuitamente
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-4 border-2 border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors"
              >
                Já tenho conta
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Gratuito para começar</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Configuração em minutos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Recursos completos para gerenciar seu negócio de serviços de forma profissional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card - Clientes */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gestão de Clientes</h3>
              <p className="text-muted-foreground">
                Cadastro completo com contatos, endereços e histórico. Organize seus clientes de forma eficiente.
              </p>
            </div>

            {/* Feature Card - Orçamentos */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-600/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Orçamentos Rápidos</h3>
              <p className="text-muted-foreground">
                Crie orçamentos profissionais em segundos. Envie por email e acompanhe aprovações em tempo real.
              </p>
            </div>

            {/* Feature Card - Ordens de Serviço */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center mb-4">
                <ClipboardList className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ordens de Serviço</h3>
              <p className="text-muted-foreground">
                Controle completo de execução com timeline, checklist, agendamento e assinatura digital.
              </p>
            </div>

            {/* Feature Card - Financeiro */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-yellow-600/10 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Controle Financeiro</h3>
              <p className="text-muted-foreground">
                Gerencie recebíveis, registre pagamentos e tenha visão completa do fluxo de caixa.
              </p>
            </div>

            {/* Feature Card - Dashboard */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-pink-600/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dashboard Inteligente</h3>
              <p className="text-muted-foreground">
                Métricas em tempo real, gráficos interativos e insights para tomar melhores decisões.
              </p>
            </div>

            {/* Feature Card - Notificações */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-600/10 rounded-lg flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Notificações em Tempo Real</h3>
              <p className="text-muted-foreground">
                Seja notificado sobre orçamentos aprovados, pagamentos recebidos e muito mais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              Por que escolher o Solid Service?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tecnologia moderna e recursos poderosos para impulsionar seu negócio
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Benefit Item */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Seguro e Confiável</h3>
                <p className="text-muted-foreground">
                  Seus dados protegidos com criptografia de ponta. Backup automático e infraestrutura de alta disponibilidade.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600/10 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Rápido e Eficiente</h3>
                <p className="text-muted-foreground">
                  Interface otimizada e intuitiva. Realize suas tarefas em segundos e economize tempo precioso.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Disponível 24/7</h3>
                <p className="text-muted-foreground">
                  Acesse de qualquer lugar, a qualquer hora. Sistema sempre online e pronto para uso.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-600/10 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Multi-tenant</h3>
                <p className="text-muted-foreground">
                  Cada empresa tem seu próprio ambiente isolado. Dados seguros e organizados por tenant.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-600/10 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Responsivo</h3>
                <p className="text-muted-foreground">
                  Design adaptável para desktop, tablet e smartphone. Trabalhe de onde estiver.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600/10 rounded-lg flex items-center justify-center">
                <Moon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Dark Mode</h3>
                <p className="text-muted-foreground">
                  Tema claro e escuro incluídos. Escolha o que mais combina com você e trabalhe com conforto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para transformar seu negócio?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a centenas de empresas que já confiam no Solid Service para gerenciar seus serviços.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="group px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center gap-2 shadow-xl"
            >
              Começar Agora Grátis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Fazer Login
            </Link>
          </div>
          <p className="text-sm mt-6 opacity-75">
            Não precisa de cartão de crédito • Configure em minutos • Suporte incluído
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-card border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <span className="text-xl font-bold">Solid Service</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Sistema completo de gestão para empresas de serviços.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Funcionalidades</a></li>
                <li><a href="#benefits" className="hover:text-foreground transition-colors">Benefícios</a></li>
                <li><Link href="/auth/register" className="hover:text-foreground transition-colors">Começar Grátis</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contato</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Política de Privacidade</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2024 Solid Service. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
