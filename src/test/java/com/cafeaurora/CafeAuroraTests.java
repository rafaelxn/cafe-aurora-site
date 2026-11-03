package com.cafeaurora;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThan;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CafeAuroraTests {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private UserRepository users;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private OrderService orderService;

    @Test
    void publicAssetsAndCatalogAreAvailable() throws Exception {
        mvc.perform(get("/index.html")).andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Aurora")));
        mvc.perform(get("/js/api.js")).andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("const Api")));
        mvc.perform(get("/css/pedidos.css")).andExpect(status().isOk());
        mvc.perform(get("/static/js/api.js")).andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("const Api")));
        mvc.perform(get("/static/css/pedidos.css")).andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString(".pedido-card")));
        mvc.perform(get("/static/css/administrativo.css")).andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString(".admin-tab")));
        mvc.perform(get("/pedidos.html")).andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("./static/css/pedidos.css")));
        mvc.perform(get("/administrativo.html")).andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("./static/css/administrativo.css")));
        mvc.perform(get("/api/products")).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThan(0)));
    }

    @Test
    void unauthenticatedRequestsCannotSeeOrders() throws Exception {
        mvc.perform(get("/api/orders")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/orders")).andExpect(status().isUnauthorized());
    }

    @Test
    void registrationHashesPasswordAndRejectsDuplicates() throws Exception {
        String request = "{\"nome\":\"Teste\",\"email\":\"teste-auth@exemplo.com\",\"senha\":\"senhaSegura!123\"}";
        mvc.perform(post("/api/auth/register")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(request))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("CLIENTE"));

        org.junit.jupiter.api.Assertions.assertNotEquals("senhaSegura!123",
                users.findByEmail("teste-auth@exemplo.com").orElseThrow().getSenhaHash());

        mvc.perform(post("/api/auth/register")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(request))
                .andExpect(status().isConflict());
    }

    @Test
    void csrfIsMandatoryForOrderChanges() throws Exception {
        var account = users.save(new UserEntity("Teste CSRF", "csrf@exemplo.com",
                encoder.encode("senhaSegura123"), "", false, UserEntity.Role.CLIENTE));

        mvc.perform(post("/api/orders")
                        .with(SecurityMockMvcRequestPostProcessors.user(account.getEmail()).roles("CLIENTE"))
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void serverCalculatesPricesAndRejectsInvalidOrders() throws Exception {
        var account = users.save(new UserEntity("Cliente", "cliente-auth@exemplo.com",
                encoder.encode("password123"), "", false, UserEntity.Role.CLIENTE));

        mvc.perform(get("/api/admin/orders")
                        .with(SecurityMockMvcRequestPostProcessors.user(account.getEmail()).roles("CLIENTE")))
                .andExpect(status().isForbidden());

        String validOrder = "{\"nome\":\"Cliente\",\"email\":\"cliente-auth@exemplo.com\","
                + "\"telefone\":\"11999999999\",\"endereco\":\"Rua A 1\",\"cep\":\"01234567\","
                + "\"pagamento\":\"pix\",\"itens\":[{\"produtoId\":1,\"quantidade\":2,\"preco\":0}]}";

        mvc.perform(post("/api/orders")
                        .with(SecurityMockMvcRequestPostProcessors.user(account.getEmail()).roles("CLIENTE"))
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(validOrder))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.total").value(13.0))
                .andExpect(jsonPath("$.status").value("pendente"));

        String invalidOrder = "{\"nome\":\"Cliente\",\"email\":\"cliente-auth@exemplo.com\","
                + "\"telefone\":\"11999999999\",\"endereco\":\"Rua A 1\",\"cep\":\"01234567\","
                + "\"pagamento\":\"pix\",\"itens\":[{\"produtoId\":1,\"quantidade\":0}]}";

        mvc.perform(post("/api/orders")
                        .with(SecurityMockMvcRequestPostProcessors.user(account.getEmail()).roles("CLIENTE"))
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(invalidOrder))
                .andExpect(status().isBadRequest());

        mvc.perform(get("/api/orders")
                        .with(SecurityMockMvcRequestPostProcessors.user(account.getEmail()).roles("CLIENTE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].clienteEmail").value(account.getEmail()));
    }

    @Test
    void adminCanAdvanceOrderOncePerStage() throws Exception {
        var admin = users.save(new UserEntity("Administrador", "admin-test@exemplo.com",
                encoder.encode("senhaSegura123"), "", false, UserEntity.Role.ADMIN));

        var customer = users.save(new UserEntity("Comprador", "comprador-test@exemplo.com",
                encoder.encode("senhaSegura123"), "", false, UserEntity.Role.CLIENTE));
        var request = new OrderService.Create("Comprador", customer.getEmail(),
                "11999999999", "Rua A 1", "", "01234567", "pix",
                java.util.List.of(new OrderService.ItemRequest(1L, 1)));
        Long orderId = orderService.create(customer.getEmail(), request).id();

        mvc.perform(patch("/api/admin/orders/" + orderId + "/status")
                        .with(SecurityMockMvcRequestPostProcessors.user(admin.getEmail()).roles("ADMIN"))
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"em_atendimento\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("em_atendimento"));

        mvc.perform(patch("/api/admin/orders/" + orderId + "/status")
                        .with(SecurityMockMvcRequestPostProcessors.user(admin.getEmail()).roles("ADMIN"))
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"em_atendimento\"}"))
                .andExpect(status().isBadRequest());

        mvc.perform(patch("/api/admin/orders/" + orderId + "/status")
                        .with(SecurityMockMvcRequestPostProcessors.user(admin.getEmail()).roles("ADMIN"))
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"finalizado\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("finalizado"));
    }
}
