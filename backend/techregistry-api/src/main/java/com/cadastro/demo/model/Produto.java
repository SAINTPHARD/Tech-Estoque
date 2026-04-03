/**
 *  A remover por estou utilizando a classe Entity Produto para mapear os dados do banco de dados, e não mais a classe DTO.
 * package com.cadastro.demo.model;
 * 
 * import java.util.Objects;
 * 
 * import jakarta.persistence.Entity;
 * import jakarta.persistence.GeneratedValue;
 * import jakarta.persistence.GenerationType;
 * import jakarta.persistence.Id;
 * import jakarta.persistence.Table;
 * 
 * @Entity // Informa ao Spring que esta classe é uma tabela no banco
 * @Table(name = "jdbcsimples") // Nome da tabela(criado no MySQl)
 * public class Produto {
 * 
 * 	@Id // indica que é uma chave primaria
 * 	@GeneratedValue(strategy = GenerationType.IDENTITY)
 * 
 * 	-- 1. Atributos: representam as características de um produto, como id, nome,
 * 	-- preço e quantidade
 * 
 * 	private long id;
 * 
 * 	private String nome;
 * 	private Double preco;
 * 	private Integer quantidade;
 * 
 * 	// 2. Construtor vazio pra inicilizar um objeto Produto
 * 	public Produto() {
 * 	}
 * 
 * 	// 3. Construtores com todos os atributos(parametros)
 * 	public Produto(Long id, String nome, Double preco, Integer quantidade) {
 * 		this.id = id;
 * 		this.nome = nome;
 * 		this.preco = preco;
 * 		this.quantidade = quantidade;
 * 	}
 * 
 * 	-- 4. Getters e Setters (Essenciais para o Spring mapear os dados) permitem acessar
 * 	-- e modificar os atributos do produto
 * 
 * 
 * 	public long getId() {
 * 		return id;
 * 	}
 * 
 * 	public void setId(long id) {
 * 		this.id = id;
 * 	}
 * 
 * 	public String getNome() {
 * 		return nome;
 * 	}
 * 
 * 	public void setNome(String nome) {
 * 		this.nome = nome;
 * 	}
 * 
 * 	public Double getPreco() {
 * 		return preco;
 * 	}
 * 
 * 	public void setPreco(Double preco) {
 * 		this.preco = preco;
 * 	}
 * 
 * 	public Integer getQuantidade() {
 * 		return quantidade;
 * 	}
 * 
 * 	public void setQuantidade(Integer quantidade) {
 * 		this.quantidade = quantidade;
 * 	}
 * 
 * 	-- 5. Método toString: imprime uma representação em string do produto, incluindo
 * 	-- seus atributos formatados de forma legível
 * 
 * 	@Override
 * 	public String toString() {
 * 		return "Produto [id=" + id + ", nome=" + nome + ", preco=" + preco + ", quantidade=" + quantidade + "]";
 * 	}
 * 
 * 	-- 6. Métodos hashCode e equals: permitem comparar produtos e garantir que eles
 * 	-- sejam tratados corretamente em coleções, como listas ou conjuntos
 * 
 * 
 * 	@Override
 * 	public int hashCode() {
 * 		return Objects.hash(id, nome, preco, quantidade);
 * 	}
 * 
 * 	@Override
 * 	public boolean equals(Object obj) {
 * 		if (this == obj)
 * 			return true;
 * 		if (obj == null)
 * 			return false;
 * 		if (getClass() != obj.getClass())
 * 			return false;
 * 		Produto other = (Produto) obj;
 * 		return id == other.id && Objects.equals(nome, other.nome)
 * 				&& Double.doubleToLongBits(preco) == Double.doubleToLongBits(other.preco)
 * 				&& quantidade == other.quantidade;
 * 	}
 * }
 */
