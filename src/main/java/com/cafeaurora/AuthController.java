package com.cafeaurora;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final AuthenticationManager manager;
    private final SecurityContextRepository contexts;

    public AuthController(UserRepository users, PasswordEncoder encoder,
                          AuthenticationManager manager, SecurityContextRepository contexts) {
        this.users = users;
        this.encoder = encoder;
        this.manager = manager;
        this.contexts = contexts;
    }

    public record Register(
            @NotBlank @Size(max = 120) String nome,
            @NotBlank @Email @Size(max = 180) String email,
            @NotBlank @Size(min = 8, max = 72) String senha,
            @Size(max = 30) String telefone,
            boolean newsletter) {
    }

    public record Login(@NotBlank String email, @NotBlank String senha) {
    }

    public record Account(Long id, String nome, String email, String telefone, String role) {
        static Account from(UserEntity user) {
            return new Account(user.getId(), user.getNome(), user.getEmail(),
                    user.getTelefone(), user.getRole().name());
        }
    }

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of("token", token.getToken());
    }

    @PostMapping("/register")
    public ResponseEntity<Account> register(@Valid @RequestBody Register body) {
        String normalizedEmail = body.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }

        UserEntity created = users.save(new UserEntity(
                body.nome().trim(),
                normalizedEmail,
                encoder.encode(body.senha()),
                body.telefone() == null ? "" : body.telefone().trim(),
                body.newsletter(),
                UserEntity.Role.CLIENTE
        ));
        return ResponseEntity.status(HttpStatus.CREATED).body(Account.from(created));
    }

    @PostMapping("/login")
    public Account login(@Valid @RequestBody Login body,
                         HttpServletRequest request, HttpServletResponse response) {
        String normalizedEmail = body.email().trim().toLowerCase(Locale.ROOT);

        try {
            Authentication authentication = manager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(
                            normalizedEmail, body.senha()
                    )
            );
            request.getSession(true);
            request.changeSessionId();

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            contexts.saveContext(context, request, response);

            return Account.from(users.findByEmail(normalizedEmail).orElseThrow());
        } catch (AuthenticationException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "E-mail ou senha incorretos");
        }
    }

    @GetMapping("/me")
    public Account me(Authentication authentication) {
        return Account.from(users.findByEmail(authentication.getName()).orElseThrow());
    }
}
