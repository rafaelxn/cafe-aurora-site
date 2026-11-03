package com.cafeaurora;
import org.springframework.context.annotation.*;
import org.springframework.http.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.*;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
@Configuration
public class SecurityConfig {
 @Bean PasswordEncoder encoder(){return new BCryptPasswordEncoder();}
 @Bean UserDetailsService accounts(UserRepository repo){
  return email->{var u=repo.findByEmail(email).orElseThrow(()->new UsernameNotFoundException("Conta não encontrada"));
   return User.withUsername(u.getEmail()).password(u.getSenhaHash()).roles(u.getRole().name()).build();};
 }
 @Bean AuthenticationManager authenticationManager(AuthenticationConfiguration c)throws Exception{return c.getAuthenticationManager();}
 @Bean SecurityContextRepository contextRepository(){return new HttpSessionSecurityContextRepository();}
 @Bean SecurityFilterChain filterChain(HttpSecurity http,SecurityContextRepository contexts)throws Exception{
  return http.csrf(c->c.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()).csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
   .securityContext(c->c.securityContextRepository(contexts))
   .authorizeHttpRequests(a->a.requestMatchers("/","/*.html","/favicon.svg","/static/**","/error").permitAll()
    .requestMatchers(HttpMethod.GET,"/api/products","/api/auth/csrf").permitAll()
    .requestMatchers(HttpMethod.POST,"/api/auth/register","/api/auth/login").permitAll()
    .requestMatchers("/api/admin/**").hasRole("ADMIN").anyRequest().authenticated())
   .formLogin(c->c.disable()).httpBasic(c->c.disable())
   .logout(c->c.logoutUrl("/api/auth/logout").logoutSuccessHandler((req,res,auth)->res.setStatus(204)))
   .exceptionHandling(c->c.authenticationEntryPoint((req,res,e)->fail(res,401,"Faça login"))
    .accessDeniedHandler((req,res,e)->fail(res,403,"Acesso negado"))).build();
 }
 static void fail(jakarta.servlet.http.HttpServletResponse res,int code,String msg)throws java.io.IOException{
  res.setStatus(code);res.setContentType("application/json;charset=UTF-8");res.getWriter().write("{\"message\":\""+msg+"\"}");
 }
}