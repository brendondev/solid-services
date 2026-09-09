#!/usr/bin/env node
/**
 * ============================================================================
 * Postgres local SEM Docker (Windows)
 * ============================================================================
 *
 * Baixa os binários portáteis do PostgreSQL da EnterpriseDB, inicializa um
 * cluster dentro de `.local/` e sobe o servidor. Nada é instalado no sistema
 * e não precisa de privilégio de administrador — dá para apagar `.local/`
 * a qualquer momento.
 *
 * Existe porque esta máquina de desenvolvimento não tem Docker. Quando o
 * Docker Desktop estiver instalado, prefira `docker compose up -d postgres`,
 * que é o mesmo caminho usado depois no Coolify.
 *
 * Uso:
 *   node scripts/local-postgres.js setup    # baixa + inicializa + sobe + cria o banco
 *   node scripts/local-postgres.js start
 *   node scripts/local-postgres.js stop
 *   node scripts/local-postgres.js status
 *   node scripts/local-postgres.js reset    # apaga o cluster e refaz do zero
 */

const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PG_VERSION = '15.14-1';
const PG_USER = 'solid';
const PG_PASSWORD = 'solid123';
const PG_DB = 'solid_service_dev';
const PG_PORT = process.env.PGPORT || '5432';

const ROOT = path.join(__dirname, '..');
const LOCAL_DIR = path.join(ROOT, '.local');
const CACHE_DIR = path.join(LOCAL_DIR, 'cache');
const PG_HOME = path.join(LOCAL_DIR, 'pgsql');
const PG_BIN = path.join(PG_HOME, 'bin');
const DATA_DIR = path.join(LOCAL_DIR, 'pgdata');
const LOG_FILE = path.join(LOCAL_DIR, 'postgres.log');
const PWFILE = path.join(LOCAL_DIR, '.pgpass-init');

const ZIP_URL = `https://get.enterprisedb.com/postgresql/postgresql-${PG_VERSION}-windows-x64-binaries.zip`;
const ZIP_PATH = path.join(CACHE_DIR, `postgresql-${PG_VERSION}-windows-x64.zip`);

const DATABASE_URL = `postgresql://${PG_USER}:${PG_PASSWORD}@localhost:${PG_PORT}/${PG_DB}?schema=public`;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function log(msg) {
  console.log(msg);
}

function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

function assertWindows() {
  if (process.platform !== 'win32') {
    fail(
      'Este script usa os binários portáteis do PostgreSQL para Windows.\n' +
        'Em Linux/macOS use: docker compose up -d postgres'
    );
  }
}

function bin(name) {
  return path.join(PG_BIN, `${name}.exe`);
}

/** Executa um binário do Postgres repassando a saída para o terminal. */
function pg(name, args, opts = {}) {
  return execFileSync(bin(name), args, {
    stdio: 'inherit',
    env: { ...process.env, PGPASSWORD: PG_PASSWORD },
    ...opts,
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    let received = 0;
    let total = 0;

    const request = (currentUrl, redirects = 0) => {
      if (redirects > 5) return reject(new Error('Redirecionamentos demais'));

      https
        .get(currentUrl, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            res.resume();
            return request(res.headers.location, redirects + 1);
          }
          if (res.statusCode !== 200) {
            res.resume();
            return reject(new Error(`HTTP ${res.statusCode} ao baixar ${currentUrl}`));
          }

          total = Number(res.headers['content-length'] || 0);
          res.on('data', (chunk) => {
            received += chunk.length;
            if (total) {
              const pct = ((received / total) * 100).toFixed(1);
              process.stdout.write(
                `\r   ${pct}%  (${(received / 1048576).toFixed(0)}/${(total / 1048576).toFixed(0)} MB)`
              );
            }
          });
          res.pipe(file);
          file.on('finish', () => file.close(() => {
            process.stdout.write('\n');
            resolve();
          }));
        })
        .on('error', reject);
    };

    request(url);
  });
}

function isRunning() {
  if (!fs.existsSync(bin('pg_ctl')) || !fs.existsSync(DATA_DIR)) return false;
  const res = spawnSync(bin('pg_ctl'), ['status', '-D', DATA_DIR], { encoding: 'utf8' });
  return res.status === 0;
}

// ---------------------------------------------------------------------------
// comandos
// ---------------------------------------------------------------------------

async function ensureBinaries() {
  if (fs.existsSync(bin('postgres'))) {
    log('✅ Binários do PostgreSQL já presentes em .local/pgsql');
    return;
  }

  fs.mkdirSync(CACHE_DIR, { recursive: true });

  if (!fs.existsSync(ZIP_PATH)) {
    log(`📥 Baixando PostgreSQL ${PG_VERSION} (~320 MB, só uma vez)...`);
    log(`   ${ZIP_URL}`);
    await download(ZIP_URL, ZIP_PATH);
  } else {
    log('✅ Zip já em cache, pulando download');
  }

  log('📦 Extraindo...');
  // O zip da EDB traz uma pasta raiz `pgsql/` e inclui pgAdmin 4, StackBuilder,
  // doc e headers — junto passa de 1 GB. Só o servidor interessa aqui, então
  // extraímos apenas bin/lib/share (share é obrigatório: o initdb lê os
  // arquivos de timezone e os scripts SQL de bootstrap de lá).
  //
  // Expand-Archive é lento demais para um zip deste tamanho; usamos
  // System.IO.Compression direto e filtramos as entradas.
  const script = `
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('${ZIP_PATH.replace(/'/g, "''")}')
try {
  $wanted = @('pgsql/bin/', 'pgsql/lib/', 'pgsql/share/')
  $root = '${LOCAL_DIR.replace(/'/g, "''")}'
  $n = 0
  foreach ($entry in $zip.Entries) {
    $keep = $false
    foreach ($w in $wanted) { if ($entry.FullName.StartsWith($w)) { $keep = $true; break } }
    if (-not $keep) { continue }
    if ([string]::IsNullOrEmpty($entry.Name)) { continue }
    $dest = Join-Path $root ($entry.FullName -replace '/', '\\')
    $dir = Split-Path $dest -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $dest, $true)
    $n++
    if ($n % 500 -eq 0) { Write-Host "   $n arquivos..." }
  }
  Write-Host "   $n arquivos extraidos"
} finally {
  $zip.Dispose()
}
`;
  const res = spawnSync(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-Command', script],
    { stdio: 'inherit' }
  );
  if (res.status !== 0) fail('Falha ao extrair o zip do PostgreSQL');

  if (!fs.existsSync(bin('postgres'))) {
    fail(`Extração terminou mas ${bin('postgres')} não existe. Confira ${LOCAL_DIR}`);
  }
  log('✅ Binários prontos');
}

function initCluster() {
  if (fs.existsSync(path.join(DATA_DIR, 'PG_VERSION'))) {
    log('✅ Cluster já inicializado em .local/pgdata');
    return;
  }

  log('🗃️  Inicializando o cluster...');
  fs.mkdirSync(LOCAL_DIR, { recursive: true });
  fs.writeFileSync(PWFILE, PG_PASSWORD, 'utf8');
  try {
    pg('initdb', [
      '-D', DATA_DIR,
      '-U', PG_USER,
      `--pwfile=${PWFILE}`,
      '--encoding=UTF8',
      '--locale=C',
      '--auth-local=trust',
      '--auth-host=scram-sha-256',
    ]);
  } finally {
    // A senha em texto puro não fica no disco depois do initdb
    if (fs.existsSync(PWFILE)) fs.unlinkSync(PWFILE);
  }
  log('✅ Cluster inicializado');
}

function start() {
  if (isRunning()) {
    log(`✅ PostgreSQL já está rodando na porta ${PG_PORT}`);
    return;
  }
  log(`▶️  Subindo PostgreSQL na porta ${PG_PORT}...`);
  pg('pg_ctl', ['-D', DATA_DIR, '-l', LOG_FILE, '-o', `-p ${PG_PORT}`, '-w', 'start']);
  log('✅ PostgreSQL rodando');
}

function stop() {
  if (!isRunning()) {
    log('ℹ️  PostgreSQL não está rodando');
    return;
  }
  log('⏹️  Parando PostgreSQL...');
  pg('pg_ctl', ['-D', DATA_DIR, '-m', 'fast', '-w', 'stop']);
  log('✅ Parado');
}

function status() {
  if (isRunning()) {
    log(`✅ rodando na porta ${PG_PORT}`);
    log(`   DATABASE_URL=${DATABASE_URL}`);
  } else {
    log('⛔ parado');
  }
}

function createDatabase() {
  const check = spawnSync(
    bin('psql'),
    ['-U', PG_USER, '-p', PG_PORT, '-h', 'localhost', '-tAc',
     `SELECT 1 FROM pg_database WHERE datname='${PG_DB}'`, 'postgres'],
    { encoding: 'utf8', env: { ...process.env, PGPASSWORD: PG_PASSWORD } }
  );

  if (check.stdout && check.stdout.trim() === '1') {
    log(`✅ Banco "${PG_DB}" já existe`);
    return;
  }

  log(`🆕 Criando banco "${PG_DB}"...`);
  pg('createdb', ['-U', PG_USER, '-p', PG_PORT, '-h', 'localhost', PG_DB]);
  log('✅ Banco criado');
}

function reset() {
  stop();
  if (fs.existsSync(DATA_DIR)) {
    log('🧹 Removendo .local/pgdata...');
    fs.rmSync(DATA_DIR, { recursive: true, force: true });
  }
  log('✅ Cluster apagado. Rode `setup` para recriar.');
}

async function setup() {
  await ensureBinaries();
  initCluster();
  start();
  createDatabase();

  log('\n─────────────────────────────────────────────────────────');
  log('✅ Postgres local pronto.');
  log('\nColoque no seu .env (a raiz e packages/database usam a mesma):');
  log(`  DATABASE_URL="${DATABASE_URL}"`);
  log('\nPróximo passo:');
  log('  npm run db:setup     # migrations + seed + usuário demo');
  log('─────────────────────────────────────────────────────────\n');
}

// ---------------------------------------------------------------------------

async function main() {
  assertWindows();
  const cmd = process.argv[2] || 'setup';

  switch (cmd) {
    case 'setup': return setup();
    case 'start': return start();
    case 'stop': return stop();
    case 'status': return status();
    case 'reset': return reset();
    default:
      fail(`Comando desconhecido: ${cmd}\nUse: setup | start | stop | status | reset`);
  }
}

main().catch((e) => fail(e.message));
