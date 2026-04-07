package com.cadastro.demo.dto;

import java.math.BigDecimal;
import java.util.Map;

import com.cadastro.demo.entity.Produto;

public class ProdutoResponseDTO {

    private Long id;
    private String nome;
    private String categoria;
    private BigDecimal preco;
    private Integer quantidade;

    // Construtor que transforma a Entidade em DTO com variáveis explícitas
    public ProdutoResponseDTO(Produto produto) {
        // Variáveis de domínio (Nomenclatura apropriada para OO)
        Long idProduto = produto.getId();
        String nomeProduto = produto.getName();
        String categoriaProduto = produto.getCategory();
        BigDecimal precoProduto = produto.getPrice();
        Integer quantidadeProduto = produto.getQuantity();

        // Atribuição aos campos da classe
        this.id = idProduto;
        this.nome = nomeProduto;
        this.categoria = categoriaProduto;
        this.preco = precoProduto;
        this.quantidade = quantidadeProduto;
    }

    // Getters
    public Long getId() { return this.id; }
    public String getNome() { return this.nome; }
    public String getCategoria() { return this.categoria; }
    public BigDecimal getPreco() { return this.preco; }
    public Integer getQuantidade() { return this.quantidade; }

}