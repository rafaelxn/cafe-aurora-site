package com.cafeaurora;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository products;

    public ProductController(ProductRepository products) {
        this.products = products;
    }

    public record ProductDto(Long id, String nome, String categoria, String descricao,
                             BigDecimal preco, String tamanho, String imagem, boolean destaque) {
    }

    @GetMapping
    public List<ProductDto> list() {
        return products.findByDisponivelTrueOrderByIdAsc()
                .stream()
                .map(product -> new ProductDto(
                        product.getId(),
                        product.getNome(),
                        product.getCategoria(),
                        product.getDescricao(),
                        product.getPreco(),
                        product.getTamanho(),
                        product.getImagem(),
                        product.isDestaque()
                ))
                .toList();
    }
}
