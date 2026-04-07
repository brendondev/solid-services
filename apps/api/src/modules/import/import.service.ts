import { Injectable, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../../core/database/prisma.service';
import {
  ImportEntityType,
  ImportPreviewDto,
  ImportResultDto,
  ImportValidationError,
  ImportErrorDetail,
} from './dto/analyze-import.dto';

@Injectable()
export class ImportService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Analisa o arquivo e retorna preview dos dados
   */
  async analyzeFile(
    file: Express.Multer.File,
    entityType: ImportEntityType,
  ): Promise<ImportPreviewDto> {
    try {
      // Parse do arquivo com suporte a UTF-8
      const workbook = XLSX.read(file.buffer, {
        type: 'buffer',
        codepage: 65001, // UTF-8
      });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Converter para JSON preservando caracteres especiais
      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: '',
        blankrows: false, // Ignorar linhas vazias
      });

      if (!rawData || rawData.length === 0) {
        throw new BadRequestException('Arquivo vazio ou sem dados válidos');
      }

      // Normalizar colunas (lowercase, sem espaços)
      const data = rawData.map((row: any) => {
        const normalized: any = {};
        Object.keys(row).forEach((key) => {
          const normalizedKey = key
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '_')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
          normalized[normalizedKey] = row[key];
        });
        return normalized;
      });

      const columns = Object.keys(data[0]);

      // Validar estrutura baseada na entidade
      const validationErrors = this.validateStructure(
        data,
        columns,
        entityType,
      );

      return {
        data: data.slice(0, 10), // Preview apenas das primeiras 10 linhas
        totalRows: data.length,
        columns,
        validationErrors,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new BadRequestException(`Erro ao processar arquivo: ${message}`);
    }
  }

  /**
   * Executa a importação dos dados
   */
  async executeImport(
    file: Express.Multer.File,
    entityType: ImportEntityType,
    tenantId: string,
  ): Promise<ImportResultDto> {
    try {
      // Parse do arquivo com suporte a UTF-8
      const workbook = XLSX.read(file.buffer, {
        type: 'buffer',
        codepage: 65001, // UTF-8
      });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: '',
        blankrows: false, // Ignorar linhas vazias
      });

      // Normalizar colunas
      const data = rawData.map((row: any) => {
        const normalized: any = {};
        Object.keys(row).forEach((key) => {
          const normalizedKey = key
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '_')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
          normalized[normalizedKey] = row[key];
        });
        return normalized;
      });

      // Importar baseado no tipo
      let result: ImportResultDto;

      switch (entityType) {
        case ImportEntityType.CUSTOMERS:
          result = await this.importCustomers(data, tenantId);
          break;
        case ImportEntityType.SERVICES:
          result = await this.importServices(data, tenantId);
          break;
        case ImportEntityType.SUPPLIERS:
          result = await this.importSuppliers(data, tenantId);
          break;
        case ImportEntityType.ALL:
          result = await this.importAll(data, tenantId);
          break;
        default:
          throw new BadRequestException('Tipo de entidade não suportado');
      }

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new BadRequestException(`Erro ao importar dados: ${message}`);
    }
  }

  /**
   * Valida estrutura do arquivo
   */
  private validateStructure(
    data: any[],
    columns: string[],
    entityType: ImportEntityType,
  ): ImportValidationError[] {
    const errors: ImportValidationError[] = [];
    const requiredFields = this.getRequiredFields(entityType);

    // Validar colunas obrigatórias
    requiredFields.forEach((field) => {
      if (!columns.includes(field)) {
        errors.push({
          row: 0,
          column: field,
          value: null,
          error: `Coluna obrigatória "${field}" não encontrada`,
        });
      }
    });

    // Validar dados de cada linha
    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 porque linha 1 é cabeçalho

      // Validações específicas por tipo
      if (entityType === ImportEntityType.CUSTOMERS) {
        // Validar documento
        if (row.documento) {
          const documentoLimpo = this.cleanDocument(row.documento);

          if (documentoLimpo.length !== 11 && documentoLimpo.length !== 14) {
            errors.push({
              row: rowNumber,
              column: 'documento',
              value: row.documento,
              error: `Documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos. Atual: ${documentoLimpo.length}`,
            });
          } else {
            // Validar CPF ou CNPJ com mensagens detalhadas
            const validation = documentoLimpo.length === 11
              ? this.validateCPFWithMessage(documentoLimpo)
              : this.validateCNPJWithMessage(documentoLimpo);

            if (!validation.valid) {
              errors.push({
                row: rowNumber,
                column: 'documento',
                value: row.documento,
                error: validation.error || 'Documento inválido',
              });
            }
          }
        }
      } else if (entityType === ImportEntityType.SERVICES) {
        // Validar preço
        if (row.preco) {
          const precoStr = row.preco.toString().replace(',', '.');
          const preco = parseFloat(precoStr);

          if (isNaN(preco)) {
            errors.push({
              row: rowNumber,
              column: 'preco',
              value: row.preco,
              error: `Preço inválido: "${row.preco}" não é um número. Use formato: 99.90 ou 99,90`,
            });
          } else if (preco <= 0) {
            errors.push({
              row: rowNumber,
              column: 'preco',
              value: row.preco,
              error: `Preço deve ser maior que zero (atual: R$ ${preco.toFixed(2)})`,
            });
          }
        }
      } else if (entityType === ImportEntityType.SUPPLIERS) {
        // Validar CNPJ com mensagem detalhada
        if (row.cnpj) {
          const validation = this.validateCNPJWithMessage(row.cnpj);

          if (!validation.valid) {
            errors.push({
              row: rowNumber,
              column: 'cnpj',
              value: row.cnpj,
              error: validation.error || 'CNPJ inválido',
            });
          }
        }
      }
    });

    return errors;
  }

  /**
   * Retorna campos obrigatórios por tipo
   */
  private getRequiredFields(entityType: ImportEntityType): string[] {
    const fieldsMap = {
      [ImportEntityType.CUSTOMERS]: ['nome', 'documento'],
      [ImportEntityType.SERVICES]: ['nome', 'preco'],
      [ImportEntityType.SUPPLIERS]: ['razao_social', 'cnpj'],
      [ImportEntityType.ALL]: ['tipo'], // tipo: customer, service ou supplier
    };

    return fieldsMap[entityType] || [];
  }

  /**
   * Limpa e normaliza documento (remove formatação)
   */
  private cleanDocument(documento: string): string {
    if (!documento) return '';

    // Converter para string (caso venha como número do Excel)
    let docString = String(documento);

    // Remover todos os caracteres não-numéricos (incluindo espaços, pontos, traços, barras, tabs, etc)
    let cleaned = docString.replace(/\D/g, '').trim();

    // Se tiver menos de 11 dígitos, pode ser CPF com zeros à esquerda removidos pelo Excel
    // Preencher com zeros à esquerda até 11 dígitos (CPF)
    if (cleaned.length > 0 && cleaned.length < 11) {
      cleaned = cleaned.padStart(11, '0');
    }
    // Se tiver entre 11 e 13 dígitos, pode ser CNPJ com zeros à esquerda removidos
    // Preencher com zeros à esquerda até 14 dígitos (CNPJ)
    else if (cleaned.length > 11 && cleaned.length < 14) {
      cleaned = cleaned.padStart(14, '0');
    }

    return cleaned;
  }

  /**
   * Limpa e normaliza CEP (remove formatação)
   */
  private cleanCEP(cep: string): string {
    if (!cep) return '';
    return cep.replace(/\D/g, '');
  }

  /**
   * Detecta automaticamente o tipo baseado no documento (CPF ou CNPJ)
   */
  private detectCustomerType(documento: string): 'individual' | 'company' {
    // Remove caracteres não numéricos
    const numeros = this.cleanDocument(documento);

    if (numeros.length === 11) {
      return 'individual'; // CPF
    } else if (numeros.length === 14) {
      return 'company'; // CNPJ
    }

    // Padrão: pessoa física
    return 'individual';
  }

  /**
   * Valida CPF (aceita com ou sem formatação)
   */
  private isValidCPF(cpf: string): boolean {
    const numeros = this.cleanDocument(cpf);

    if (numeros.length !== 11) return false;

    // Validação básica (todos os dígitos iguais)
    if (/^(\d)\1{10}$/.test(numeros)) return false;

    // Validação dos dígitos verificadores
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(numeros.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(numeros.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(numeros.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(numeros.charAt(10))) return false;

    return true;
  }

  /**
   * Valida CNPJ (aceita com ou sem formatação)
   */
  private isValidCNPJ(cnpj: string): boolean {
    const numeros = this.cleanDocument(cnpj);

    if (numeros.length !== 14) return false;

    // Validação básica (todos os dígitos iguais)
    if (/^(\d)\1{13}$/.test(numeros)) return false;

    // Validação dos dígitos verificadores
    let tamanho = numeros.length - 2;
    let numeros_validacao = numeros.substring(0, tamanho);
    const digitos = numeros.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros_validacao.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho = tamanho + 1;
    numeros_validacao = numeros.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros_validacao.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) return false;

    return true;
  }

  /**
   * Valida CPF e retorna mensagem detalhada de erro
   */
  private validateCPFWithMessage(cpf: string): { valid: boolean; error?: string } {
    const numeros = this.cleanDocument(cpf);

    if (!numeros || numeros.length === 0) {
      return { valid: false, error: 'CPF vazio ou inválido' };
    }

    if (numeros.length !== 11) {
      return {
        valid: false,
        error: `CPF deve ter 11 dígitos (atual: ${numeros.length}). Formato: 000.000.000-00`,
      };
    }

    // Validação básica (todos os dígitos iguais)
    if (/^(\d)\1{10}$/.test(numeros)) {
      return {
        valid: false,
        error: `CPF inválido: sequência com todos dígitos iguais (${numeros.charAt(0).repeat(3)}.${numeros.charAt(0).repeat(3)}.${numeros.charAt(0).repeat(3)}-${numeros.charAt(0).repeat(2)})`,
      };
    }

    // Validação dos dígitos verificadores
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(numeros.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(numeros.charAt(9))) {
      return {
        valid: false,
        error: 'CPF inválido: dígitos verificadores incorretos',
      };
    }

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(numeros.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(numeros.charAt(10))) {
      return {
        valid: false,
        error: 'CPF inválido: dígitos verificadores incorretos',
      };
    }

    return { valid: true };
  }

  /**
   * Valida CNPJ e retorna mensagem detalhada de erro
   */
  private validateCNPJWithMessage(cnpj: string): { valid: boolean; error?: string } {
    const numeros = this.cleanDocument(cnpj);

    if (!numeros || numeros.length === 0) {
      return { valid: false, error: 'CNPJ vazio ou inválido' };
    }

    if (numeros.length !== 14) {
      return {
        valid: false,
        error: `CNPJ deve ter 14 dígitos (atual: ${numeros.length}). Formato: 00.000.000/0000-00`,
      };
    }

    // Validação básica (todos os dígitos iguais)
    if (/^(\d)\1{13}$/.test(numeros)) {
      return {
        valid: false,
        error: `CNPJ inválido: sequência com todos dígitos iguais (${numeros.charAt(0).repeat(2)}.${numeros.charAt(0).repeat(3)}.${numeros.charAt(0).repeat(3)}/${numeros.charAt(0).repeat(4)}-${numeros.charAt(0).repeat(2)})`,
      };
    }

    // Validação dos dígitos verificadores
    let tamanho = numeros.length - 2;
    let numeros_validacao = numeros.substring(0, tamanho);
    const digitos = numeros.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros_validacao.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) {
      return {
        valid: false,
        error: 'CNPJ inválido: dígitos verificadores incorretos',
      };
    }

    tamanho = tamanho + 1;
    numeros_validacao = numeros.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros_validacao.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) {
      return {
        valid: false,
        error: 'CNPJ inválido: dígitos verificadores incorretos',
      };
    }

    return { valid: true };
  }

  /**
   * Importa clientes
   */
  private async importCustomers(
    data: any[],
    tenantId: string,
  ): Promise<ImportResultDto> {
    let success = 0;
    let errors = 0;
    const errorDetails: ImportErrorDetail[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // +2 porque linha 1 é cabeçalho e arrays começam em 0
      const isDevMode = process.env.NODE_ENV !== 'production';

      try {
        // Validações
        if (!row.nome || !row.documento) {
          throw new Error('Nome e documento são obrigatórios');
        }

        // Debug logs (sempre ativos para troubleshooting)
        console.log(`\n🔍 IMPORTAÇÃO Linha ${rowNumber}:`);
        console.log(`  📄 Documento RAW:`, row.documento);
        console.log(`  📝 Tipo do dado:`, typeof row.documento);

        // Limpar e normalizar documento
        const documentoNumeros = this.cleanDocument(row.documento);

        // Debug após limpeza
        console.log(`  ✨ Documento LIMPO:`, documentoNumeros);
        console.log(`  📏 Comprimento:`, documentoNumeros.length);
        if (isDevMode) {
          console.log(`  🔢 Caracteres:`, documentoNumeros.split('').map((c, i) => `[${i}]=${c}(${c.charCodeAt(0)})`).join(' '));
        }

        // Validar quantidade de dígitos
        if (documentoNumeros.length !== 11 && documentoNumeros.length !== 14) {
          throw new Error(`Documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos. Recebido: ${documentoNumeros.length} - Original: "${row.documento}" - Limpo: "${documentoNumeros}"`);
        }

        // Detectar tipo automaticamente baseado no documento limpo
        const tipo = this.detectCustomerType(documentoNumeros);
        console.log(`  👤 Tipo detectado:`, tipo === 'individual' ? 'CPF (Pessoa Física)' : 'CNPJ (Pessoa Jurídica)');

        // Validar documento
        const skipValidation = process.env.SKIP_DOCUMENT_VALIDATION === 'true';

        if (tipo === 'individual') {
          const isValid = this.isValidCPF(documentoNumeros);
          console.log(`  ✅ Validação CPF:`, isValid ? 'VÁLIDO' : 'INVÁLIDO');

          if (!isValid) {
            if (skipValidation) {
              console.log(`  ⚠️ CPF INVÁLIDO MAS IMPORTAÇÃO PERMITIDA (SKIP_DOCUMENT_VALIDATION=true)`);
            } else {
              throw new Error(`CPF inválido: ${documentoNumeros}. Para importar CPFs de teste, use SKIP_DOCUMENT_VALIDATION=true`);
            }
          }
        }
        if (tipo === 'company') {
          const isValid = this.isValidCNPJ(documentoNumeros);
          console.log(`  ✅ Validação CNPJ:`, isValid ? 'VÁLIDO' : 'INVÁLIDO');

          if (!isValid) {
            if (skipValidation) {
              console.log(`  ⚠️ CNPJ INVÁLIDO MAS IMPORTAÇÃO PERMITIDA (SKIP_DOCUMENT_VALIDATION=true)`);
            } else {
              throw new Error(`CNPJ inválido: ${documentoNumeros}. Para importar CNPJs de teste, use SKIP_DOCUMENT_VALIDATION=true`);
            }
          }
        }

        // Verificar se já existe
        const existingCustomer = await this.prisma.customer.findFirst({
          where: {
            tenantId,
            document: documentoNumeros,
          },
        });

        if (existingCustomer) {
          throw new Error(`Cliente com documento ${row.documento} já existe`);
        }

        // Criar cliente
        const customer = await this.prisma.customer.create({
          data: {
            tenantId,
            name: row.nome,
            document: documentoNumeros,
            type: tipo,
            status: 'active',
          },
        });

        // Criar endereço se houver dados
        if (row.endereco || row.cidade || row.estado || row.cep) {
          await this.prisma.customerAddress.create({
            data: {
              customer: {
                connect: { id: customer.id }
              },
              street: row.endereco || '',
              number: row.numero || '',
              complement: row.complemento || null,
              district: row.bairro || '',
              city: row.cidade || '',
              state: row.estado || '',
              zipCode: this.cleanCEP(row.cep) || '',
              isPrimary: true,
            },
          });
        }

        // Criar contato se houver email ou telefone
        if (row.email || row.telefone) {
          await this.prisma.customerContact.create({
            data: {
              customer: {
                connect: { id: customer.id }
              },
              name: row.nome_contato || row.nome,
              email: row.email || null,
              phone: row.telefone || null,
              isPrimary: true,
            },
          });
        }

        console.log(`  ✅ Cliente criado com sucesso!\n`);
        success++;
      } catch (error: any) {
        console.log(`  ❌ ERRO:`, error.message);
        if (isDevMode) {
          console.log(`  📋 Stack:`, error.stack?.split('\n').slice(0, 3).join('\n'));
        }
        console.log();
        errors++;
        errorDetails.push({
          row: rowNumber,
          error: error.message || 'Erro desconhecido',
          data: { nome: row.nome, documento: row.documento },
        });
      }
    }

    return {
      success,
      errors,
      warnings: 0,
      total: data.length,
      errorDetails,
    };
  }

  /**
   * Importa serviços
   */
  private async importServices(
    data: any[],
    tenantId: string,
  ): Promise<ImportResultDto> {
    let success = 0;
    let errors = 0;
    const errorDetails: ImportErrorDetail[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;

      try {
        if (!row.nome || !row.preco) {
          throw new Error('Nome e preço são obrigatórios');
        }

        const preco = parseFloat(row.preco.toString().replace(',', '.'));
        if (isNaN(preco) || preco <= 0) {
          throw new Error('Preço inválido');
        }

        // Verificar se já existe
        const existingService = await this.prisma.service.findFirst({
          where: {
            tenantId,
            name: row.nome,
          },
        });

        if (existingService) {
          throw new Error(`Serviço "${row.nome}" já existe`);
        }

        await this.prisma.service.create({
          data: {
            tenantId,
            name: row.nome,
            description: row.descricao || null,
            defaultPrice: preco,
            estimatedDuration: row.tempo_estimado
              ? parseInt(row.tempo_estimado)
              : null,
            status: 'active',
          },
        });

        success++;
      } catch (error: any) {
        errors++;
        errorDetails.push({
          row: rowNumber,
          error: error.message || 'Erro desconhecido',
          data: { nome: row.nome },
        });
      }
    }

    return {
      success,
      errors,
      warnings: 0,
      total: data.length,
      errorDetails,
    };
  }

  /**
   * Importa fornecedores
   */
  private async importSuppliers(
    data: any[],
    tenantId: string,
  ): Promise<ImportResultDto> {
    let success = 0;
    let errors = 0;
    const errorDetails: ImportErrorDetail[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;

      try {
        // Validações
        if (!row.razao_social || !row.cnpj) {
          throw new Error('Razão social e CNPJ são obrigatórios');
        }

        console.log(`\n🏢 IMPORTAÇÃO Fornecedor Linha ${rowNumber}:`);
        console.log(`  Nome:`, row.razao_social);
        console.log(`  CNPJ RAW:`, row.cnpj);

        // Limpar e validar CNPJ
        const cnpjNumeros = this.cleanDocument(row.cnpj);

        console.log(`  CNPJ LIMPO:`, cnpjNumeros);
        console.log(`  Comprimento:`, cnpjNumeros.length);

        if (cnpjNumeros.length !== 14) {
          throw new Error(`CNPJ deve ter 14 dígitos. Recebido: ${cnpjNumeros.length} - Original: "${row.cnpj}" - Limpo: "${cnpjNumeros}"`);
        }

        const skipValidation = process.env.SKIP_DOCUMENT_VALIDATION === 'true';
        const isValidCNPJ = this.isValidCNPJ(cnpjNumeros);
        console.log(`  ✅ Validação CNPJ:`, isValidCNPJ ? 'VÁLIDO' : 'INVÁLIDO');

        if (!isValidCNPJ) {
          if (skipValidation) {
            console.log(`  ⚠️ CNPJ INVÁLIDO MAS IMPORTAÇÃO PERMITIDA (SKIP_DOCUMENT_VALIDATION=true)`);
          } else {
            throw new Error(`CNPJ inválido: ${cnpjNumeros}. Para importar CNPJs de teste, use SKIP_DOCUMENT_VALIDATION=true`);
          }
        }

        // Verificar se já existe
        const existingSupplier = await this.prisma.supplier.findFirst({
          where: {
            tenantId,
            document: cnpjNumeros,
          },
        });

        if (existingSupplier) {
          throw new Error(`Fornecedor com CNPJ ${row.cnpj} já existe`);
        }

        // Criar fornecedor
        await this.prisma.supplier.create({
          data: {
            tenantId,
            name: row.razao_social,
            document: cnpjNumeros,
            email: row.email || null,
            phone: row.telefone || null,
            notes: row.notas || null,
            status: 'active',
          },
        });

        console.log(`  ✅ Fornecedor criado com sucesso!\n`);
        success++;
      } catch (error: any) {
        console.log(`  ❌ ERRO:`, error.message);
        console.log();
        errors++;
        errorDetails.push({
          row: rowNumber,
          error: error.message || 'Erro desconhecido',
          data: { razao_social: row.razao_social, cnpj: row.cnpj },
        });
      }
    }

    return {
      success,
      errors,
      warnings: 0,
      total: data.length,
      errorDetails,
    };
  }

  /**
   * Importa produtos (placeholder)
   */
  /**
   * Importa todos os tipos de uma vez (detecta automaticamente pelo campo "tipo")
   */
  private async importAll(
    data: any[],
    tenantId: string,
  ): Promise<ImportResultDto> {
    let totalSuccess = 0;
    let totalErrors = 0;
    let totalWarnings = 0;
    const allErrorDetails: ImportErrorDetail[] = [];

    // Separar por tipo
    const customers = data.filter(row => row.tipo?.toLowerCase() === 'cliente' || row.tipo?.toLowerCase() === 'customer');
    const services = data.filter(row => row.tipo?.toLowerCase() === 'serviço' || row.tipo?.toLowerCase() === 'service' || row.tipo?.toLowerCase() === 'servico');
    const suppliers = data.filter(row => row.tipo?.toLowerCase() === 'fornecedor' || row.tipo?.toLowerCase() === 'supplier');

    // Importar clientes
    if (customers.length > 0) {
      const result = await this.importCustomers(customers, tenantId);
      totalSuccess += result.success;
      totalErrors += result.errors;
      totalWarnings += result.warnings;
      allErrorDetails.push(...result.errorDetails);
    }

    // Importar serviços
    if (services.length > 0) {
      const result = await this.importServices(services, tenantId);
      totalSuccess += result.success;
      totalErrors += result.errors;
      totalWarnings += result.warnings;
      allErrorDetails.push(...result.errorDetails);
    }

    // Importar fornecedores
    if (suppliers.length > 0) {
      const result = await this.importSuppliers(suppliers, tenantId);
      totalSuccess += result.success;
      totalErrors += result.errors;
      totalWarnings += result.warnings;
      allErrorDetails.push(...result.errorDetails);
    }

    return {
      success: totalSuccess,
      errors: totalErrors,
      warnings: totalWarnings,
      total: data.length,
      errorDetails: allErrorDetails,
    };
  }
}
