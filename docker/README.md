# Docker Setup

Este diretório contém as configurações do Docker para o ambiente de desenvolvimento.

## Serviços

O `docker-compose.yml` na raiz do projeto configura os seguintes serviços:

### PostgreSQL (porta 5432)
- **Imagem**: postgres:15-alpine
- **Usuário**: solid_service
- **Senha**: solid_service_dev
- **Database**: solid_service
- **Volume**: postgres_data

### Redis (porta 6379)
- **Imagem**: redis:7-alpine
- **Uso**: Cache e filas (BullMQ)
- **Volume**: redis_data

### MinIO (portas 9000 e 9001)
- **Imagem**: minio/minio:latest
- **Porta API**: 9000
- **Porta Console**: 9001
- **Usuário**: minioadmin
- **Senha**: minioadmin
- **Bucket**: solid-service
- **Volume**: minio_data

## Comandos

### Iniciar todos os serviços
```bash
docker-compose up -d
```

### Ver logs
```bash
docker-compose logs -f
```

### Parar todos os serviços
```bash
docker-compose down
```

### Parar e remover volumes (CUIDADO: deleta dados!)
```bash
docker-compose down -v
```

### Verificar status
```bash
docker-compose ps
```

## Acessar Consoles

### PostgreSQL
```bash
docker exec -it solid-service-postgres psql -U solid_service -d solid_service
```

### Redis CLI
```bash
docker exec -it solid-service-redis redis-cli
```

### MinIO Console
Abra no navegador: http://localhost:9001
- Usuário: minioadmin
- Senha: minioadmin

## Variáveis de Ambiente

Após iniciar os containers, configure o `.env` do projeto:

```env
DATABASE_URL="postgresql://solid_service:solid_service_dev@localhost:5432/solid_service?schema=public"
REDIS_URL="redis://localhost:6379"
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_BUCKET="solid-service"
```

## Troubleshooting

### PostgreSQL não inicia
```bash
# Verificar logs
docker-compose logs postgres

# Reiniciar container
docker-compose restart postgres
```

### MinIO não cria bucket
```bash
# Recriar bucket manualmente
docker exec -it solid-service-minio mc mb /data/solid-service
```

### Limpar tudo e recomeçar
```bash
docker-compose down -v
docker-compose up -d
```
