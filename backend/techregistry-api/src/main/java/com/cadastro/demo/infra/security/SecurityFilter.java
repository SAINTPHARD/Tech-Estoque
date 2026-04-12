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

		// 1. Tenta recuperar o Token
		String tokenJWT = recuperarToken(request);

		try {
			if (tokenJWT != null) {
				// 2. Valida o token
				String login = tokenService.getSubject(tokenJWT);

				// 3. Busca o usuário
				UserDetails usuario = repository.findByLogin(login);

				if (usuario != null) {
					// 4. Autentica no contexto do Spring
					var authentication = new UsernamePasswordAuthenticationToken(usuario, null,
							usuario.getAuthorities());
					SecurityContextHolder.getContext().setAuthentication(authentication);
				}
			}
		} catch (Exception e) {
			// Se o token for inválido, expirado ou malformado, limpamos o contexto
			// mas NÃO travamos a requisição. O login (que não tem token) precisa passar por
			// aqui.
			SecurityContextHolder.clearContext();
		}

		// 5. VITAL: Segue o fluxo. Se for /login, o Spring deixará passar
		// porque configuramos .permitAll() lá na outra classe.
		filterChain.doFilter(request, response);
	}

	private String recuperarToken(HttpServletRequest request) {
		String authorizationHeader = request.getHeader("Authorization");

		// Verificação robusta: evita NullPointerException e garante o prefixo Bearer
		if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
			return authorizationHeader.substring(7); // Remove "Bearer " (7 caracteres)
		}

		return null;
	}
}