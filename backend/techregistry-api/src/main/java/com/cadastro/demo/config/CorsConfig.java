package com.cadastro.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
/**
 * Configuração de CORS para permitir que o frontend acesse a API sem problemas de bloqueio de origem cruzada.
 * manter esta classe para evitar erros de CORS no Dashboard.
 * @allowedOrigins: Lista de origens permitidas para CORS, injetada a partir do arquivo application.properties. O valor padrão inclui localhost em diferentes portas, o que é útil durante o desenvolvimento.
 * @Value: Permite injetar valores de propriedades do arquivo application.properties. Neste caso, estamos injetando uma lista de origens permitidas para CORS, com um valor padrão que inclui localhost em diferentes portas.
 * @Configuration: Indica que esta classe é uma configuração do Spring, permitindo que ela seja detectada e processada durante a inicialização da aplicação.
 */

@Configuration	
public class CorsConfig implements WebMvcConfigurer {

	private final String[] allowedOrigins;

	public CorsConfig(
			@Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:5174,http://localhost:4173}") String[] allowedOrigins) {
		this.allowedOrigins = allowedOrigins;
	}

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/api/**")					// Aplica CORS a todas as rotas que começam com /api/
				.allowedOriginPatterns(allowedOrigins)	// Permite as origens especificadas no application.properties
				.allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")	// Permite os métodos HTTP comuns usados pela API
				.allowedHeaders("*")					// Permite todos os cabeçalhos, o que é útil para permitir autenticação e outros cabeçalhos personalizados		
				.allowCredentials(true)					// Permite o envio de cookies e credenciais de autenticação
				.maxAge(3600);							// Define o tempo (em segundos) que as respostas pré-flight podem ser armazenadas em cache pelo navegador, reduzindo a necessidade de pré-flight para cada solicitação subsequente
	}
}
