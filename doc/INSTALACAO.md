# 📋 Instruções de Instalação - Sistema de Movimento de Caixa

## 🚨 IMPORTANTE: Pré-requisitos

Antes de usar o sistema, você **DEVE** instalar o Node.js no seu computador.

## 📥 Passo 1: Instalar Node.js

### Opção A: Download Direto (Recomendado)
1. Acesse: https://nodejs.org/
2. Baixe a versão **LTS** (Long Term Support) - versão 18 ou superior
3. Execute o instalador e siga as instruções
4. **IMPORTANTE**: Durante a instalação, marque a opção "Add to PATH"

### Opção B: Chocolatey (Windows)
```powershell
# Abra o PowerShell como administrador
choco install nodejs
```

### Opção C: Winget (Windows 10/11)
```powershell
winget install OpenJS.NodeJS
```

## ✅ Passo 2: Verificar Instalação

Após a instalação, **REINICIE** o terminal/PowerShell e execute:

```bash
node --version
npm --version
```

Você deve ver algo como:
```
v18.17.0
9.6.7
```

## 🚀 Passo 3: Instalar Dependências

1. Abra o terminal/PowerShell na pasta do projeto
2. Execute:
```bash
npm install
```

## 🎯 Passo 4: Iniciar o Sistema

```bash
npm run dev
```

## 🆘 Solução de Problemas

### Problema: "npm não é reconhecido"
**Causa**: Node.js não foi adicionado ao PATH
**Solução**: 
1. Reinstale o Node.js marcando "Add to PATH"
2. Reinicie o computador
3. Abra um NOVO terminal

### Problema: "node não é reconhecido"
**Causa**: Node.js não foi instalado corretamente
**Solução**: 
1. Desinstale o Node.js pelo Painel de Controle
2. Baixe novamente do site oficial
3. Execute como administrador

### Problema: Erro de permissão
**Solução**: Execute o terminal como administrador

## 📱 Acesso ao Sistema

Após iniciar com `npm run dev`:
1. Abra o navegador
2. Acesse: `http://localhost:5173/`
3. Login: **Admin** / **Admin**

## 🖨️ Configuração da Impressora

1. Conecte a impressora EPSON via USB
2. Instale os drivers da impressora
3. Configure como impressora padrão (opcional)
4. Teste a impressão no sistema

## 📞 Suporte

Se ainda tiver problemas:
- Email: suporte@webyte.com.br
- Telefone: (11) 9999-9999

---

**Desenvolvido por: Webyte | Tecnologia Laravel**  
**© 2025 - Todos os direitos reservados**
