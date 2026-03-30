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
      // Parse do arquivo
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Converter para JSON
      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: '',
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
      // Parse do arquivo
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: '',
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
        case ImportEntityType.PRODUCTS:
          result = await this.importProducts(data, tenantId);
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
    _data: any[],
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
      [ImportEntityType.PRODUCTS]: ['nome', 'codigo'],
    };

    return fieldsMap[entityType] || [];
  }

  /**
   * Detecta automaticamente o tipo baseado no documento (CPF ou CNPJ)
   */
  private detectCustomerType(documento: string): 'pessoa_fisica' | 'pessoa_juridica' {
    // Remove caracteres não numéricos
    const numeros = documento.replace(/\D/g, '');

    if (numeros.length === 11) {
      return 'pessoa_fisica'; // CPF
    } else if (numeros.length === 14) {
      return 'pessoa_juridica'; // CNPJ
    }

    // Padrão: pessoa física
    return 'pessoa_fisica';
  }

  /**
   * Valida CPF
   */
  private isValidCPF(cpf: string): boolean {
    const numeros = cpf.replace(/\D/g, '');

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
   * Valida CNPJ
   */
  private isValidCNPJ(cnpj: string): boolean {
    const numeros = cnpj.replace(/\D/g, '');

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

      try {
        // Validações
        if (!row.nome || !row.documento) {
          throw new Error('Nome e documento são obrigatórios');
        }

        // Detectar tipo automaticamente baseado no documento
        const tipo = this.detectCustomerType(row.documento);

        // Validar documento
        const documentoNumeros = row.documento.replace(/\D/g, '');
        if (tipo === 'pessoa_fisica' && !this.isValidCPF(row.documento)) {
          throw new Error('CPF inválido');
        }
        if (tipo === 'pessoa_juridica' && !this.isValidCNPJ(row.documento)) {
          throw new Error('CNPJ inválido');
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
              zipCode: row.cep?.replace(/\D/g, '') || '',
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

        success++;
      } catch (error: any) {
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
   * Importa fornecedores (placeholder)
   */
  private async importSuppliers(
    data: any[],
    _tenantId: string,
  ): Promise<ImportResultDto> {
    // TODO: Implementar quando houver tabela de fornecedores
    return {
      success: 0,
      errors: data.length,
      warnings: 0,
      total: data.length,
      errorDetails: [
        {
          row: 1,
          error: 'Importação de fornecedores ainda não implementada',
        },
      ],
    };
  }

  /**
   * Importa produtos (placeholder)
   */
  private async importProducts(
    data: any[],
    _tenantId: string,
  ): Promise<ImportResultDto> {
    // TODO: Implementar quando houver tabela de produtos
    return {
      success: 0,
      errors: data.length,
      warnings: 0,
      total: data.length,
      errorDetails: [
        {
          row: 1,
          error: 'Importação de produtos ainda não implementada',
        },
      ],
    };
  }
}
