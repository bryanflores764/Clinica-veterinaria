const TipoConsultaQueries = {

  CREATE: `
    INSERT INTO tipoconsulta (Tipo_Consulta, Descripcion, Precio)
    VALUES (?, ?, ?)
  `,

  FIND_ALL: `
    SELECT Id, Tipo_Consulta, Descripcion, Precio
    FROM tipoconsulta
    ORDER BY Tipo_Consulta ASC
  `,

  FIND_BY_ID: `
    SELECT Id, Tipo_Consulta, Descripcion, Precio
    FROM tipoconsulta
    WHERE Id = ?
    LIMIT 1
  `,

  FIND_BY_NAME: `
    SELECT Id FROM tipoconsulta
    WHERE LOWER(Tipo_Consulta) = LOWER(?)
    LIMIT 1
  `,

  UPDATE: `
    UPDATE tipoconsulta
    SET Tipo_Consulta = ?, Descripcion = ?, Precio = ?
    WHERE Id = ?
  `,

  DELETE: `
    DELETE FROM tipoconsulta
    WHERE Id = ?
  `
};

module.exports = TipoConsultaQueries;