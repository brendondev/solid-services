#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Solid Service - Setup Automático\n');

const run = (command, cwd = process.cwd()) => {
  try {
    execSync(command, { cwd, stdio: 'inherit' });
  } catch (error) {
    console.error(`❌ Erro ao executar: ${command}`);
    process.exit(1);
  }
};

// 1. Verificar se está na raiz do projeto
const rootPath = path.join(__dirname, '..');
if (!fs.existsSync(path.join(rootPath, 'package.json'))) {
  console.error('❌ Execute este script da raiz do projeto!');
  process.exit(1);
}

console.log('📦 1. Instalando dependências...\n');
run('npm install', rootPath);

console.log('\n🗄️  2. Configurando banco de dados...\n');
const dbPath = path.join(rootPath, 'packages', 'database');

console.log('   Gerando Prisma Client...');
run('npx prisma generate', dbPath);

console.log('\n   Criando banco de dados...');
run('npx prisma db push', dbPath);

console.log('\n🌱 3. Populando banco com dados de teste...\n');
run('npm run db:seed', dbPath);

console.log('\n✅ Setup completo!\n');
console.log('─────────────────────────────────────────────');
console.log('Para iniciar o servidor, execute:\n');
console.log('  npm run dev\n');
console.log('Depois acesse:');
console.log('  🌐 API: http://localhost:3000');
console.log('  📚 Docs: http://localhost:3000/api/docs\n');
console.log('Credenciais:');
console.log('  📧 Email: admin@democompany.com');
console.log('  🔑 Senha: admin123');
console.log('─────────────────────────────────────────────\n');
