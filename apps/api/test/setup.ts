import { config } from 'dotenv';
import { join } from 'path';

// Carregar variáveis de ambiente de .env.test
config({ path: join(__dirname, '../.env.test') });
