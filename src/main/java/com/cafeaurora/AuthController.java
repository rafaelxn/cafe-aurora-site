package com.cafeaurora;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.*;
import org.springframework.security.core.context.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
@RestController @RequestMapping("/api/auth")
public class AuthController {
 private final UserRepository users;private final PasswordEncoder encoder;
 private final AuthenticationManager manager;private final SecurityContextRepository contexts;
 public AuthController(UserRepository u,PasswordEncoder e,AuthenticationManager m,SecurityContextRepository c){users=u;encoder=e;manager=m;contexts=c;}
 public record Register(@NotBlank @Size(max=120) String nome,@NotBlank @Email String email,
  @NotBlank @Size(min=8,max=72) String senha,String telefone,boolean newsletter){}
 public record Login(@NotBlank String email,@NotBlank String senha){}
 public record Account(Long id,String nome,String email,String telefone,String role){
  static Account from(UserEntity u){return new Account(u.getId(),u.getNome(),u.getEmail(),u.getTelefone(),u.getRole().name());}
 }
 @GetMapping("/csrf") public Map<String,String> csrf(CsrfToken token){return Map.of("token",token.getToken());}
 @PostMapping("/register") public ResponseEntity<Account> register(@Valid @RequestBody Register body){
  String email=body.email().trim().toLowerCase(Locale.ROOT);
  if(users.existsByEmail(email))throw new ResponseStatusException(HttpStatus.CONFLICT,"E-mail já cadastrado");
  var u=users.save(new UserEntity(body.nome().trim(),email,encoder.encode(body.senha()),
   body.telefone()==null?"":body.telefone().trim(),body.newsletter(),UserEntity.Role.CLIENTE));
  return ResponseEntity.status(201).body(Account.from(u));
 }
 @PostMapping("/login")public Account login(@Valid @RequestBody Login body,HttpServletRequest req,HttpServletResponse res){
  String email=body.email().trim().toLowerCase(Locale.ROOT);
  try{
   Authentication auth=manager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(email,body.senha()));
   req.getSession(true);req.changeSessionId();
   SecurityContext c=SecurityContextHolder.createEmptyContext();c.setAuthentication(auth);
   SecurityContextHolder.setContext(c);contexts.saveContext(c,req,res);
   return Account.from(users.findByEmail(email).orElseThrow());
  }catch(AuthenticationException ex){throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Credenciais inválidas");}
 }
 @GetMapping("/me")public Account me(Authentication auth){return Account.from(users.findByEmail(auth.getName()).orElseThrow());}
}