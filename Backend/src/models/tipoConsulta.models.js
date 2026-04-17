const TipoConsultaQueries = {

  CREATE: `
    INSERT INTO tipoconsulta (Tipo_Consulta)
    VALUES (?)
  `,

  FIND_ALL: `
    SELECT * FROM tipoconsulta
  `,

  FIND_BY_ID: `
    SELECT * FROM tipoconsulta WHERE Id = ? LIMIT 1
  `,

  UPDATE: `
    UPDATE tipoconsulta
    SET Tipo_Consulta = ?
    WHERE Id = ?
  `,

  DELETE: `
    DELETE FROM tipoconsulta
    WHERE Id = ?
  `
};

module.exports = TipoConsultaQueries;