package com.cafeaurora;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
@Service
public class OrderService {
 private final OrderRepository orders;private final ProductRepository products;private final UserRepository users;
 public OrderService(OrderRepository o,ProductRepository p,UserRepository u){orders=o;products=p;users=u;}
 public record ItemRequest(@NotNull Long produtoId,@Min(1) @Max(99) int quantidade){}
 public record Create(@NotBlank String nome,@NotBlank @Email String email,@NotBlank String telefone,
  @NotBlank String endereco,String complemento,@NotBlank String cep,@NotBlank String pagamento,
  @NotEmpty List<@Valid ItemRequest> itens){}
 public record ItemDto(String nome,int quantidade,BigDecimal preco){}
 public record OrderDto(Long id,String numeroPedido,String clienteNome,String clienteEmail,String telefone,
  String endereco,String complemento,String cep,String pagamento,String status,BigDecimal total,Instant data,List<ItemDto> itens){
  static OrderDto from(OrderEntity p){return new OrderDto(p.getId(),"PED-"+p.getId(),p.getNome(),p.getEmail(),p.getTelefone(),
   p.getEndereco(),p.getComplemento(),p.getCep(),p.getPagamento().name().toLowerCase(Locale.ROOT),
   p.getStatus().name().toLowerCase(Locale.ROOT),p.getTotal(),p.getCriadoEm(),
   p.getItens().stream().map(i->new ItemDto(i.getProduto().getNome(),i.getQuantidade(),i.getPrecoUnitario())).toList());}
 }
 @Transactional public OrderDto create(String email,Create body){
  UserEntity u=users.findByEmail(email).orElseThrow();
  OrderEntity.Payment payment;
  try{payment=OrderEntity.Payment.valueOf(body.pagamento().toUpperCase(Locale.ROOT));}
  catch(IllegalArgumentException e){throw new IllegalArgumentException("Pagamento inválido");}
  OrderEntity order=new OrderEntity(u,body.nome().trim(),body.email().trim(),body.telefone().trim(),
   body.endereco().trim(),body.complemento()==null?"":body.complemento().trim(),body.cep().trim(),payment);
  if(body.itens().size()>30)throw new IllegalArgumentException("Muitos produtos");
  Set<Long> seen=new HashSet<>();int quantity=0;
  for(ItemRequest i:body.itens()){
   if(i.produtoId()==null||!seen.add(i.produtoId()))throw new IllegalArgumentException("Produto inválido ou duplicado");
   quantity+=i.quantidade();if(quantity>99)throw new IllegalArgumentException("Quantidade excede limite");
   var product=products.findById(i.produtoId()).filter(ProductEntity::isDisponivel)
    .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Produto não encontrado"));
   order.addItem(product,i.quantidade());
  }
  return OrderDto.from(orders.saveAndFlush(order));
 }
 @Transactional(readOnly=true)public List<OrderDto> mine(String email){
  return orders.findByClienteIdOrderByCriadoEmDesc(users.findByEmail(email).orElseThrow().getId())
   .stream().map(OrderDto::from).toList();
 }
 @Transactional(readOnly=true)public List<OrderDto> all(){return orders.findAllByOrderByCriadoEmDesc().stream().map(OrderDto::from).toList();}
 @Transactional public OrderDto advance(Long id,OrderEntity.Status next){
  var order=orders.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Pedido não encontrado"));
  order.advance(next);return OrderDto.from(order);
 }
}