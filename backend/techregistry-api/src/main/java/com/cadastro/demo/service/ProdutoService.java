package com.cadastro.demo.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cadastro.demo.dto.ProdutoRequestDTO;
import com.cadastro.demo.dto.ProdutoResponseDTO;
import com.cadastro.demo.entity.Produto;
import com.cadastro.demo.exception.ResourceNotFoundException;
import com.cadastro.demo.repository.ProdutoRepository;

@Service
public class ProdutoService {

	private final ProdutoRepository repository;

	public ProdutoService(ProdutoRepository repository) {
		this.repository = repository;
	}

	@Transactional(readOnly = true)
	public List<ProdutoResponseDTO> listarTodos() {
		return repository.findAll(Sort.by(Sort.Direction.DESC, "id"))
				.stream()
				.map(ProdutoResponseDTO::new)
				.toList();
	}

	@Transactional(readOnly = true)
	public ProdutoResponseDTO buscarPorId(Long id) {
		return new ProdutoResponseDTO(buscarEntidade(id));
	}

	@Transactional
	public ProdutoResponseDTO salvar(ProdutoRequestDTO dto) {
		Produto produto = new Produto();
		aplicarDados(produto, dto);
		return new ProdutoResponseDTO(repository.save(produto));
	}

	@Transactional
	public ProdutoResponseDTO atualizar(Long id, ProdutoRequestDTO dto) {
		Produto produto = buscarEntidade(id);
		aplicarDados(produto, dto);
		return new ProdutoResponseDTO(repository.save(produto));
	}

	@Transactional
	public ProdutoResponseDTO alterarEstoque(Long id, int delta) {
		Produto produto = buscarEntidade(id);
		int novaQuantidade = produto.getQuantidade() + delta;

		if (novaQuantidade < 0) {
			throw new IllegalArgumentException("Nao e possivel reduzir o estoque abaixo de zero.");
		}

		produto.setQuantidade(novaQuantidade);
		return new ProdutoResponseDTO(repository.save(produto));
	}

	@Transactional
	public void delete(Long id) {
		repository.delete(buscarEntidade(id));
	}

	private Produto buscarEntidade(Long id) {
		return repository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Produto com ID " + id + " nao encontrado."));
	}

	private void aplicarDados(Produto produto, ProdutoRequestDTO dto) {
		produto.setNome(dto.nome().trim());
		produto.setCategoria(dto.categoria().trim());
		produto.setPreco(dto.preco());
		produto.setQuantidade(dto.quantidade());
	}
}
