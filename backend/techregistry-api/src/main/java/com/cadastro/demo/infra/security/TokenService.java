package com.cadastro.demo.infra.security;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Date;

import org.springframework.stereotype.Service;
import com.cadastro.demo.entity.Usuario;
import io.jsonwebtoken.security.Keys; // Importante para chaves
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;



/**
 * Classe de serviço de token para a aplicação. Esta classe pode ser usada para gerar, validar e gerenciar tokens de autenticação, como JWT (JSON Web Tokens), que são comumente usados para autenticação em aplicações web.
 * Dependendo dos requisitos da aplicação, esta classe pode incluir métodos para criar tokens com informações do usuário, validar tokens recebidos em requisições HTTP, e extrair informações do token para uso em processos de autenticação e autorização.
 * <-- Gerar Token (JWT)
 * <-- Validar Token
 * <-- Extrair informações do Token
 */
@Service	
// Anotação @Service indica que esta classe é um componente de serviço no contexto
// do Spring, permitindo que seja injetada em outras partes da aplicação onde seja necessário lidar com tokens de autenticação.
public class TokenService {
	
	@Value("${api.security.token.secret:default_secret_key_123}")
    private String secret; // Chave secreta para assinar os tokens (pode ser configurada no application.properties)

    // OO: Recebe o objeto Usuario para extrair o login
    public String gerarToken(Usuario usuario) {
        // Variáveis explícitas para o processo
        String loginUsuario = usuario.getLogin();
        Date dataExpiracao = Date.from(gerarDataExpiracao());
        byte[] chaveSecreta = secret.getBytes();

        return Jwts.builder()
                .setIssuer("TechRegistry-API") // Identifica quem gerou o token
                .setSubject(loginUsuario)      // Dono do token
                .setIssuedAt(new Date())       // Momento da criação
                .setExpiration(dataExpiracao)  // Momento da validade
                .signWith(SignatureAlgorithm.HS256, chaveSecreta) // Assinatura digital
                .compact();
    }

    // Método para validar o token e dizer quem é o usuário (Subject)
    public String getSubject(String tokenJWT) {
        byte[] chaveSecreta = secret.getBytes();
        
        // Abre o token e extrai as informações (Claims)
        Claims claims = Jwts.parser()
                .setSigningKey(chaveSecreta)
                .parseClaimsJws(tokenJWT)
                .getBody();
        
        return claims.getSubject();
    }

    private Instant gerarDataExpiracao() {
        // Define 2 horas de validade no fuso horário de Brasília (-03:00)
        return LocalDateTime.now().plusHours(2).toInstant(ZoneOffset.of("-03:00"));
    }
}