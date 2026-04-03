package com.cadastro.demo.dto;

import java.math.BigDecimal;

import com.cadastro.demo.entity.Produto;

public record ProdutoResponseDTO(
		Long id,
		String nome,
		String categoria,
		BigDecimal preco,
		Integer quantidade) {

	public ProdutoResponseDTO(Produto produto) {
		this(
				produto.getId(),
				produto.getName(),
				produto.getCategory(),
				produto.getPrice(),
				produto.getQuantity());
	}
}
