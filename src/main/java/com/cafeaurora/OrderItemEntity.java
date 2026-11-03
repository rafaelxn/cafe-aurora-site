package com.cafeaurora;
import jakarta.persistence.*;
import java.math.BigDecimal;
@Entity @Table(name="itens_pedido")
public class OrderItemEntity {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) private OrderEntity pedido;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) private ProductEntity produto;
 private int quantidade;
 @Column(nullable=false,precision=10,scale=2) private BigDecimal precoUnitario;
 protected OrderItemEntity(){}
 public OrderItemEntity(OrderEntity pedido,ProductEntity produto,int quantidade,BigDecimal precoUnitario){
  this.pedido=pedido;this.produto=produto;this.quantidade=quantidade;this.precoUnitario=precoUnitario;
 }
 public ProductEntity getProduto(){return produto;}
 public int getQuantidade(){return quantidade;}
 public BigDecimal getPrecoUnitario(){return precoUnitario;}
}