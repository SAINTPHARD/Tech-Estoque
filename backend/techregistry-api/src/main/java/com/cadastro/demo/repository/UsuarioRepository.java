package com.cadastro.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

import com.cadastro.demo.entity.Usuario;

/** * Classe de repositório para a entidade "Usuario". Esta classe pode ser usada para interagir com o banco de dados e realizar operações CRUD (Create, Read, Update, Delete) relacionadas aos usuários da aplicação.
 * Dependendo dos requisitos da aplicação, esta classe pode incluir métodos para salvar um novo usuário, buscar usuários por diferentes critérios (como ID, email, etc.), atualizar informações do usuário e excluir usuários do banco de dados.
 * <-- Salvar Usuário
 * <-- Buscar Usuário por ID
 * <-- Buscar Usuário por Email
 * <-- Atualizar Usuário
 * <-- Excluir Usuário
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

	// Método personalizado para buscar um usuário pelo login (email)
	// O Spring Data JPA irá implementar automaticamente este método com base na convenção de nomenclatura
	UserDetails findByLogin(String login);

}
