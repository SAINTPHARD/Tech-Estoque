package com.cadastro.demo.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.cadastro.demo.dto.ProdutoRequestDTO;
import com.cadastro.demo.dto.ProdutoResponseDTO;
import com.cadastro.demo.service.ProdutoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

	private final ProdutoService service;

	public ProdutoController(ProdutoService service) {
		this.service = service;
	}

	@PostMapping
	public ResponseEntity<ProdutoResponseDTO> create(@Valid @RequestBody ProdutoRequestDTO dto) {
		ProdutoResponseDTO created = service.salvar(dto);
		URI location = ServletUriComponentsBuilder.fromCurrentRequest()
				.path("/{id}")
				.buildAndExpand(created.id())
				.toUri();
		return ResponseEntity.created(location).body(created);
	}

	@GetMapping
	public List<ProdutoResponseDTO> listar() {
		return service.listarTodos();
	}

	@GetMapping("/{id}")
	public ProdutoResponseDTO buscarPorId(@PathVariable Long id) {
		return service.buscarPorId(id);
	}

	@PutMapping("/{id}")
	public ProdutoResponseDTO update(@PathVariable Long id, @Valid @RequestBody ProdutoRequestDTO dto) {
		return service.atualizar(id, dto);
	}

	@PatchMapping("/{id}/estoque")
	public ResponseEntity<ProdutoResponseDTO> alterarEstoque(@PathVariable Long id, @RequestParam int delta) {
		return ResponseEntity.ok(service.alterarEstoque(id, delta));
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable Long id) {
		service.delete(id);
	}
}
