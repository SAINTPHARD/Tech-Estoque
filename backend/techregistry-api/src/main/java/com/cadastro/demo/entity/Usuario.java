package com.cadastro.demo.entity;
/**
 * <-- Entidade JPA que representa a tabela 'usuarios' no banco de dados.
 * <-- Implementa UserDetails para integrar com o ecossistema do Spring Security.
 *   <-- A classe possui os seguintes campos:
 *   - id: Identificador único do usuário (chave primária, auto-incrementada)
 *   - login: O nome de usuário ou email usado para autenticação
 *   - senha: A senha do usuário (deve ser armazenada de forma segura, geralmente como um hash)
 *   A classe também implementa os métodos exigidos pela interface UserDetails, que são usados pelo Spring Security para realizar a autenticação e autorização dos usuários. Esses métodos incluem:
 */
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Entidade JPA que representa a tabela 'usuarios' no banco de dados.
 * Implementa UserDetails para integrar com o ecossistema do Spring Security.
 */
@Entity
@Table(name = "usuarios")
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String login;
    private String senha;

    // --- CONSTRUTORES ---

    // Construtor padrão (Obrigatório para o Hibernate/JPA)
    public Usuario() {
    }

    // Construtor para criação manual (ex: no Service de Cadastro)
    public Usuario(String login, String senha) {
        this.login = login;
        this.senha = senha;
    }

    // Construtor completo
    public Usuario(Long id, String login, String senha) {
        this.id = id;
        this.login = login;
        this.senha = senha;
    }

    // --- MÉTODOS DO CONTRATO UserDetails (Spring Security) ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Declaração explícita: define que todo usuário logado tem a permissão 'ROLE_USER'
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return this.senha;
    }

    @Override
    public String getUsername() {
        return this.login;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Conta nunca expira
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Conta nunca bloqueia
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Senha nunca expira
    }

    @Override
    public boolean isEnabled() {
        return true; // Usuário sempre ativo
    }

    // --- GETTERS E SETTERS EXPLICÍTOS (Prática de OO) ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }
}