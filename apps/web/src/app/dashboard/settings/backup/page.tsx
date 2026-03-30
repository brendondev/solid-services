'use client';

import { useState } from 'react';
import { Database, Download, Upload, Calendar, HardDrive, CheckCircle2, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Backup {
  id: string;
  date: string;
  size: string;
  type: 'auto' | 'manual';
  status: 'completed' | 'in_progress' | 'failed';
}

export default function BackupSettingsPage() {
  const [creating, setCreating] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [retentionDays, setRetentionDays] = useState(30);

  const backups: Backup[] = [
    { id: '1', date: '2024-03-30 14:30', size: '145 MB', type: 'manual', status: 'completed' },
    { id: '2', date: '2024-03-29 03:00', size: '142 MB', type: 'auto', status: 'completed' },
    { id: '3', date: '2024-03-28 03:00', size: '138 MB', type: 'auto', status: 'completed' },
    { id: '4', date: '2024-03-27 03:00', size: '136 MB', type: 'auto', status: 'completed' },
    { id: '5', date: '2024-03-26 03:00', size: '134 MB', type: 'auto', status: 'completed' },
  ];

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      toast.loading('Criando backup...');

      // TODO: Chamar API
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast.dismiss();
      toast.success('Backup criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar backup');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = (backupId: string) => {
    toast.success('Iniciando download do backup...');
  };

  const handleDelete = (backupId: string) => {
    if (confirm('Deseja realmente excluir este backup?')) {
      toast.success('Backup excluído!');
    }
  };

  const handleRestore = (backupId: string) => {
    if (confirm('Deseja restaurar este backup? Todos os dados atuais serão substituídos. Esta ação não pode ser desfeita.')) {
      toast.loading('Restaurando backup...');
      setTimeout(() => {
        toast.dismiss();
        toast.success('Backup restaurado com sucesso!');
      }, 3000);
    }
  };

  const handleExportData = (format: 'json' | 'csv' | 'xlsx') => {
    toast.success(`Exportando dados em formato ${format.toUpperCase()}...`);
  };

  const handleImportData = () => {
    document.getElementById('import-file')?.click();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Database className="w-8 h-8" />
          Backup e Dados
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie backups e exporte seus dados
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Backups</p>
              <p className="text-2xl font-bold">{backups.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Último Backup</p>
              <p className="text-2xl font-bold">Hoje</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <HardDrive className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Espaço Usado</p>
              <p className="text-2xl font-bold">695 MB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Auto Backup Settings */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Backup Automático</h3>
              <p className="text-sm text-muted-foreground">
                Configure backups periódicos automáticos
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoBackupEnabled}
              onChange={(e) => setAutoBackupEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
          </label>
        </div>

        {autoBackupEnabled && (
          <div className="space-y-4 pl-11">
            <div>
              <label className="block text-sm font-medium mb-2">
                Frequência
              </label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 flex-1">
                  <input
                    type="radio"
                    value="daily"
                    checked={backupFrequency === 'daily'}
                    onChange={() => setBackupFrequency('daily')}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium">Diário</p>
                    <p className="text-xs text-muted-foreground">Todo dia às 3:00 AM</p>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 flex-1">
                  <input
                    type="radio"
                    value="weekly"
                    checked={backupFrequency === 'weekly'}
                    onChange={() => setBackupFrequency('weekly')}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium">Semanal</p>
                    <p className="text-xs text-muted-foreground">Domingos às 3:00 AM</p>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 flex-1">
                  <input
                    type="radio"
                    value="monthly"
                    checked={backupFrequency === 'monthly'}
                    onChange={() => setBackupFrequency('monthly')}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium">Mensal</p>
                    <p className="text-xs text-muted-foreground">Dia 1 às 3:00 AM</p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Retenção de Backups (dias)
              </label>
              <input
                type="number"
                value={retentionDays}
                onChange={(e) => setRetentionDays(Number(e.target.value))}
                min={7}
                max={365}
                className="w-full max-w-xs px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Backups mais antigos serão excluídos automaticamente
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Manual Backup */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Backup Manual</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Crie um backup completo agora
            </p>
          </div>

          <button
            onClick={handleCreateBackup}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                Criar Backup
              </>
            )}
          </button>
        </div>
      </div>

      {/* Backup History */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold mb-4">Histórico de Backups</h3>

        <div className="space-y-2">
          {backups.map((backup) => (
            <div
              key={backup.id}
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${
                  backup.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                  backup.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {backup.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                  {backup.status === 'in_progress' && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
                  {backup.status === 'failed' && <AlertCircle className="w-5 h-5 text-red-600" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{backup.date}</p>
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      backup.type === 'auto'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}>
                      {backup.type === 'auto' ? 'Automático' : 'Manual'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tamanho: {backup.size}
                  </p>
                </div>
              </div>

              {backup.status === 'completed' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(backup.id)}
                    className="p-2 hover:bg-background rounded-lg transition-colors"
                    title="Baixar"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRestore(backup.id)}
                    className="px-3 py-1 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
                  >
                    Restaurar
                  </button>
                  <button
                    onClick={() => handleDelete(backup.id)}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Export/Import Data */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold mb-4">Exportar e Importar Dados</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar Dados
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Baixe seus dados em diferentes formatos
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleExportData('json')}
                className="w-full flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <span className="font-medium">JSON</span>
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleExportData('csv')}
                className="w-full flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <span className="font-medium">CSV</span>
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleExportData('xlsx')}
                className="w-full flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <span className="font-medium">Excel (XLSX)</span>
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Import */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Importar Dados
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Importe dados de outros sistemas
            </p>

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
              onClick={handleImportData}
            >
              <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium mb-1">Clique para selecionar arquivo</p>
              <p className="text-sm text-muted-foreground">
                JSON, CSV ou XLSX
              </p>
              <input
                id="import-file"
                type="file"
                accept=".json,.csv,.xlsx"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    toast.success(`Importando ${e.target.files[0].name}...`);
                  }
                }}
              />
            </div>

            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  A importação pode sobrescrever dados existentes. Faça um backup antes de importar.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-red-900 dark:text-red-400 mb-1">
              Atenção
            </h4>
            <p className="text-sm text-red-800 dark:text-red-400/80">
              Restaurar um backup substituirá todos os dados atuais. Esta ação não pode ser desfeita.
              Certifique-se de criar um backup antes de restaurar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
