package com.cadastro.demo.infra.exception;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Classe para padronizar as respostas de erro da API.
 * Para testar tentar salvar um produto com o nome vazio no seu Dashboard, 
 * o backend agora vai devolver um JSON estruturado com todos os erros de validação 
 * colocado nas anotações @NotBlank e @Size do DTO!
 * 
 * Classe para padronizar as respostas de erro da API.
 * * --- CENÁRIOS DE TESTE ---
 * * 1. ERRO DE VALIDAÇÃO (400 Bad Request):
 * Teste: Tentar salvar um produto com campos vazios ou inválidos no Dashboard.
 * Resposta esperada:
 * {
 * "message": "Erro de validação nos campos do formulário.",
 * "status": 400,
 * "timestamp": "2026-04-03T19:45:00",
 * "errors": [
 * "nome: O nome do produto é obrigatório.",
 * "preco: O preço do produto deve ser um valor positivo."
 * ]
 * }
 * * 2. RECURSO NÃO ENCONTRADO (404 Not Found):
 * Teste: Acessar uma URL com ID inexistente, ex: /api/products/999.
 * Resposta esperada:
 * {
 * "message": "Produto com ID 999 não encontrado.",
 * "status": 404,
 * "timestamp": "2026-04-03T19:46:00",
 * "errors": []
 * }
 * * 3. ERRO DE REGRA DE NEGÓCIO (400 Bad Request):
 * Teste: Tentar reduzir o estoque via PATCH usando um valor que deixaria o saldo negativo.
 * Resposta esperada:
 * {
 * "message": "Não é possível reduzir o estoque abaixo de zero.",
 * "status": 400,
 * "timestamp": "2026-04-03T19:47:00",
 * "errors": []
 * }
 * * 4. ERRO INTERNO / BANCO DE DADOS (500 Internal Server Error):
 * Teste: Simular queda do PostgreSQL ou erro de sintaxe no Flyway.
 * Resposta esperada:
 * {
 * "message": "Falha ao acessar os dados da aplicação.",
 * "status": 500,
 * "timestamp": "2026-04-03T19:48:00",
 * "errors": ["DataAccessException: Connection refused"] (Apenas em perfil 'dev')
 * }
 */

public class ApiError {

    private String message;
    private int status;
    private LocalDateTime timestamp;
    private List<String> errors;

    //  Construtor principal (com lista de erros)
    public ApiError(String message, int status, LocalDateTime timestamp, List<String> errors) {

        this.message = message;
        this.status = status;
        this.timestamp = timestamp;
        this.errors = (errors != null) ? errors : List.of();
    }

    //  Construtor auxiliar (sem erros)
    public ApiError(String message, int status, LocalDateTime timestamp) {
        this(message, status, timestamp, List.of());
    }

    // Getters
    public String getMessage() {
        return message;
    }

    public int getStatus() {
        return status;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public List<String> getErrors() {
        return errors;
    }
}