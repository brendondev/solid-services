'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Lightbulb,
  Users,
  FileText,
  ClipboardList,
  DollarSign,
  BarChart3,
  Bell,
  Shield,
  Smartphone,
  FileSignature,
  Mail,
  Calendar,
  CreditCard,
  Zap,
  Globe,
  MessageSquare,
  CloudDownload,
  LockKeyhole,
  FileSearch,
  Settings
} from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

interface Feature {
  title: string;
  description: string;
  icon: any;
  status: 'completed' | 'in-progress' | 'planned';
}

const features: Feature[] = [
  // Completed
  {
    title: 'Gestão de Clientes',
    description: 'Cadastro completo de clientes com contatos, endereços e histórico detalhado.',
    icon: Users,
    status: 'completed'
  },
  {
    title: 'Orçamentos',
    description: 'Criação e envio de orçamentos profissionais com aprovação de clientes.',
    icon: FileText,
    status: 'completed'
  },
  {
    title: 'Ordens de Serviço',
    description: 'Controle completo de execução com timeline, checklist e agendamento.',
    icon: ClipboardList,
    status: 'completed'
  },
  {
    title: 'Gestão Financeira',
    description: 'Controle de recebíveis, pagamentos e fluxo de caixa detalhado.',
    icon: DollarSign,
    status: 'completed'
  },
  {
    title: 'Dashboard Analytics',
    description: 'Métricas operacionais e financeiras em tempo real com gráficos interativos.',
    icon: BarChart3,
    status: 'completed'
  },
  {
    title: 'Notificações',
    description: 'Sistema de notificações em tempo real para eventos importantes.',
    icon: Bell,
    status: 'completed'
  },
  {
    title: 'Multi-tenant',
    description: 'Isolamento completo de dados por empresa com segurança avançada.',
    icon: Shield,
    status: 'completed'
  },
  {
    title: 'Portal do Cliente',
    description: 'Área exclusiva para clientes acompanharem orçamentos e ordens.',
    icon: Globe,
    status: 'completed'
  },

  // In Progress
  {
    title: 'Importação e Migração de Dados',
    description: 'Importe dados de planilhas Excel e outros sistemas para facilitar a transição para o Solid Service.',
    icon: CloudDownload,
    status: 'in-progress'
  },
  {
    title: 'Assinatura Digital',
    description: 'Assinatura eletrônica de ordens de serviço e contratos diretamente na plataforma.',
    icon: FileSignature,
    status: 'in-progress'
  },
  {
    title: 'Integração WhatsApp',
    description: 'Envio de orçamentos e notificações via WhatsApp Business API.',
    icon: Mail,
    status: 'in-progress'
  },

  // Planned
  {
    title: 'Aplicativo Mobile',
    description: 'App nativo para iOS e Android para gestão em campo.',
    icon: Smartphone,
    status: 'planned'
  },
  {
    title: 'Chat Integrado',
    description: 'Comunicação em tempo real entre equipe e clientes diretamente na plataforma.',
    icon: MessageSquare,
    status: 'planned'
  },
  {
    title: 'Calendário Visual',
    description: 'Visualização de agendamentos, prazos e compromissos em calendário interativo.',
    icon: Calendar,
    status: 'planned'
  },
  {
    title: 'Notificações Personalizáveis',
    description: 'Configure alertas customizados por email, push ou SMS para eventos importantes.',
    icon: Bell,
    status: 'planned'
  },
  {
    title: 'Integrações Externas',
    description: 'Conecte com contabilidade, bancos, e-mail marketing e outras ferramentas essenciais.',
    icon: Settings,
    status: 'planned'
  },
  {
    title: 'Backup Automático',
    description: 'Cópias de segurança diárias com recuperação de dados em poucos cliques.',
    icon: CloudDownload,
    status: 'planned'
  },
  {
    title: 'Autenticação em Duas Etapas (2FA)',
    description: 'Camada extra de segurança com código de verificação via SMS ou autenticador.',
    icon: LockKeyhole,
    status: 'planned'
  },
  {
    title: 'Logs de Auditoria',
    description: 'Rastreamento completo de ações dos usuários para conformidade e segurança.',
    icon: FileSearch,
    status: 'planned'
  },
  {
    title: 'Emissão de NFe/NFSe',
    description: 'Emissão automática de notas fiscais integrada ao sistema.',
    icon: FileText,
    status: 'planned'
  },
  {
    title: 'Gateway de Pagamento',
    description: 'Integração com Stripe, PagSeguro e Mercado Pago para pagamentos online.',
    icon: CreditCard,
    status: 'planned'
  },
  {
    title: 'Automações',
    description: 'Workflows automatizados para agilizar processos repetitivos.',
    icon: Zap,
    status: 'planned'
  },
  {
    title: 'Relatórios Avançados',
    description: 'Relatórios personalizáveis com exportação em PDF e Excel.',
    icon: BarChart3,
    status: 'planned'
  },
];

const statusConfig = {
  completed: {
    label: 'Concluído',
    color: 'from-green-600 to-emerald-600',
    bgColor: 'bg-green-600/10',
    borderColor: 'border-green-600/20',
    icon: CheckCircle2
  },
  'in-progress': {
    label: 'Em Desenvolvimento',
    color: 'from-blue-600 to-cyan-600',
    bgColor: 'bg-blue-600/10',
    borderColor: 'border-blue-600/20',
    icon: Clock
  },
  planned: {
    label: 'Planejado',
    color: 'from-purple-600 to-pink-600',
    bgColor: 'bg-purple-600/10',
    borderColor: 'border-purple-600/20',
    icon: Lightbulb
  }
};

export default function RoadmapPage() {
  const groupedFeatures = {
    completed: features.filter(f => f.status === 'completed'),
    'in-progress': features.filter(f => f.status === 'in-progress'),
    planned: features.filter(f => f.status === 'planned')
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-lg opacity-50" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Solid Service
              </span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-20 pb-12 px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Roadmap de Desenvolvimento</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Acompanhe o que está
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                por vir
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Transparência total sobre as funcionalidades em desenvolvimento e nossos planos para o futuro da plataforma.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-12 px-6 pb-20">
        <div className="container mx-auto max-w-5xl space-y-16">
          {Object.entries(groupedFeatures).map(([status, items], sectionIndex) => {
            const config = statusConfig[status as keyof typeof statusConfig];
            const StatusIcon = config.icon;

            return (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
              >
                {/* Status Header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                    <StatusIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{config.label}</h2>
                    <p className="text-sm text-gray-400">{items.length} funcionalidades</p>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {items.map((feature, index) => {
                    const FeatureIcon = feature.icon;

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: sectionIndex * 0.1 + index * 0.05 }}
                        className={`p-6 rounded-2xl ${config.bgColor} border ${config.borderColor} backdrop-blur-xl hover:border-white/20 transition-all group`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0`}>
                            <FeatureIcon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-6 pb-20">
        <div className="container mx-auto max-w-4xl">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 backdrop-blur-xl text-center">
            <h3 className="text-2xl font-bold mb-3">Tem alguma sugestão?</h3>
            <p className="text-gray-400 mb-6">
              Estamos sempre ouvindo nossos usuários. Entre em contato para sugerir novas funcionalidades.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black hover:bg-gray-100 transition-all font-semibold"
            >
              Acessar Plataforma
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10">
        <div className="container mx-auto max-w-6xl text-center text-sm text-gray-400">
          <p>© 2026 Solid Service. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
