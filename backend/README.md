# MINSK Art Backend API

Backend em Python com FastAPI, SQLite e armazenamento local de imagens para o site de arte da MINSK.

## 🚀 Características

- **FastAPI** - Framework web moderno e rápido
- **SQLite** - Banco de dados leve e sem configuração
- **Armazenamento Local** - Imagens salvas localmente no servidor
- **Autenticação JWT** - Sistema de login seguro
- **Upload de Arquivos** - Suporte para upload de imagens
- **CORS** - Configurado para funcionar com frontend React
- **Documentação Automática** - Swagger UI integrado

## 📋 Pré-requisitos

- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)

## 🛠️ Instalação

1. **Navegue para o diretório do backend:**
   ```bash
   cd backend
   ```

2. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Inicialize o banco de dados:**
   ```bash
   python init_db.py
   ```

4. **Inicie o servidor:**
   ```bash
   python main.py
   ```

O servidor estará disponível em: `http://localhost:8000`

## 📚 Documentação da API

Após iniciar o servidor, acesse:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

## 🔑 Credenciais Padrão

Após executar `init_db.py`, será criado um usuário administrador:
- **Email:** `admin@minsk.art`
- **Senha:** `admin123`

⚠️ **IMPORTANTE:** Altere essas credenciais em produção!

## 📁 Estrutura do Projeto

```
backend/
├── main.py              # Aplicação principal FastAPI
├── database.py          # Configuração do banco SQLite
├── models.py            # Modelos SQLAlchemy
├── schemas.py           # Schemas Pydantic
├── config.py            # Configurações
├── init_db.py           # Script de inicialização
├── requirements.txt     # Dependências Python
├── routers/            # Rotas da API
│   ├── auth.py         # Autenticação
│   ├── commission.py   # Comissões
│   ├── portfolio.py    # Portfólio
│   └── settings.py     # Configurações
└── uploads/            # Arquivos enviados
    ├── portfolio/      # Imagens do portfólio
    ├── profiles/       # Fotos de perfil
    └── backgrounds/    # Imagens de fundo
```

## 🛣️ Endpoints Principais

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/me` - Usuário atual

### Comissões
- `GET /api/commissions` - Listar comissões
- `POST /api/commissions` - Criar comissão
- `PUT /api/commissions/{id}` - Atualizar comissão
- `DELETE /api/commissions/{id}` - Deletar comissão

### Portfólio
- `GET /api/portfolio` - Listar itens
- `POST /api/portfolio` - Criar item (com upload)
- `PUT /api/portfolio/{id}` - Atualizar item
- `DELETE /api/portfolio/{id}` - Deletar item

### Configurações
- `GET /api/settings` - Listar configurações
- `PUT /api/settings/{key}` - Atualizar configuração
- `POST /api/settings/background-image` - Upload de fundo
- `POST /api/settings/profile-image` - Upload de perfil

## 🗄️ Modelos de Dados

### CommissionRequest
```python
{
    "id": "uuid",
    "full_name": "string",
    "discord_id": "string", 
    "email": "string",
    "project_description": "text",
    "status": "pending|50_paid|100_paid|completed",
    "payment_status": "pending|50_paid|100_paid",
    "progress_status": "in_queue|waiting_payment|in_progress|completed",
    "file_reference": "string|null",
    "notes": "text|null",
    "created_at": "datetime",
    "updated_at": "datetime"
}
```

### PortfolioItem
```python
{
    "id": "uuid",
    "title": "string",
    "description": "text|null",
    "category": "string",
    "image_url": "string",
    "is_featured": "boolean",
    "created_at": "datetime",
    "updated_at": "datetime"
}
```

### SiteSetting
```python
{
    "id": "integer",
    "key": "string",
    "value": "text",
    "description": "text|null",
    "updated_at": "datetime"
}
```

## 🔧 Configuração

As configurações podem ser alteradas no arquivo `config.py`:

```python
class Settings:
    DATABASE_URL = "sqlite:///./database.db"
    SECRET_KEY = "sua-chave-secreta"
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    # ...
```

## 📤 Upload de Arquivos

### Limites de Tamanho
- **Portfólio:** 10MB
- **Perfil:** 5MB  
- **Fundo:** 20MB

### Formatos Suportados
- JPG/JPEG
- PNG
- GIF
- WebP

### Estrutura de Armazenamento
```
uploads/
├── portfolio/
│   └── {uuid}.{ext}
├── profiles/
│   └── profile_{uuid}.{ext}
└── backgrounds/
    └── background_{uuid}.{ext}
```

## 🔒 Autenticação

O sistema usa JWT (JSON Web Tokens) para autenticação:

1. **Login:** `POST /api/auth/login`
2. **Receber token:** Incluir no header `Authorization: Bearer {token}`
3. **Acesso protegido:** Rotas administrativas requerem role "admin"

## 🚦 Status Codes

- `200` - Sucesso
- `201` - Criado
- `400` - Erro de validação
- `401` - Não autorizado
- `403` - Sem permissão
- `404` - Não encontrado
- `500` - Erro interno

## 🧪 Testando a API

### Usando curl:
```bash
# Login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@minsk.art&password=admin123"

# Listar comissões
curl -X GET "http://localhost:8000/api/commissions" \
  -H "Authorization: Bearer {seu-token}"

# Upload de portfólio
curl -X POST "http://localhost:8000/api/portfolio" \
  -H "Authorization: Bearer {seu-token}" \
  -F "title=Minha Arte" \
  -F "description=Descrição da arte" \
  -F "category=Concept Art" \
  -F "image=@caminho/para/imagem.jpg"
```

## 🔄 Integração com Frontend

Para integrar com o frontend React, configure as chamadas da API:

```javascript
// Exemplo de configuração
const API_BASE_URL = 'http://localhost:8000/api';

// Login
const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `username=${email}&password=${password}`
  });
  return response.json();
};

// Listar portfólio
const getPortfolio = async () => {
  const response = await fetch(`${API_BASE_URL}/portfolio`);
  return response.json();
};
```

## 🐛 Solução de Problemas

### Erro de CORS
Verifique se o frontend está na lista de origens permitidas em `main.py`.

### Erro de Upload
Verifique se os diretórios `uploads/` têm permissões de escrita.

### Erro de Banco
Execute `python init_db.py` para recriar o banco.

### Porta em Uso
Altere a porta em `main.py` ou mate o processo:
```bash
# Linux/Mac
lsof -ti:8000 | xargs kill -9

# Windows
netstat -ano | findstr :8000
taskkill /PID {PID} /F
```

## 📝 Logs

Os logs são exibidos no console. Para logs em arquivo:

```python
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
```

## 🚀 Deploy em Produção

### Usando Gunicorn:
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Variáveis de Ambiente:
```bash
export SECRET_KEY="sua-chave-super-secreta"
export DATABASE_URL="sqlite:///./production.db"
```

### Nginx (opcional):
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /uploads/ {
        alias /caminho/para/uploads/;
    }
}
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação da API em `/docs`
2. Consulte os logs do servidor
3. Verifique se todas as dependências estão instaladas
4. Confirme se o banco foi inicializado corretamente

---

**Desenvolvido com ❤️ para MINSK Art**
