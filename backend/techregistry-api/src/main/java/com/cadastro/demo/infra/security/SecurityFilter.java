package com.cadastro.demo.infra.security;
/**
 * Classe de filtro de segurança para a aplicação. Esta classe pode ser usada para interceptar requisições HTTP e aplicar regras de segurança, como autenticação e autorização, antes que as requisições alcancem os controladores da aplicação.
 * <-- O Filtro que intercepta o Token,  JWT e valida a autenticação do usuário
 * <-- Configurações para aplicar o filtro em rotas específicas ou globalmente
 * <-- Lógica para extrair o token da requisição, validar o token e configurar o contexto de segurança do Spring Security com as informações do usuário autenticado
 */

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.cadastro.demo.repository.UsuarioRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final UsuarioRepository repository;

    // Injeção via construtor (Boa prática OO)
    public SecurityFilter(TokenService tokenService, UsuarioRepository repository) {
        this.tokenService = tokenService;
        this.repository = repository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // 1. Tenta recuperar o Token do cabeçalho
        String tokenJWT = recuperarToken(request);

        if (tokenJWT != null) {
            // 2. Valida o token e descobre o login do usuário
            String login = tokenService.getSubject(tokenJWT);
            
            // 3. Busca o usuário no banco para garantir que ele ainda existe
            UserDetails usuario = repository.findByLogin(login);

            // 4. Autentica o usuário "forçadamente" no contexto do Spring para esta requisição
            var authentication = new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 5. Segue o fluxo para o próximo filtro ou para o Controller
        filterChain.doFilter(request, response);
    }

    private String recuperarToken(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        
        if (authorizationHeader != null) {
            // O padrão do cabeçalho é: "Bearer <token>"
            return authorizationHeader.replace("Bearer ", "");
        }
        
        return null;
    }
}
