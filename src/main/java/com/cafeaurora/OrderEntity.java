package com.cafeaurora;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
public class OrderEntity {

    public enum Status {
        PENDENTE,
        EM_ATENDIMENTO,
        FINALIZADO
    }

    public enum Payment {
        PIX,
        CARTAO,
        DINHEIRO
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private UserEntity cliente;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, length = 180)
    private String email;

    @Column(nullable = false, length = 30)
    private String telefone;

    @Column(nullable = false, length = 250)
    private String endereco;

    @Column(length = 100)
    private String complemento;

    @Column(nullable = false, length = 12)
    private String cep;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Payment pagamento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDENTE;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(nullable = false)
    private Instant criadoEm = Instant.now();

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItemEntity> itens = new ArrayList<>();

    protected OrderEntity() {
    }

    public OrderEntity(UserEntity cliente, String nome, String email, String telefone,
                       String endereco, String complemento, String cep, Payment pagamento) {
        this.cliente = cliente;
        this.nome = nome;
        this.email = email;
        this.telefone = telefone;
        this.endereco = endereco;
        this.complemento = complemento;
        this.cep = cep;
        this.pagamento = pagamento;
    }

    public void addItem(ProductEntity produto, int quantidade) {
        itens.add(new OrderItemEntity(this, produto, quantidade, produto.getPreco()));
        total = total.add(produto.getPreco().multiply(BigDecimal.valueOf(quantidade)));
    }

    public void advance(Status next) {
        if ((status == Status.PENDENTE && next == Status.EM_ATENDIMENTO)
                || (status == Status.EM_ATENDIMENTO && next == Status.FINALIZADO)) {
            status = next;
            return;
        }
        throw new IllegalArgumentException("Transição de status não permitida");
    }

    public Long getId() {
        return id;
    }

    public UserEntity getCliente() {
        return cliente;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public String getTelefone() {
        return telefone;
    }

    public String getEndereco() {
        return endereco;
    }

    public String getComplemento() {
        return complemento;
    }

    public String getCep() {
        return cep;
    }

    public Payment getPagamento() {
        return pagamento;
    }

    public Status getStatus() {
        return status;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public List<OrderItemEntity> getItens() {
        return itens;
    }
}
