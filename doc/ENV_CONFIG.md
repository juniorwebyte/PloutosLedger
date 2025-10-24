# Configuração de Variáveis de Ambiente para Vite

## Variáveis de Ambiente

Para configurar o sistema de demo com WhatsApp, você pode criar um arquivo `.env` na raiz do projeto:

```bash
# Chave da API CallMeBot
VITE_CALLMEBOT_API_KEY=sua_chave_aqui

# Número do WhatsApp do administrador (com código do país)
VITE_ADMIN_PHONE=5511999999999
```

## Como Funciona

O Vite usa `import.meta.env` em vez de `process.env` para variáveis de ambiente no frontend.

### Variáveis Disponíveis:
- `import.meta.env.DEV` - true em desenvolvimento
- `import.meta.env.PROD` - true em produção
- `import.meta.env.VITE_CALLMEBOT_API_KEY` - sua chave da API
- `import.meta.env.VITE_ADMIN_PHONE` - seu número do WhatsApp

## Configuração Padrão

Se as variáveis não estiverem definidas, o sistema usa valores padrão:
- API Key: 'YOUR_API_KEY'
- Admin Phone: '5511999999999'

## Para Produção

1. Crie o arquivo `.env` com suas chaves reais
2. Configure as variáveis no seu servidor de produção
3. Teste a integração antes do deploy
