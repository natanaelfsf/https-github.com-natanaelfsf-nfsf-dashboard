# NFSF Dashboard - Custos Mensais de Tráfego Pago

Dashboard web estilo software de consulta para gerenciamento de custos e performance de campanhas de tráfego pago (Meta Ads).

## Características
- Login de Administrador e Clientes
- Importação de exportações CSV do Meta Ads Manager
- Relatórios de custos, impressões, cliques, CTR, CPC
- Visualização mobile-friendly (responsivo)
- Branding com logo NFSF / Natanael Figueiredo
- Dados salvos localmente no navegador (localStorage)
- Geração de visões para envio de acesso aos clientes

## Acesso Padrão
- **Administrador**: usuário `admin` / senha `nfsf2026`
- **Cliente exemplo**: usuário `cliente` / senha `cliente123`

## Como usar
1. Abra o arquivo `index.html` no navegador (Chrome, Safari, Firefox, etc.).
2. Faça login como admin.
3. Cadastre clientes (nome, usuário e senha de acesso).
4. No Meta Ads Manager, exporte o relatório desejado como CSV (recomendado: nível de Campanha ou Anúncio, com colunas de Amount spent, Impressions, Link clicks, Results, etc.).
5. Na aba "Importar Meta", selecione o cliente, o mês e faça upload do CSV.
6. Clientes podem fazer login com as credenciais fornecidas e visualizar seus custos e interações.
7. Compartilhe o login/senha com o cliente para acesso aos relatórios.

## Notas
- Funciona offline após o carregamento inicial.
- Dados ficam armazenados apenas no dispositivo/navegador usado. Para uso em equipe ou multi-dispositivo, considere migrar para um backend (Firebase, Supabase, etc.).
- Formato otimizado para celular e desktop.
- Logo e identidade visual baseadas no padrão NFSF.

## Contato
Natanael Figueiredo  
TI | Marketing Digital | Consultoria e Vendas  
Instagram: @figueiredo.natanael  
WhatsApp: (92) 98492-5493

---
Desenvolvido como solução de consulta e relatórios de tráfego pago.
