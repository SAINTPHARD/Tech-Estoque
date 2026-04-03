package com.cadastro.demo.exception;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.core.env.Environment;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	private final Environment environment;

	public GlobalExceptionHandler(Environment environment) {
		this.environment = environment;
	}

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<ApiErrorResponse> handleResourceNotFound(ResourceNotFoundException exception) {
		return buildResponse(HttpStatus.NOT_FOUND, exception.getMessage(), List.of());
	}

	@ExceptionHandler(NoResourceFoundException.class)
	public ResponseEntity<ApiErrorResponse> handleNoResourceFound(NoResourceFoundException exception) {
		return buildResponse(
				HttpStatus.NOT_FOUND,
				"Rota nao encontrada.",
				List.of("Recurso solicitado: " + exception.getResourcePath()));
	}

	@ExceptionHandler(NoHandlerFoundException.class)
	public ResponseEntity<ApiErrorResponse> handleNoHandlerFound(NoHandlerFoundException exception) {
		return buildResponse(
				HttpStatus.NOT_FOUND,
				"Rota nao encontrada.",
				List.of(exception.getHttpMethod() + " " + exception.getRequestURL()));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiErrorResponse> handleMethodArgumentNotValid(MethodArgumentNotValidException exception) {
		List<String> details = exception.getBindingResult()
				.getFieldErrors()
				.stream()
				.map(this::formatFieldError)
				.toList();

		return buildResponse(HttpStatus.BAD_REQUEST, "Os dados enviados sao invalidos.", details);
	}

	@ExceptionHandler({
			IllegalArgumentException.class,
			HttpMessageNotReadableException.class,
			ConstraintViolationException.class
	})
	public ResponseEntity<ApiErrorResponse> handleBadRequest(Exception exception) {
		return buildResponse(HttpStatus.BAD_REQUEST, exception.getMessage(), List.of());
	}

	@ExceptionHandler(DataAccessException.class)
	public ResponseEntity<ApiErrorResponse> handleDataAccess(DataAccessException exception) {
		return buildResponse(
				HttpStatus.INTERNAL_SERVER_ERROR,
				"Falha ao acessar os dados da aplicacao.",
				buildUnexpectedDetails(exception));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiErrorResponse> handleUnexpected(Exception exception) {
		return buildResponse(
				HttpStatus.INTERNAL_SERVER_ERROR,
				"Ocorreu um erro inesperado.",
				buildUnexpectedDetails(exception));
	}

	private ResponseEntity<ApiErrorResponse> buildResponse(HttpStatus status, String message, List<String> details) {
		ApiErrorResponse response = new ApiErrorResponse(
				LocalDateTime.now(),
				status.value(),
				status.getReasonPhrase(),
				message,
				details);

		return ResponseEntity.status(status).body(response);
	}

	private String formatFieldError(FieldError fieldError) {
		return fieldError.getField() + ": " + fieldError.getDefaultMessage();
	}

	private List<String> buildUnexpectedDetails(Exception exception) {
		if (!isDevelopmentProfile()) {
			return List.of();
		}

		String rootMessage = exception.getMessage();
		String detail = exception.getClass().getSimpleName();

		if (rootMessage != null && !rootMessage.isBlank()) {
			detail += ": " + rootMessage;
		}

		return List.of(detail);
	}

	private boolean isDevelopmentProfile() {
		for (String profile : environment.getActiveProfiles()) {
			if ("dev".equalsIgnoreCase(profile) || "test".equalsIgnoreCase(profile)) {
				return true;
			}
		}

		return environment.getActiveProfiles().length == 0;
	}
}
