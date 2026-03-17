# Configuração do Railway

## Variáveis de Ambiente para S3

Adicione as seguintes variáveis no Railway:

### 1. Acesse o Railway
1. Vá para https://railway.app
2. Selecione o projeto `solid-services`
3. Clique no service `api`
4. Vá em **Variables**

### 2. Adicione as Variáveis S3

Clique em **+ New Variable** e adicione cada uma:

```env
S3_ENDPOINT=https://t3.storageapi.dev
```

```env
S3_REGION=auto
```

```env
S3_BUCKET=recorded-tupperware-vdrvxr
```

```env
S3_ACCESS_KEY_ID=tid_iCEkNKGieAsygJszLGLMkTXRDpQkfEPoJFUKgJSIrSqbPGMEnC
```

```env
S3_SECRET_ACCESS_KEY=tsec_dHHxUDmRKV3wOL9NwOVwmieb-WJlcImcHVhklIC66E8WWa5lR_6Uaz94+jDEHHqa1pO5jK
```

### 3. Deploy

Após adicionar todas as variáveis:
1. Railway vai fazer **redeploy automático**
2. Aguarde ~2-3 minutos
3. Upload passará a usar S3 ao invés de storage local

### 4. Verificar Logs

Após o deploy, verifique nos logs:
```
[StorageService] Storage inicializado: MinIO - bucket: recorded-tupperware-vdrvxr
```

✅ Se ver essa mensagem, S3 está funcionando!
❌ Se ver "Usando armazenamento local", as variáveis não foram aplicadas.

## Alternativa Rápida (Via CLI)

Se você tem Railway CLI instalado:

```bash
railway variables set S3_ENDPOINT=https://t3.storageapi.dev
railway variables set S3_REGION=auto
railway variables set S3_BUCKET=recorded-tupperware-vdrvxr
railway variables set S3_ACCESS_KEY_ID=tid_iCEkNKGieAsygJszLGLMkTXRDpQkfEPoJFUKgJSIrSqbPGMEnC
railway variables set S3_SECRET_ACCESS_KEY=tsec_dHHxUDmRKV3wOL9NwOVwmieb-WJlcImcHVhklIC66E8WWa5lR_6Uaz94+jDEHHqa1pO5jK
```

## Benefícios do S3

Após configurar:
- ✅ Armazenamento externo (não usa disco do Railway)
- ✅ URLs assinadas para download (expiram em 1h)
- ✅ Melhor performance
- ✅ Escalável
- ✅ Arquivos persistem mesmo se Railway reiniciar

## Migração de Arquivos Locais

Se já tiver arquivos no storage local, você pode:
1. Baixar todos via endpoint `/storage/download/`
2. Re-upload via interface
3. Ou deixar como estão (continuarão funcionando)

## Troubleshooting

### Erro de Conexão S3
- Verifique se o endpoint está correto
- Teste credenciais em https://t3.storageapi.dev

### Upload ainda usa local
- Confira se todas as 5 variáveis estão definidas
- Faça redeploy manual se necessário
- Verifique logs para confirmar

### Download não funciona
- Pode levar alguns minutos para bucket ficar ativo
- Verifique permissões do bucket (deve permitir GET)
