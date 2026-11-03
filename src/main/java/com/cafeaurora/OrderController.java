package com.cafeaurora;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController
public class OrderController {
 private final OrderService service;
 public OrderController(OrderService s){service=s;}
 @GetMapping("/api/orders")public List<OrderService.OrderDto> mine(Authentication a){return service.mine(a.getName());}
 @PostMapping("/api/orders")public ResponseEntity<OrderService.OrderDto> create(@Valid @RequestBody OrderService.Create b,Authentication a){
  return ResponseEntity.status(201).body(service.create(a.getName(),b));
 }
 public record Change(String status){}
 @GetMapping("/api/admin/orders")public List<OrderService.OrderDto> all(){return service.all();}
 @PatchMapping("/api/admin/orders/{id}/status")public OrderService.OrderDto update(@PathVariable Long id,@RequestBody Change change){
  OrderEntity.Status next;
  try{next=OrderEntity.Status.valueOf(change.status().toUpperCase(Locale.ROOT));}
  catch(RuntimeException e){throw new IllegalArgumentException("Status inválido");}
  return service.advance(id,next);
 }
}