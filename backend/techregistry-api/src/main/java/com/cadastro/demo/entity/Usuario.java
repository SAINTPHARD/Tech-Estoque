package com.cadastro.demo.entity;

import java.time.temporal.ChronoUnit;

/**
 * <-- Entidade JPA que representa a tabela 'usuarios' no banco de dados.
 * <-- Implementa UserDetails para integrar com o ecossistema do Spring Security.
 *   <-- A classe possui os seguintes campos:
 *   - id: Identificador único do usuário (chave primária, auto-incrementada)
 *   - login: O nome de usuário ou email usado para autenticação
 *   - senha: A senha do usuário (armazenada como hash, ex: BCrypt)
 *
 * Implementação UserDetails:
 * - getAuthorities(): retorna as permissões/roles do usuário (ex: ROLE_USER)
 * - getPassword()/getUsername(): retornam os campos usados pelo Spring
 * - isAccountNonExpired/Locked/CredentialsNonExpired/isEnabled:
 *   podem ser customizados para representar o estado da conta.
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

@Entity
@Table(name = "usuarios")
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // login: normalmente email do usuário ou nome de usuário
    private String login;

    // senha: armazenada como hash (ex: BCrypt). Nunca armazenar em texto puro.
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
        // Em sistemas reais, você pode ter uma relação ManyToMany com a tabela roles
        // e retornar as autoridades dinamicamente com base nisso.
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        // Retorna a senha (hash) que será comparada pelo PasswordEncoder
        return this.senha;
    }

    @Override
    public String getUsername() {
        // Aqui usamos o campo 'login' como o username do Spring Security
        return this.login;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Conta nunca expira (padrão). Pode ser customizado.
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Conta nunca é bloqueada (padrão). Pode ser customizado.
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Credenciais nunca expiram (padrão). Pode ser customizado.
    }

    @Override
    public boolean isEnabled() {
        return true; // Usuário sempre ativo (padrão). Pode ser customizado.
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

	public Enum<ChronoUnit> getRole() {
		// TODO Auto-generated method stub
		return null;
	}
}