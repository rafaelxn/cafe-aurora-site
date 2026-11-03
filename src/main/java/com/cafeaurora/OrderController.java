package com.cafeaurora;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Locale;

@RestController
public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @GetMapping("/api/orders")
    public List<OrderService.OrderDto> mine(Authentication authentication) {
        return service.mine(authentication.getName());
    }

    @PostMapping("/api/orders")
    public ResponseEntity<OrderService.OrderDto> create(
            @Valid @RequestBody OrderService.Create body, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(authentication.getName(), body));
    }

    public record Change(@NotBlank String status) {
    }

    @GetMapping("/api/admin/orders")
    public List<OrderService.OrderDto> all() {
        return service.all();
    }

    @PatchMapping("/api/admin/orders/{id}/status")
    public OrderService.OrderDto update(
            @PathVariable Long id, @Valid @RequestBody Change body) {
        OrderEntity.Status next;
        try {
            next = OrderEntity.Status.valueOf(body.status().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Status inválido");
        }
        return service.advance(id, next);
    }
}
