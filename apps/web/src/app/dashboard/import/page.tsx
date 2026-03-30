'use client';

import { useState } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, ArrowRight, FileText, Users, Wrench, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

type EntityType = 'customers' | 'services' | 'suppliers' | 'products';

interface ImportStats {
  total: number;
  success: number;
  errors: number;
  warnings: number;
}

export default function ImportPage() {
  const [selectedEntity, setSelectedEntity] = useState<EntityType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const entities = [
    {
      type: 'customers' as EntityType,
      name: 'Clientes',
      description: 'Importe sua base de clientes com contatos e endereços',
      icon: Users,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
      fields: ['nome', 'email', 'telefone', 'documento', 'tipo', 'endereço', 'cidade', 'estado', 'cep'],
    },
    {
      type: 'services' as EntityType,
      name: 'Serviços',
      description: 'Catálogo de serviços e preços',
      icon: Wrench,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30',
      fields: ['nome', 'descrição', 'preço', 'unidade', 'categoria', 'tempo_estimado', 'garantia'],
    },
    {
      type: 'suppliers' as EntityType,
      name: 'Fornecedores',
      description: 'Base de fornecedores e parceiros',
      icon: Building2,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30',
      fields: ['razao_social', 'nome_fantasia', 'cnpj', 'email', 'telefone', 'contato', 'endereço'],
    },
    {
      type: 'products' as EntityType,
      name: 'Produtos',
      description: 'Estoque e produtos para venda',
      icon: FileText,
      color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
      fields: ['nome', 'código', 'preço_compra', 'preço_venda', 'estoque', 'fornecedor', 'categoria'],
    },
  ];

  const handleDownloadTemplate = (type: EntityType) => {
    const entity = entities.find(e => e.type === type);
    if (!entity) return;

    // Criar CSV com cabeçalhos
    const headers = entity.fields.join(',');
    const exampleRow = entity.fields.map(() => '').join(',');
    const csv = `${headers}\n${exampleRow}`;

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `template_${type}.csv`;
    link.click();

    toast.success(`Template de ${entity.name} baixado!`);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validar tipo de arquivo
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ];

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
      toast.error('Formato de arquivo inválido. Use Excel (.xlsx, .xls) ou CSV (.csv)');
      return;
    }

    setFile(selectedFile);
    toast.success('Arquivo selecionado! Clique em "Analisar" para continuar.');
  };

  const handleAnalyze = async () => {
    if (!file || !selectedEntity) return;

    try {
      setUploading(true);

      // TODO: Enviar para API para análise
      // Simular análise
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Dados de exemplo
      const mockData = [
        { nome: 'João Silva', email: 'joao@email.com', telefone: '(11) 98765-4321', documento: '123.456.789-00' },
        { nome: 'Maria Santos', email: 'maria@email.com', telefone: '(11) 98765-4322', documento: '987.654.321-00' },
        { nome: 'Pedro Oliveira', email: 'pedro@email.com', telefone: '(11) 98765-4323', documento: '456.789.123-00' },
      ];

      setPreviewData(mockData);
      toast.success('Arquivo analisado com sucesso!');
    } catch (error) {
      toast.error('Erro ao analisar arquivo');
    } finally {
      setUploading(false);
    }
  };

  const handleImport = async () => {
    if (!file || !selectedEntity || previewData.length === 0) return;

    try {
      setImporting(true);

      // TODO: Enviar para API para importação
      // Simular importação
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Resultado de exemplo
      setImportStats({
        total: previewData.length,
        success: previewData.length - 1,
        errors: 1,
        warnings: 0,
      });

      setErrors([
        'Linha 2: Email "maria@email.com" já existe no sistema',
      ]);

      toast.success('Importação concluída!');
    } catch (error) {
      toast.error('Erro ao importar dados');
    } finally {
      setImporting(false);
    }
  };

  const resetImport = () => {
    setSelectedEntity(null);
    setFile(null);
    setPreviewData([]);
    setImportStats(null);
    setErrors([]);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Upload className="w-8 h-8" />
          Importar Dados
        </h1>
        <p className="text-muted-foreground mt-1">
          Importe dados de planilhas Excel ou CSV do seu sistema antigo
        </p>
      </div>

      {/* Step 1: Select Entity */}
      {!selectedEntity && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              1
            </div>
            <h2 className="text-xl font-semibold">Escolha o que deseja importar</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entities.map((entity) => (
              <button
                key={entity.type}
                onClick={() => setSelectedEntity(entity.type)}
                className="flex items-start gap-4 p-6 bg-card rounded-lg border-2 border-border hover:border-primary transition-all text-left group"
              >
                <div className={`p-3 rounded-lg ${entity.color}`}>
                  <entity.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                    {entity.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {entity.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <span>Selecionar</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Upload File */}
      {selectedEntity && !importStats && (
        <div className="space-y-6">
          {/* Selected Entity Info */}
          <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-3">
              {(() => {
                const entity = entities.find(e => e.type === selectedEntity);
                const Icon = entity?.icon || FileText;
                return (
                  <>
                    <div className={`p-2 rounded-lg ${entity?.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{entity?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Campos: {entity?.fields.length}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
            <button
              onClick={resetImport}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Trocar
            </button>
          </div>

          {/* Download Template */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <h2 className="text-xl font-semibold">Baixe o template</h2>
            </div>

            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <FileSpreadsheet className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium mb-2">Template de Importação</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Baixe nossa planilha modelo e preencha com seus dados. Mantenha os nomes das colunas.
                </p>
                <button
                  onClick={() => handleDownloadTemplate(selectedEntity)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Baixar Template
                </button>
              </div>
            </div>
          </div>

          {/* Upload File */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <h2 className="text-xl font-semibold">Envie sua planilha</h2>
            </div>

            <div className="space-y-4">
              <label className="block">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer bg-muted/20">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  {file ? (
                    <div>
                      <p className="font-medium text-primary mb-1">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium mb-1">Clique para selecionar ou arraste o arquivo</p>
                      <p className="text-sm text-muted-foreground">
                        Formatos aceitos: .xlsx, .xls, .csv (Máx: 10 MB)
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </label>

              {file && !previewData.length && (
                <button
                  onClick={handleAnalyze}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Analisando...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-4 h-4" />
                      Analisar Arquivo
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Preview Data */}
          {previewData.length > 0 && (
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    4
                  </div>
                  <h2 className="text-xl font-semibold">Pré-visualização</h2>
                </div>
                <span className="text-sm text-muted-foreground">
                  {previewData.length} registros encontrados
                </span>
              </div>

              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 font-medium">#</th>
                      {Object.keys(previewData[0] || {}).map((key) => (
                        <th key={key} className="text-left p-2 font-medium capitalize">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="p-2 text-muted-foreground">{i + 1}</td>
                        {Object.values(row).map((value: any, j) => (
                          <td key={j} className="p-2">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {previewData.length > 5 && (
                <p className="text-sm text-muted-foreground mb-4">
                  Mostrando 5 de {previewData.length} registros
                </p>
              )}

              <button
                onClick={handleImport}
                disabled={importing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Importar {previewData.length} Registros
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Results */}
      {importStats && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card rounded-lg border border-green-200 dark:border-green-900/30 p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Importados</p>
                  <p className="text-3xl font-bold text-green-600">
                    {importStats.success}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-red-200 dark:border-red-900/30 p-6">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Erros</p>
                  <p className="text-3xl font-bold text-red-600">
                    {importStats.errors}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-amber-200 dark:border-amber-900/30 p-6">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Avisos</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {importStats.warnings}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-lg p-6">
            <div className="flex gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-400 mb-1">
                  Importação Concluída!
                </h3>
                <p className="text-sm text-green-800 dark:text-green-400/80">
                  {importStats.success} de {importStats.total} registros foram importados com sucesso.
                </p>
              </div>
            </div>
          </div>

          {/* Errors List */}
          {errors.length > 0 && (
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Erros Encontrados ({errors.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {errors.map((error, i) => (
                  <div key={i} className="flex gap-2 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg text-sm">
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800 dark:text-red-400">{error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={resetImport}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Nova Importação
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
