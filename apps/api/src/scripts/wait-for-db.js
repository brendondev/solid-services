#!/usr/bin/env node
/**
 * Script para esperar o PostgreSQL estar pronto antes de rodar migrations
 * Usado no Railway deploy para evitar falhas de conexão
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const MAX_RETRIES = 30; // 30 tentativas
const RETRY_DELAY = 2000; // 2 segundos entre tentativas
const CONNECTION_TIMEOUT = 5000; // 5 segundos de timeout por tentativa

async function waitForDatabase() {
  console.log('🔍 Verificando conexão com o banco de dados...');
  console.log(`📊 Configuração: ${MAX_RETRIES} tentativas, ${RETRY_DELAY}ms de intervalo\n`);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`⏳ Tentativa ${attempt}/${MAX_RETRIES}...`);

      // Tenta conectar com o Prisma
      const { stdout, stderr } = await execPromise(
        'npx prisma db execute --stdin --file=/dev/null',
        {
          cwd: process.cwd(),
          timeout: CONNECTION_TIMEOUT,
          env: process.env,
        }
      );

      console.log('✅ Banco de dados está acessível!');
      return true;
    } catch (error) {
      const isLastAttempt = attempt === MAX_RETRIES;

      if (isLastAttempt) {
        console.error('❌ Falha ao conectar ao banco de dados após todas as tentativas.');
        console.error('🔧 Verifique:');
        console.error('   1. Se o serviço PostgreSQL está rodando no Railway');
        console.error('   2. Se a variável DATABASE_URL está configurada');
        console.error('   3. Se o Private Networking está habilitado');
        console.error('\n📝 Erro:', error.message);
        process.exit(1);
      }

      console.log(`⚠️  Banco ainda não está pronto. Aguardando ${RETRY_DELAY}ms...\n`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
}

// Executar
waitForDatabase()
  .then(() => {
    console.log('✨ Prosseguindo com migrations...\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
