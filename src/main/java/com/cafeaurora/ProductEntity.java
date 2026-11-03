package com.cafeaurora;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "produtos")
public class ProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, length = 40)
    private String categoria;

    @Column(nullable = false, length = 500)
    private String descricao;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    @Column(nullable = false, length = 50)
    private String tamanho;

    @Column(nullable = false, length = 300)
    private String imagem;

    private boolean destaque;
    private boolean disponivel = true;

    protected ProductEntity() {
    }

    public ProductEntity(String nome, String categoria, String descricao, String preco,
                         String tamanho, String imagem, boolean destaque) {
        this.nome = nome;
        this.categoria = categoria;
        this.descricao = descricao;
        this.preco = new BigDecimal(preco);
        this.tamanho = tamanho;
        this.imagem = imagem;
        this.destaque = destaque;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getCategoria() {
        return categoria;
    }

    public String getDescricao() {
        return descricao;
    }

    public BigDecimal getPreco() {
        return preco;
    }

    public String getTamanho() {
        return tamanho;
    }

    public String getImagem() {
        return imagem;
    }

    public boolean isDestaque() {
        return destaque;
    }

    public boolean isDisponivel() {
        return disponivel;
    }
}
