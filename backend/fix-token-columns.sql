-- Arreglar las columnas de tokens para que puedan almacenar tokens más largos
ALTER TABLE usuarios 
ALTER COLUMN token_verificacion TYPE TEXT,
ALTER COLUMN token_recuperacion TYPE TEXT;

-- También arreglar la tabla de sesiones si existe
ALTER TABLE sesiones_usuario 
ALTER COLUMN token_sesion TYPE TEXT;
