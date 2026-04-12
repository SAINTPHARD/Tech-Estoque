-- Arquivo: V7__update-user-passwords-to-bcrypt.sql
-- Objetivo: Atualizar senhas de texto plano para Hash BCrypt (senha: 123456)

UPDATE usuarios 
SET senha = '$2a$10$Y50UaMFOxteibQEYfDj6C.S0v9SlyyL4r7p3E0E/oH3F0f.p/WJYK' 
WHERE login = 'robedson@puc.com';