/**
package com.cadastro.demo.entity;

// Importa anotações do JPA para mapear objetos para tabelas
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

// Indica que essa classe representa uma tabela no banco
@Entity
public class Tech {

	// Define o campo como chave primária
	@Id

	// Faz o banco gerar o ID automaticamente
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// Coluna para armazenar o nome da tecnologia
	private String name;

	// Coluna para o tipo da tecnologia (Backend, Frontend, etc)
	private String type;

	// Coluna para o nível da tecnologia
	private String level;

	// Construtor vazio obrigatório para o JPA
	public Tech() {
	}

	// Construtor usado quando criamos objetos manualmente
	public Tech(String name, String type, String level) {
		this.name = name;
		this.type = type;
		this.level = level;
	}

	// getters & setters
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getLevel() {
		return level;
	}

	public void setLevel(String level) {
		this.level = level;
	}
}
*/