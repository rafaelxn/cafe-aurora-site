package com.cafeaurora;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.*;
@Component
public class BootstrapData implements CommandLineRunner {
 private final ProductRepository products;private final UserRepository users;private final PasswordEncoder encoder;
 @Value("\u0024{app.admin.email:}") private String adminEmail;
 @Value("\u0024{app.admin.password:}") private String adminPassword;
 public BootstrapData(ProductRepository p,UserRepository u,PasswordEncoder e){products=p;users=u;encoder=e;}
 public void run(String... args){
  if(products.count()==0)products.saveAll(List.of(
   new ProductEntity("Café Expresso","cafe","Café intenso","6.50","Pequeno","☕",false),
   new ProductEntity("Cappuccino","cafe","Café com leite e espuma","8.90","Médio","☕",true),
   new ProductEntity("Macchiato","cafe","Espresso com espuma","7.50","Pequeno","☕",false),
   new ProductEntity("Café com Leite","cafe","Café com leite quente","5.90","Grande","☕",false),
   new ProductEntity("Americano","cafe","Expresso com água","5.50","Grande","☕",false),
   new ProductEntity("Chocolate Quente","bebida","Chocolate cremoso","7.90","Médio","🍫",true),
   new ProductEntity("Chá Gelado","bebida","Chá refrescante","6.50","Grande","🍵",false),
   new ProductEntity("Suco Natural","bebida","Suco de laranja","7.50","Grande","🧃",false),
   new ProductEntity("Matcha Latte","bebida","Bebida japonesa","9.90","Médio","🍵",false),
   new ProductEntity("Bolo de Chocolate","doce","Bolo de chocolate","8.50","Fatia","🍰",true),
   new ProductEntity("Brigadeiro Gourmet","doce","Brigadeiro artesanal","5.90","Unidade","🍫",false),
   new ProductEntity("Croissant de Chocolate","doce","Folhado com chocolate","6.50","Unidade","🥐",false),
   new ProductEntity("Torta de Morango","doce","Torta com morango","9.50","Fatia","🍓",true),
   new ProductEntity("Brownie","doce","Brownie morno","7.90","Unidade","🍫",false),
   new ProductEntity("Pão na Chapa","salgado","Pão com manteiga","4.50","Unidade","🍞",false),
   new ProductEntity("Bolo de Queijo","salgado","Bolo com queijo","5.90","Fatia","🧀",true),
   new ProductEntity("Quiche de Espinafre","salgado","Quiche de espinafre","8.50","Fatia","🥬",false),
   new ProductEntity("Sanduíche Natural","salgado","Sanduíche artesanal","9.90","Unidade","🥪",false),
   new ProductEntity("Empada de Frango","salgado","Empada de frango","6.50","Unidade","🍗",false),
   new ProductEntity("Pão de Queijo","salgado","Pão de queijo","3.90","Unidade","🧀",true)
  ));
  String email=adminEmail.trim().toLowerCase(Locale.ROOT);
  if(!email.isEmpty()&&!adminPassword.isBlank()&&!users.existsByEmail(email)){
   if(adminPassword.length()<12)throw new IllegalStateException("ADMIN_PASSWORD precisa ter 12 caracteres");
   users.save(new UserEntity("Administrador",email,encoder.encode(adminPassword),"",false,UserEntity.Role.ADMIN));
  }
 }
}