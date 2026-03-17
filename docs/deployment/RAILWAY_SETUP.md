# Railway - Configuração S3

## Variáveis S3 no Railway

### 1. Acesse o Railway
```
https://railway.app → seu projeto → service "api" → Variables
```

### 2. Adicione as Variáveis

O Railway pode criar automaticamente com prefixo `AWS_*`:
```env
AWS_ENDPOINT_URL=${{recorded-tupperware.ENDPOINT}}
AWS_DEFAULT_REGION=${{recorded-tupperware.REGION}}
AWS_S3_BUCKET_NAME=${{recorded-tupperware.BUCKET}}
AWS_ACCESS_KEY_ID=${{recorded-tupperware.ACCESS_KEY_ID}}
AWS_SECRET_ACCESS_KEY=${{recorded-tupperware.SECRET_ACCESS_KEY}}
```

Ou manualmente com prefixo `S3_*`:
```env
S3_ENDPOINT=https://t3.storageapi.dev
S3_REGION=us-east-1
S3_BUCKET=seu-bucket
S3_ACCESS_KEY_ID=tid_xxx
S3_SECRET_ACCESS_KEY=tsec_xxx
```

**Nota**: O sistema aceita AMBOS os formatos!

### 3. Verificar Logs

Após redeploy, procure por:
```
✅ Storage inicializado: MinIO/T3 - bucket: seu-bucket
```

Veja [DEPLOYMENT.md](./DEPLOYMENT.md) para guia completo.
