package com.cadastro.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cadastro.demo.entity.Usuario;

/**
 * UsuarioRepository
 * -----------------
 * Repositório Spring Data JPA para a entidade Usuario.
 * O Spring implementa automaticamente métodos de consulta baseados no nome,
 * por exemplo findByLogin será implementado automaticamente e executará a
 * consulta WHERE login = :login.
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /**
     * Busca um usuário pelo login (usuário/email). Retorna o objeto Usuario
     * que implementa UserDetails. O Spring Data gera a implementação
     * automaticamente com base no nome do método.
     */
    Usuario findByLogin(String login);

}