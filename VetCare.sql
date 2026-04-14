DESCRIBE roles;
SELECT * FROM roles;
SELECT * FROM usuarios;

-- Insertar roles
INSERT INTO roles (Nombre_Rol) VALUES ('Administrador');
INSERT INTO roles (Nombre_Rol) VALUES ('Veterinario');
INSERT INTO roles (Nombre_Rol) VALUES ('Recepcionista');

-- Insertar usuario administrador (contraseña: admin123)
INSERT INTO usuarios (Nombre_Usuario, Correo, Contrasena, RolId, activo) 
VALUES ('admin', 'admin@vetcare.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 1, 1);

UPDATE usuarios 
SET Contrasena = '$2b$10$O/984eV5DNDTRmgpQIHg3O79q2OzeEWdTwuysnTvkNfV.K7Gl9z7W' 
WHERE Nombre_Usuario = 'admin';

SELECT * FROM usuarios;

UPDATE usuarios 
SET Contrasena = '$2b$10$O/984eV5DNDTRmgpQIHg3O79q2OzeEWdTwuysnTvkNfV.K7Gl9z7W' 
WHERE id = 1;