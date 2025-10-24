# Configuração XAMPP - Sistema de Caixa

## 🚀 Guia de Configuração Completa

### 1. Download e Instalação do XAMPP

#### 1.1 Download
- Acesse: https://www.apachefriends.org/
- Baixe a versão mais recente para Windows
- Escolha a versão com PHP 8.x (recomendado)

#### 1.2 Instalação
1. Execute o instalador como administrador
2. Escolha os componentes:
   - ✅ Apache (obrigatório)
   - ✅ MySQL (opcional, para futuras funcionalidades)
   - ✅ PHP (opcional, para futuras funcionalidades)
   - ✅ phpMyAdmin (opcional)
3. Escolha o diretório de instalação: `C:\xampp\`
4. Complete a instalação

### 2. Configuração do Apache

#### 2.1 Iniciar Serviços
1. Abra o painel de controle do XAMPP
2. Clique em "Start" para Apache
3. Verifique se a porta 80 está livre
4. Se houver conflito, altere para porta 8080

#### 2.2 Configuração do DocumentRoot
1. No painel do XAMPP, clique em "Config" → "Apache (httpd.conf)"
2. Localize a linha `DocumentRoot` (aproximadamente linha 252)
3. Altere para:
```apache
DocumentRoot "C:/xampp/htdocs/movimento"
<Directory "C:/xampp/htdocs/movimento">
    Options Indexes FollowSymLinks MultiViews
    AllowOverride All
    Require all granted
</Directory>
```

#### 2.3 Configuração de Portas (se necessário)
Se a porta 80 estiver ocupada:
```apache
Listen 8080
ServerName localhost:8080
```

### 3. Deploy da Aplicação

#### 3.1 Preparar a Aplicação
```bash
# No diretório do projeto
npm run build
```

#### 3.2 Copiar para XAMPP
1. Crie a pasta: `C:\xampp\htdocs\movimento\`
2. Copie todo conteúdo da pasta `dist\` para `C:\xampp\htdocs\movimento\`
3. Estrutura final deve ser:
```
C:\xampp\htdocs\movimento\
├── index.html
├── assets\
│   ├── css\
│   ├── js\
│   └── ...
└── ...
```

#### 3.3 Arquivo .htaccess
Crie o arquivo `C:\xampp\htdocs\movimento\.htaccess`:
```apache
RewriteEngine On
RewriteBase /movimento/

# Se o arquivo/diretório não existir, redireciona para index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /movimento/index.html [L]

# Cache para arquivos estáticos
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
    Header set Cache-Control "public, immutable"
</FilesMatch>

# Compressão GZIP
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

### 4. Teste e Acesso

#### 4.1 URLs de Acesso
- **Porta 80**: `http://localhost/movimento/`
- **Porta 8080**: `http://localhost:8080/movimento/`

#### 4.2 Verificação
1. Abra o navegador
2. Acesse a URL correspondente
3. Verifique se a aplicação carrega
4. Teste todas as funcionalidades

### 5. Configurações Avançadas

#### 5.1 Virtual Host (Recomendado)
Crie o arquivo `C:\xampp\apache\conf\extra\httpd-vhosts.conf`:
```apache
<VirtualHost *:80>
    ServerName caixa.local
    DocumentRoot "C:/xampp/htdocs/movimento"
    
    <Directory "C:/xampp/htdocs/movimento">
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog "logs/caixa_error.log"
    CustomLog "logs/caixa_access.log" combined
</VirtualHost>
```

#### 5.2 Habilitar Virtual Host
No arquivo `httpd.conf`, descomente:
```apache
Include conf/extra/httpd-vhosts.conf
```

#### 5.3 Configurar Hosts (Windows)
Edite `C:\Windows\System32\drivers\etc\hosts`:
```
127.0.0.1 caixa.local
```

### 6. Solução de Problemas

#### 6.1 Erro 403 Forbidden
- Verifique permissões da pasta
- Confirme configuração do Directory
- Verifique se o .htaccess está correto

#### 6.2 Erro 404 Not Found
- Confirme se os arquivos foram copiados
- Verifique o DocumentRoot
- Teste com arquivo simples primeiro

#### 6.3 Erro de Porta
- Verifique se a porta não está ocupada
- Use `netstat -an | findstr :80` para verificar
- Altere para porta 8080 se necessário

#### 6.4 Aplicação não carrega
- Verifique o console do navegador (F12)
- Confirme se todos os assets foram copiados
- Teste com navegador diferente

### 7. Manutenção

#### 7.1 Atualizações
```bash
# 1. Faça backup da pasta atual
# 2. Execute npm run build
# 3. Substitua os arquivos
# 4. Teste a aplicação
```

#### 7.2 Logs
- **Apache**: `C:\xampp\apache\logs\`
- **Erro**: `error.log`
- **Acesso**: `access.log`

#### 7.3 Backup
- Faça backup regular da pasta `htdocs\movimento\`
- Mantenha versões anteriores
- Documente as mudanças

### 8. Segurança

#### 8.1 Configurações Recomendadas
```apache
# Desabilitar listagem de diretórios
Options -Indexes

# Ocultar versão do servidor
ServerTokens Prod
ServerSignature Off

# Limitar métodos HTTP
<LimitExcept GET POST>
    Deny from all
</LimitExcept>
```

#### 8.2 Firewall
- Configure o Windows Firewall para permitir XAMPP
- Ou desative temporariamente para testes

### 9. Performance

#### 9.1 Otimizações
- Ative compressão GZIP
- Configure cache para arquivos estáticos
- Use CDN para bibliotecas externas (se aplicável)

#### 9.2 Monitoramento
- Use o painel do XAMPP para monitorar recursos
- Verifique logs regularmente
- Monitore uso de memória e CPU

---

## ✅ Checklist de Configuração

- [ ] XAMPP instalado e funcionando
- [ ] Apache iniciado na porta correta
- [ ] DocumentRoot configurado
- [ ] Aplicação copiada para htdocs
- [ ] Arquivo .htaccess criado
- [ ] Aplicação acessível via navegador
- [ ] Todas as funcionalidades testadas
- [ ] Logs configurados
- [ ] Backup realizado
- [ ] Documentação atualizada

---

**Configuração XAMPP - Sistema de Caixa**  
*Guia completo para deploy e manutenção*
