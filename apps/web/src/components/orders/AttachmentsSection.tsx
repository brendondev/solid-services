'use client';

import { useState, useRef } from 'react';
import { ordersApi, Attachment } from '@/lib/api/orders';
import {
  Upload,
  File,
  Image,
  FileText,
  Download,
  Trash2,
  Loader2,
  X,
  AlertCircle,
} from 'lucide-react';

interface AttachmentsSectionProps {
  orderId: string;
  attachments: Attachment[];
  onAttachmentsChange: () => void;
}

export function AttachmentsSection({
  orderId,
  attachments,
  onAttachmentsChange,
}: AttachmentsSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validação de tamanho (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }

    // Extensões permitidas
    const allowedExtensions = [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'pdf',
      'doc',
      'docx',
      'xls',
      'xlsx',
      'txt',
      'zip',
      'rar',
    ];
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      setError(
        'Tipo de arquivo não permitido. Permitidos: ' +
          allowedExtensions.join(', ')
      );
      return;
    }

    try {
      setUploading(true);
      setError('');
      setUploadProgress(0);

      await ordersApi.uploadAttachment(orderId, file, undefined, (progress) => {
        setUploadProgress(progress);
      });

      onAttachmentsChange();

      // Reset
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      const { url } = await ordersApi.getAttachmentDownloadUrl(
        orderId,
        attachment.id
      );
      window.open(url, '_blank');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao baixar arquivo');
    }
  };

  const handleDelete = async (attachment: Attachment) => {
    if (!confirm(`Tem certeza que deseja excluir "${attachment.fileName}"?`)) {
      return;
    }

    try {
      await ordersApi.deleteAttachment(orderId, attachment.id);
      onAttachmentsChange();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir arquivo');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.includes('pdf')) return FileText;
    return File;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Anexos</h2>
        <span className="text-sm text-muted-foreground">
          {attachments.length} arquivo(s)
        </span>
      </div>

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">
                Enviando arquivo...
              </p>
              <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline font-medium"
              >
                Clique para selecionar
              </button>
              <span className="text-muted-foreground"> ou arraste um arquivo aqui</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Máximo 10MB • JPG, PNG, PDF, DOC, XLS, ZIP
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError('')}
            className="text-destructive hover:text-destructive/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Attachments List */}
      {attachments.length > 0 ? (
        <div className="mt-6 space-y-2">
          {attachments.map((attachment) => {
            const FileIcon = getFileIcon(attachment.mimeType);
            return (
              <div
                key={attachment.id}
                className="flex items-center gap-4 p-4 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border transition-colors group"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileIcon className="w-5 h-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.fileSize)} •{' '}
                    {new Date(attachment.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDownload(attachment)}
                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Baixar"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(attachment)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 text-center py-8">
          <File className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Nenhum anexo adicionado</p>
        </div>
      )}
    </div>
  );
}
