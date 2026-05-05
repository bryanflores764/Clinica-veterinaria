const CategoriasQueries = {

  CREATE: `
    INSERT INTO categorias (Nombre_Categoria)
    VALUES (?)
  `,

  FIND_ALL: `
    SELECT Id, Nombre_Categoria
    FROM categorias
    ORDER BY Nombre_Categoria ASC
  `,

  FIND_BY_ID: `
    SELECT Id, Nombre_Categoria
    FROM categorias
    WHERE Id = ?
  `,

  UPDATE: `
    UPDATE categorias
    SET Nombre_Categoria = ?
    WHERE Id = ?
  `,

  DELETE: `
    DELETE FROM categorias
    WHERE Id = ?
  `
};

module.exports = CategoriasQueries;