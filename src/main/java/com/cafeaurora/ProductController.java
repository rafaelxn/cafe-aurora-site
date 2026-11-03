package com.cafeaurora;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
@RestController @RequestMapping("/api/products")
public class ProductController {
 private final ProductRepository products;
 public ProductController(ProductRepository products){this.products=products;}
 public record ProductDto(Long id,String nome,String categoria,String descricao,BigDecimal preco,String tamanho,String imagem,boolean destaque){}
 @GetMapping public List<ProductDto> list(){
  return products.findByDisponivelTrueOrderByIdAsc().stream()
   .map(p->new ProductDto(p.getId(),p.getNome(),p.getCategoria(),p.getDescricao(),p.getPreco(),p.getTamanho(),p.getImagem(),p.isDestaque())).toList();
 }
}