# Café Aurora

Sistema de pedidos para cafeteria, com frontend HTML/CSS/JavaScript e backend Spring Boot 3.5 + Java 17 + MySQL.

## Como executar
1. Instale Java 17+ e Maven 3.9+ e inicie o MySQL.
2. Crie o banco `cafe_aurora` ou deixe a URL JDBC criar o banco (requer permissões).
3. Configure variáveis de ambiente:
   - `DB_URL` (padrão: `jdbc:mysql://localhost:3306/cafe_aurora?createDatabaseIfNotExist=true`)
   - `DB_USER` (padrão: `root`)
   - `DB_PASSWORD` (senha do MySQL)
   - `ADMIN_EMAIL` e `ADMIN_PASSWORD` (opcionais, ambos necessários, senha com 12+ caracteres).
4. Execute `mvn spring-boot:run`.
5. Abra `http://localhost:8080/`. Não abra os HTML via `file://` nem use servidor estático isolado: a API precisa estar ativa.
6. Execute `mvn test` para testes automatizados com H2.

## Acesso administrativo
Se definir `ADMIN_EMAIL` e `ADMIN_PASSWORD` **antes da primeira inicialização**, a aplicação cria uma conta de administrador quando esse e-mail não estiver cadastrado. Não coloque senhas no Git. A conta administrativa abre `administrativo.html` após o login.

## Fluxo
- Conta criada via API; senha protegida com BCrypt e sessão HttpOnly.
- O cardápio é carregado do MySQL, com os 20 produtos iniciais cadastrados na primeira inicialização.
- O carrinho mantém somente dados para navegação no browser; preço e total são recalculados no servidor ao confirmar.
- Histórico de pedidos é vinculado à conta. O administrador acessa todos os pedidos e altera os estados: PENDENTE → EM_ATENDIMENTO → FINALIZADO.
- CSRF é exigido em operações de escrita. O frontend chama `/api/auth/csrf` e envia `X-XSRF-TOKEN`.

## Limitações atuais
- Os botões PIX/cartão/dinheiro **registram a preferência de pagamento** e não processam uma cobrança real. Não colete dados de cartão.
- Não há envio automático de e-mails.
- O banco ainda usa `ddl-auto=update` para desenvolvimento; para produção, use migrations (Flyway), HTTPS, política de privacidade revisada, backup e monitoração.
- Contas e pedidos do antigo localStorage são dados de protótipo e **não foram importados**. Faça novos cadastros e não reutilize senhas antigas.
- Para deploy, configurar `server.servlet.session.cookie.secure=true` sob HTTPS.

## Arquitetura
`src/main/java/com/cafeaurora`: entidades, repositories, services, controllers e configuração de segurança.
`static/js`: camada cliente da API e interfaces. Os HTML e estilos permanecem na raiz por compatibilidade.

## Observação
O deploy é opcional; esta branch não altera a branch main sem merge. 
