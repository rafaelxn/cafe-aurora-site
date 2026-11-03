package com.cafeaurora;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class OrderService {

    private final OrderRepository orders;
    private final ProductRepository products;
    private final UserRepository users;

    public OrderService(OrderRepository orders, ProductRepository products, UserRepository users) {
        this.orders = orders;
        this.products = products;
        this.users = users;
    }

    public record ItemRequest(
            @NotNull Long produtoId,
            @Min(1) @Max(99) int quantidade) {
    }

    public record Create(
            @NotBlank @Size(max = 120) String nome,
            @NotBlank @Email @Size(max = 180) String email,
            @NotBlank @Size(max = 30) String telefone,
            @NotBlank @Size(max = 250) String endereco,
            @Size(max = 100) String complemento,
            @NotBlank @Size(max = 12) String cep,
            @NotBlank String pagamento,
            @NotEmpty @Size(max = 30) List<@NotNull @Valid ItemRequest> itens) {
    }

    public record ItemDto(String nome, int quantidade, BigDecimal preco) {
    }

    public record OrderDto(
            Long id, String numeroPedido, String clienteNome, String clienteEmail,
            String telefone, String endereco, String complemento, String cep,
            String pagamento, String status, BigDecimal total, Instant data,
            List<ItemDto> itens) {

        static OrderDto from(OrderEntity order) {
            return new OrderDto(
                    order.getId(),
                    "PED-" + order.getId(),
                    order.getNome(),
                    order.getEmail(),
                    order.getTelefone(),
                    order.getEndereco(),
                    order.getComplemento(),
                    order.getCep(),
                    order.getPagamento().name().toLowerCase(Locale.ROOT),
                    order.getStatus().name().toLowerCase(Locale.ROOT),
                    order.getTotal(),
                    order.getCriadoEm(),
                    order.getItens().stream()
                            .map(item -> new ItemDto(item.getProduto().getNome(),
                                    item.getQuantidade(), item.getPrecoUnitario()))
                            .toList()
            );
        }
    }

    @Transactional
    public OrderDto create(String authenticatedEmail, Create body) {
        UserEntity owner = users.findByEmail(authenticatedEmail).orElseThrow();
        OrderEntity.Payment payment;
        try {
            payment = OrderEntity.Payment.valueOf(body.pagamento().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Forma de pagamento inválida");
        }

        OrderEntity order = new OrderEntity(
                owner,
                body.nome().trim(),
                owner.getEmail(),
                body.telefone().trim(),
                body.endereco().trim(),
                body.complemento() == null ? "" : body.complemento().trim(),
                body.cep().trim(),
                payment
        );

        Set<Long> uniqueIds = new HashSet<>();
        int totalQuantity = 0;
        for (ItemRequest item : body.itens()) {
            if (!uniqueIds.add(item.produtoId())) {
                throw new IllegalArgumentException("Produto duplicado no pedido");
            }

            totalQuantity += item.quantidade();
            if (totalQuantity > 99) {
                throw new IllegalArgumentException("Quantidade total excede o limite");
            }

            ProductEntity product = products.findById(item.produtoId())
                    .filter(ProductEntity::isDisponivel)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Produto indisponível"));
            order.addItem(product, item.quantidade());
        }

        return OrderDto.from(orders.saveAndFlush(order));
    }

    @Transactional(readOnly = true)
    public List<OrderDto> mine(String authenticatedEmail) {
        UserEntity owner = users.findByEmail(authenticatedEmail).orElseThrow();
        return orders.findByClienteIdOrderByCriadoEmDesc(owner.getId())
                .stream()
                .map(OrderDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderDto> all() {
        return orders.findAllByOrderByCriadoEmDesc()
                .stream()
                .map(OrderDto::from)
                .toList();
    }

    @Transactional
    public OrderDto advance(Long id, OrderEntity.Status next) {
        OrderEntity order = orders.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Pedido não encontrado"));
        order.advance(next);
        return OrderDto.from(order);
    }
}
