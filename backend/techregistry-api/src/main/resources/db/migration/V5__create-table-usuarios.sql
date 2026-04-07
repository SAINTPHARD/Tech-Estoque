CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    login VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

-- Opcional: Já inserir um usuário de teste (senha '123456' em BCrypt)
INSERT INTO usuarios (login, senha) 
VALUES ('robedson@puc.com', '$2a$10$Y50UaMFOxteibQEYfDj6oe7.D6RzX3E2yVfTfPB/7yB58DqN6xSy6');