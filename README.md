# Café Aurora

Sistema de cafeteria com frontend HTML/CSS/JavaScript e backend Spring Boot 3.5 (Java 17) + MySQL.

## Executar

1. Instale Java 17 ou superior, Maven 3.9+ e MySQL.
2. Configure as variáveis de ambiente `DB_USER` e `DB_PASSWORD`. Se necessário, ajuste `DB_URL` (padrão: `jdbc:mysql://localhost:3306/cafe_aurora?createDatabaseIfNotExist=true`).
3. Configure `ADMIN_EMAIL` e `ADMIN_PASSWORD` (senha com 12+ caracteres) antes da primeira execução para criar o administrador.
4. Execute `mvn clean test`, depois `mvn spring-boot:run`.
5. Abra `http://localhost:8080/`. Não abra os HTML diretamente: a aplicação exige API e banco ativo.

## Dois modos de execução

**1. GitHub Pages (demonstração estática):** abra `https://rafaelxn.github.io/cafe-aurora-site/`.
O cardápio, cadastro de teste, carrinho, pedidos simulados e painel administrativo são demonstrativos; os dados são salvos somente no navegador. Não existe backend no GitHub Pages, os pedidos não são enviados à cafeteria, não há pagamento real e **as senhas digitadas não são verificadas nem armazenadas**. Use apenas dados fictícios.

Para experimentar o painel, entre com `admin@demo.local` e uma senha de teste qualquer. Essa conta é exclusivamente para demonstração local, não equivale a uma conta administrativa segura.

**2. Aplicação completa (Spring Boot + MySQL):** configure o banco e execute `mvn spring-boot:run`, acessando `http://localhost:8080/`. Nesse ambiente, o frontend usa `/api/**` e a autenticação real com sessão e BCrypt, e os pedidos são persistidos no MySQL. Para publicar o sistema completo, hospede o backend em servidor próprio (GitHub Pages não executa Java).

Os dois modos usam as mesmas páginas HTML; o adaptador `static/js/demo-api.js` só é ativado em endereços `.github.io` ou na abertura local via `file://`. O backend Spring Boot continua sendo a fonte oficial para uso real.

## Funcionalidades
- Cadastro e login no servidor, BCrypt, sessão HttpOnly, CSRF e perfis CLIENTE/ADMIN.
- Cardápio cadastrado no MySQL ao iniciar com banco vazio.
- Carrinho no navegador; a API valida quantidades e calcula os totais com preços do banco.
- Histórico do próprio cliente e painel administrativo com estados PENDENTE → EM_ATENDIMENTO → FINALIZADO.
- Testes de integração com H2, incluindo acesso aos arquivos estáticos, permissões e validação de pedidos.
- Estrutura e indentação padronizadas com `.editorconfig`.

## Importante

O método de pagamento é apenas uma preferência informada, **não cobra dinheiro** e não realiza PIX ou pagamento por cartão. Não há envio de e-mails. Não reutilize dados antigos de `localStorage`: cadastro e pedidos devem ser recriados no MySQL.

Para produção, use HTTPS, backups, autenticação e monitoramento revisados, política de privacidade apropriada e migrações de esquema (Flyway/Liquibase). `DDL_AUTO=update` é configuração de desenvolvimento, não de produção.

A nova API **não substitui** outra API anterior automaticamente. Caso você possua backend separado, avalie a migração antes do merge.

## Endpoints
- `GET /api/products`: catálogo público.
- `GET /api/auth/csrf`: token CSRF.
- `POST /api/auth/register`: cadastro.
- `POST /api/auth/login`: login.
- `POST /api/auth/logout`: logout.
- `GET /api/auth/me`: perfil autenticado.
- `GET /api/orders`, `POST /api/orders`: pedidos do cliente.
- `GET /api/admin/orders`, `PATCH /api/admin/orders/{id}/status`: administração.

Para as operações de escrita, envie o token obtido em `/api/auth/csrf` no cabeçalho `X-XSRF-TOKEN` e mantenha o cookie de sessão.
