package com.cadastro.demo.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ProdutoRequestDTO(
		@NotBlank(message = "O nome do produto e obrigatorio.")
		@Size(max = 100, message = "O nome do produto deve ter no maximo 100 caracteres.")
		String nome,
		@NotBlank(message = "A categoria do produto e obrigatoria.")
		@Size(max = 100, message = "A categoria do produto deve ter no maximo 100 caracteres.")
		String categoria,
		@NotNull(message = "O preco do produto e obrigatorio.")
		@DecimalMin(value = "0.01", message = "O preco do produto deve ser um valor positivo.")
		BigDecimal preco,
		@NotNull(message = "A quantidade do produto e obrigatoria.")
		@PositiveOrZero(message = "A quantidade do produto nao pode ser negativa.")
		Integer quantidade) {
}
