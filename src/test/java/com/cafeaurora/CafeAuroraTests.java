package com.cafeaurora;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;
@SpringBootTest @AutoConfigureMockMvc
class CafeAuroraTests {
 @Autowired MockMvc mvc;@Autowired UserRepository users;@Autowired PasswordEncoder encoder;
 @Test void catalogPublicAndOrdersProtected()throws Exception {
  mvc.perform(get("/api/products")).andExpect(status().isOk()).andExpect(jsonPath("$.length()",greaterThan(0)));
  mvc.perform(get("/api/orders")).andExpect(status().isUnauthorized());
 }
 @Test void passwordsAreHashed()throws Exception {
  String body="{\"nome\":\"Teste\",\"email\":\"teste-auth@exemplo.com\",\"senha\":\"senhaSegura!123\"}";
  mvc.perform(post("/api/auth/register").with(SecurityMockMvcRequestPostProcessors.csrf()).contentType(MediaType.APPLICATION_JSON).content(body))
   .andExpect(status().isCreated()).andExpect(jsonPath("$.role").value("CLIENTE"));
  org.junit.jupiter.api.Assertions.assertNotEquals("senhaSegura!123",
   users.findByEmail("teste-auth@exemplo.com").orElseThrow().getSenhaHash());
 }
 @Test void customerCannotReadAdminAndCannotSetProductPrice()throws Exception {
  var account=users.save(new UserEntity("Cliente","cliente-auth@exemplo.com",encoder.encode("password123"),"",false,UserEntity.Role.CLIENTE));
  mvc.perform(get("/api/admin/orders").with(SecurityMockMvcRequestPostProcessors.user(account.getEmail()).roles("CLIENTE")))
   .andExpect(status().isForbidden());
  String body="{\"nome\":\"Cliente\",\"email\":\"cliente-auth@exemplo.com\",\"telefone\":\"11999999999\",\"endereco\":\"Rua A 1\",\"cep\":\"01234567\",\"pagamento\":\"pix\",\"itens\":[{\"produtoId\":1,\"quantidade\":2,\"preco\":0}]}";
  mvc.perform(post("/api/orders").with(SecurityMockMvcRequestPostProcessors.user(account.getEmail()).roles("CLIENTE"))
   .with(SecurityMockMvcRequestPostProcessors.csrf()).contentType(MediaType.APPLICATION_JSON).content(body))
   .andExpect(status().isCreated()).andExpect(jsonPath("$.total").value(13.0))
   .andExpect(jsonPath("$.status").value("pendente"));
 }
}