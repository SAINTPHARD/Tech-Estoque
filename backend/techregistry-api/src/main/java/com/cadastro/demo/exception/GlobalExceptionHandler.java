package com.cadastro.demo.exception;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.cadastro.demo.exception.ResourceNotFoundException;
import com.cadastro.demo.infra.exception.ApiError;

@RestControllerAdvice
public class GlobalExceptionHandler {

	// 1. Injeção de dependência do Environment para acessar os perfis ativos
    private final Environment environment;

    // 2. Construtor para injeção do Environment
    public GlobalExceptionHandler(Environment environment) {
        this.environment = environment;
    }

    // 3. Tratamento de ResourceNotFoundException com declaração explícita de variáveis
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleResourceNotFound(ResourceNotFoundException ex) {
        HttpStatus statusNaoEncontrado = HttpStatus.NOT_FOUND;
        String mensagemExcecao = ex.getMessage();
        List<String> detalhesVazios = new ArrayList<>(); // OO: lista vazia explícita
        
        return buildResponse(statusNaoEncontrado, mensagemExcecao, detalhesVazios);
    }

    // 4. Tratamento de MethodArgumentNotValidException com declaração explícita de variáveis e uso de stream para coletar erros
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidationErrors(MethodArgumentNotValidException ex) {
        // 1. Declaração explícita de variáveis para status e mensagem padrão
    	HttpStatus statusBadRequest = HttpStatus.BAD_REQUEST;
        String mensagemPadrao = "Erro de validação nos campos do formulário.";
        
        // 2. Criando a lista que vai armazenar as mensagens das anotações (@NotBlank, etc)
        List<String> detalhesVazios = new ArrayList<>(); // OO: lista vazia explícita
        
        // 3.Declaração de variável para a lista de erros detalhados
        List<String> listaDeErros = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.toList());

        // 4. Construção da resposta usando o método centralizador
        return buildResponse(statusBadRequest, mensagemPadrao, listaDeErros);
    }

    // 5. Método centralizador de respostas 
    private ResponseEntity<ApiError> buildResponse(HttpStatus status, String message, List<String> details) {
       
    	// Declaração explícita de tipos antes da construção do objeto
        int codigoHttp = status.value();
        LocalDateTime agora = LocalDateTime.now();
        // List<String> errosParaOConstrutor = details;
        
        // Instanciação da classe ApiError
        ApiError objetoErro = new ApiError(message, codigoHttp, agora, details);

        return ResponseEntity.status(status).body(objetoErro);
    }

    // 6. Método para verificar se o perfil de desenvolvimento está ativo, com declaração explícita de variáveis
    private boolean isDevelopmentProfile() {
        String[] perfisAtivos = environment.getActiveProfiles();
        for (String perfil : perfisAtivos) {
            if ("dev".equalsIgnoreCase(perfil)) return true;
        }
        return perfisAtivos.length == 0;
    }
}