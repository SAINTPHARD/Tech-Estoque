package com.cadastro.demo.infra.security;

import org.springframework.context.annotation.Configuration;

/*
 * Classe de configuração de segurança para a aplicação. Esta classe pode ser usada para configurar autenticação, autorização e outras políticas de segurança usando Spring Security.
 * Dependendo dos requisitos da aplicação, esta classe pode incluir configurações para autenticação baseada em JWT, OAuth2, ou outras formas de autenticação, bem como regras de autorização para proteger endpoints específicos.
 * <-- Configurações do HTTP (Stateless, CSRF)
 * <-- Configurações de autenticação (JWT, OAuth2, etc.)
 * <- Configurações de autorização (regras para proteger endpoints)
 */

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfigurations {

    private final SecurityFilter securityFilter;

    public SecurityConfigurations(SecurityFilter securityFilter) {
        this.securityFilter = securityFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable()) // Desabilitado pois o JWT já protege contra CSRF
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // API sem estado
            .authorizeHttpRequests(req -> {
                req.requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll(); // Login é público
                req.anyRequest().authenticated(); // Todo o resto precisa de Token
            })
            // Coloca o nosso filtro de Token ANTES do filtro de login padrão do Spring
            .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Define o algoritmo de Hash de senha (BCrypt)
        return new BCryptPasswordEncoder();
    }
}