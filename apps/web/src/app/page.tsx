'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users,
  FileText,
  ClipboardList,
  DollarSign,
  BarChart3,
  Bell,
  Shield,
  Zap,
  Clock,
  Sparkles,
  ArrowRight,
  Check
} from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-lg opacity-50" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Solid Service
              </span>
            </div>
            <Link
              href="/auth/login"
              className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-medium"
            >
              Acessar
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center space-y-8"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-gray-400">Em Desenvolvimento - Beta Privado</span>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="text-6xl md:text-8xl font-bold leading-tight tracking-tight"
            >
              Gestão de serviços
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                reimaginada
              </span>
            </motion.h1>

            <motion.p
              variants={fadeIn}
              className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
            >
              ERP completo e moderno para empresas de serviços. Gerencie clientes, orçamentos,
              ordens de serviço e financeiro com inteligência artificial.
            </motion.p>

            <motion.div
              variants={fadeIn}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
            >
              <Link
                href="/auth/login"
                className="group px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all font-semibold flex items-center gap-2 shadow-2xl shadow-blue-600/25"
              >
                Acessar Plataforma
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Bento Grid - Feature Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* Large Card - Dashboard */}
            <div className="md:col-span-2 md:row-span-2 p-8 rounded-3xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all group">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs">Em breve</span>
              </div>
              <h3 className="text-3xl font-bold mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all">
                Dashboard Inteligente
              </h3>
              <p className="text-gray-400 text-lg">
                Métricas em tempo real, análises preditivas e insights acionáveis para tomar decisões estratégicas.
              </p>
            </div>

            {/* Small Cards */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center mb-4">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ordens de Serviço</h3>
              <p className="text-gray-400 text-sm">
                Controle total de execução com timeline e checklist.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Financeiro</h3>
              <p className="text-gray-400 text-sm">
                Gestão completa de recebíveis e fluxo de caixa.
              </p>
            </div>

            <div className="md:col-span-1 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Orçamentos</h3>
              <p className="text-gray-400 text-sm">
                Crie propostas profissionais em segundos.
              </p>
            </div>

            <div className="md:col-span-2 p-6 rounded-3xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Bell className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">Notificações em Tempo Real</h3>
                  <p className="text-gray-400 text-sm">
                    Fique por dentro de tudo que acontece no seu negócio.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4">
              Tecnologia de ponta
            </h2>
            <p className="text-xl text-gray-400">
              Recursos que impulsionam seu negócio
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Segurança Avançada',
                description: 'Criptografia de ponta a ponta e conformidade com LGPD.',
                color: 'from-blue-600 to-cyan-600'
              },
              {
                icon: Zap,
                title: 'Performance',
                description: 'Interface ultrarrápida e otimizada para produtividade.',
                color: 'from-yellow-600 to-orange-600'
              },
              {
                icon: Clock,
                title: 'Disponibilidade',
                description: 'Uptime de 99.9% e suporte técnico especializado.',
                color: 'from-purple-600 to-pink-600'
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { label: 'Empresas', value: '100+', suffix: '' },
              { label: 'Ordens/mês', value: '10k+', suffix: '' },
              { label: 'Uptime', value: '99.9', suffix: '%' },
              { label: 'Satisfação', value: '4.9', suffix: '/5' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-12 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 backdrop-blur-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
            <div className="relative z-10 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Pronto para começar?
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Entre em contato para conhecer a plataforma e solicitar acesso ao beta privado.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-black hover:bg-gray-100 transition-all font-semibold"
              >
                Acessar Plataforma
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">Solid Service</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-400">
              <Link href="/auth/login" className="hover:text-white transition-colors">
                Acessar
              </Link>
              <span>© 2024 Solid Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
