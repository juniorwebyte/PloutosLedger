# Configuração do Sistema de Demo com WhatsApp

## Variáveis de Ambiente

Para configurar o sistema de demo com WhatsApp, você precisa definir as seguintes variáveis de ambiente:

```bash
# Chave da API CallMeBot
REACT_APP_CALLMEBOT_API_KEY=sua_chave_aqui

# Número do WhatsApp do administrador (com código do país)
REACT_APP_ADMIN_PHONE=5511999999999

# Ambiente (development ou production)
NODE_ENV=development
```

## Configuração da API CallMeBot

1. **Acesse**: https://www.callmebot.com/
2. **Crie uma conta** e obtenha sua API Key
3. **Configure o número** do WhatsApp do administrador
4. **Teste a integração** antes de colocar em produção

## Como Funciona

### 1. Usuário Clica em "Testar Demo"
- Abre o formulário de cadastro
- Coleta dados: nome, email, telefone, empresa, cargo

### 2. Sistema Envia Código via WhatsApp
- Gera código de 6 dígitos
- Envia para o WhatsApp do usuário
- Envia notificação para o admin

### 3. Usuário Digita o Código
- Valida o código recebido
- Libera acesso à demo
- Salva dados do cliente

### 4. Admin Recebe Notificação
- Dados completos do cliente
- Código enviado
- Data/hora do acesso

## Mensagens Enviadas

### Para o Cliente:
```
🔐 *Código de Verificação - Sistema de Caixa*

Olá [Nome]!

Seu código de verificação é: *[CÓDIGO]*

Digite este código no sistema para acessar a demonstração.

Este código é válido por 10 minutos.

_Sistema de Caixa - Webyte_
```

### Para o Admin:
```
📊 *Novo Cliente Demo - Sistema de Caixa*

👤 *Cliente:* [Nome]
📧 *Email:* [Email]
📱 *Telefone:* [Telefone]
🏢 *Empresa:* [Empresa]
💼 *Cargo:* [Cargo]
🔐 *Código Enviado:* [Código]
⏰ *Data/Hora:* [Data/Hora]

_Sistema de Monitoramento - Webyte_
```

## Dados Armazenados

Os dados dos clientes são armazenados no localStorage com a seguinte estrutura:

```json
{
  "name": "string",
  "email": "string", 
  "phone": "string",
  "company": "string",
  "position": "string",
  "verificationCode": "string",
  "registeredAt": "ISO string",
  "status": "verified"
}
```

## Credenciais de Demo

Após o cadastro, o usuário recebe as credenciais:
- **Usuário**: `demo`
- **Senha**: `demo123`

## Monitoramento

O sistema permite monitorar:
- Quantos usuários acessaram a demo
- Dados de contato dos interessados
- Horários de acesso
- Empresas interessadas

## Segurança

- Códigos válidos por 10 minutos
- Validação de formato de email e telefone
- Dados armazenados localmente (em produção, usar banco de dados)
- API Key protegida por variáveis de ambiente
