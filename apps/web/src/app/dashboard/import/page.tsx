'use client';

import { useState } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, ArrowRight, FileText, Users, Wrench, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { importApi, EntityType, ImportPreview, ImportResult } from '@/lib/api/import';

type EntityTypeLocal = EntityType;

interface ImportStats {
  total: number;
  success: number;
  errors: number;
  warnings: number;
}

export default function ImportPage() {
  const [selectedEntity, setSelectedEntity] = useState<EntityTypeLocal | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [editedData, setEditedData] = useState<any[]>([]);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const entities = [
    {
      type: 'customers' as EntityTypeLocal,
      name: 'Clientes',
      description: 'Importe sua base de clientes com contatos e endereços',
      icon: Users,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
      fields: ['nome', 'email', 'telefone', 'documento', 'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'cep'],
    },
    {
      type: 'services' as EntityTypeLocal,
      name: 'Serviços',
      description: 'Catálogo de serviços e preços',
      icon: Wrench,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30',
      fields: ['nome', 'descricao', 'preco', 'unidade', 'categoria', 'tempo_estimado', 'garantia'],
    },
    {
      type: 'suppliers' as EntityTypeLocal,
      name: 'Fornecedores',
      description: 'Base de fornecedores e parceiros',
      icon: Building2,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30',
      fields: ['razao_social', 'nome_fantasia', 'cnpj', 'email', 'telefone', 'contato', 'endereco'],
    },
    {
      type: 'products' as EntityTypeLocal,
      name: 'Produtos',
      description: 'Estoque e produtos para venda',
      icon: FileText,
      color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
      fields: ['nome', 'codigo', 'preco_compra', 'preco_venda', 'estoque', 'fornecedor', 'categoria'],
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

      const result = await importApi.analyze(file, selectedEntity);
      setPreview(result);
      setEditedData(result.data); // Copiar dados para edição

      if (result.validationErrors.length > 0) {
        toast.success(`Arquivo analisado! ${result.validationErrors.length} linha(s) precisam de correção.`);
      } else {
        toast.success('Arquivo analisado com sucesso!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao analisar arquivo');
    } finally {
      setUploading(false);
    }
  };

  const handleCellEdit = (rowIndex: number, column: string, value: string) => {
    const newData = [...editedData];
    newData[rowIndex] = { ...newData[rowIndex], [column]: value };
    setEditedData(newData);
  };

  const createFileFromEditedData = (): File => {
    // Criar CSV a partir dos dados editados
    const headers = preview!.columns.join(',');
    const rows = editedData.map(row =>
      preview!.columns.map(col => {
        const value = row[col] || '';
        // Escapar valores com vírgula ou aspas
        if (value.toString().includes(',') || value.toString().includes('"')) {
          return `"${value.toString().replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    return new File([blob], file!.name, { type: 'text/csv' });
  };

  const executeImport = async () => {
    if (!file || !selectedEntity || !preview) return;

    try {
      setImporting(true);
      setShowConfirmDialog(false);

      // Criar novo arquivo a partir dos dados editados
      const editedFile = createFileFromEditedData();

      const result = await importApi.execute(editedFile, selectedEntity);

      setImportStats({
        total: result.total,
        success: result.success,
        errors: result.errors,
        warnings: result.warnings,
      });

      setErrors(result.errorDetails.map(e => `Linha ${e.row}: ${e.error}`));

      if (result.success > 0) {
        toast.success(`${result.success} registro(s) importado(s) com sucesso!`);
      } else {
        toast.error('Nenhum registro foi importado');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao importar dados');
    } finally {
      setImporting(false);
    }
  };

  const handleImport = async () => {
    if (!file || !selectedEntity || !preview) return;

    // Verificar se há erros de estrutura (bloqueiam importação)
    const structureErrors = preview.validationErrors.filter(e => e.row === 0);
    if (structureErrors.length > 0) {
      toast.error('Corrija os erros de estrutura antes de importar');
      return;
    }

    // Verificar se há erros de dados (não bloqueiam, mas confirmam)
    const dataErrors = preview.validationErrors.filter(e => e.row !== 0);
    if (dataErrors.length > 0) {
      // Mostrar dialog de confirmação
      setShowConfirmDialog(true);
    } else {
      // Sem erros, importar diretamente
      await executeImport();
    }
  };

  const resetImport = () => {
    setSelectedEntity(null);
    setFile(null);
    setPreview(null);
    setEditedData([]);
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

              {file && !preview && (
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
          {preview && (
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    4
                  </div>
                  <h2 className="text-xl font-semibold">Pré-visualização e Edição</h2>
                </div>
                <span className="text-sm text-muted-foreground">
                  {preview.totalRows} registros encontrados
                </span>
              </div>

              {/* Info sobre edição */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  💡 <strong>Dica:</strong> Você pode editar os dados diretamente na tabela abaixo antes de importar!
                </p>
              </div>

              {/* Validation Errors */}
              {preview.validationErrors.length > 0 && (
                <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg">
                  <h4 className="font-semibold text-amber-900 dark:text-amber-400 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Atenção - Corrija os dados abaixo ({preview.validationErrors.length})
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {preview.validationErrors.map((error, i) => (
                      <p key={i} className="text-sm text-amber-800 dark:text-amber-400">
                        {error.row === 0 ? '📋 Estrutura' : `📝 Linha ${error.row}`}: {error.error}
                      </p>
                    ))}
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-500 mt-2">
                    Edite as células com problemas diretamente na tabela abaixo.
                  </p>
                </div>
              )}

              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-2 font-medium sticky left-0 bg-muted/50">#</th>
                      {preview.columns.map((col) => (
                        <th key={col} className="text-left p-2 font-medium capitalize min-w-[150px]">
                          {col.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {editedData.map((row, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-2 text-muted-foreground font-medium sticky left-0 bg-card">{i + 1}</td>
                        {preview.columns.map((col) => (
                          <td key={col} className="p-1">
                            <input
                              type="text"
                              value={row[col] || ''}
                              onChange={(e) => handleCellEdit(i, col, e.target.value)}
                              className="w-full px-2 py-1 text-sm rounded border border-input bg-background hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                              placeholder={`Digite ${col}...`}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {preview.data.length < preview.totalRows && (
                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-center">
                    ✏️ Mostrando primeiras <strong>{preview.data.length}</strong> linhas de <strong>{preview.totalRows}</strong> total.
                    As demais linhas serão importadas se estiverem válidas.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditedData(preview.data);
                    toast.success('Dados restaurados para o original');
                  }}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Restaurar Original
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing || preview.validationErrors.some(e => e.row === 0)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {importing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {preview.validationErrors.filter(e => e.row !== 0).length > 0
                        ? `Revisar e Importar ${preview.totalRows} Registros`
                        : `Importar ${preview.totalRows} Registros`}
                    </>
                  )}
                </button>
              </div>

              {preview.validationErrors.some(e => e.row === 0) && (
                <p className="text-sm text-destructive mt-2 text-center">
                  ⚠️ Corrija os erros de estrutura antes de importar
                </p>
              )}
              {preview.validationErrors.filter(e => e.row !== 0).length > 0 && !preview.validationErrors.some(e => e.row === 0) && (
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 text-center">
                  ℹ️ Há avisos de validação - você poderá escolher importar mesmo assim
                </p>
              )}
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

      {/* Confirmation Dialog */}
      {showConfirmDialog && preview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border max-w-md w-full p-6 shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Dados com Possíveis Problemas
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Encontramos <strong>{preview.validationErrors.filter(e => e.row !== 0).length} linha(s)</strong> com avisos de validação.
                </p>
                <p className="text-sm text-muted-foreground">
                  O sistema tentará importar todas as linhas. Linhas com erros serão ignoradas e reportadas no final.
                </p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg p-3 mb-4 max-h-32 overflow-y-auto">
              <p className="text-xs font-medium text-amber-900 dark:text-amber-400 mb-2">
                Exemplos de avisos:
              </p>
              <div className="space-y-1">
                {preview.validationErrors.filter(e => e.row !== 0).slice(0, 3).map((error, i) => (
                  <p key={i} className="text-xs text-amber-800 dark:text-amber-400">
                    • Linha {error.row}: {error.error}
                  </p>
                ))}
                {preview.validationErrors.filter(e => e.row !== 0).length > 3 && (
                  <p className="text-xs text-amber-700 dark:text-amber-500 italic">
                    ... e mais {preview.validationErrors.filter(e => e.row !== 0).length - 3} aviso(s)
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                ✏️ Voltar e Editar
              </button>
              <button
                onClick={executeImport}
                disabled={importing}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors font-medium"
              >
                {importing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Importando...
                  </span>
                ) : (
                  '✅ Importar Mesmo Assim'
                )}
              </button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-3">
              💡 Apenas linhas válidas serão importadas
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
