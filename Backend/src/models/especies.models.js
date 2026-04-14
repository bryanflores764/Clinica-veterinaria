const EspeciesQueries = {
  CREATE: `
    INSERT INTO especies (Nombre_Especie)
    VALUES (?)
  `,

  FIND_ALL: `
    SELECT Id, Nombre_Especie
    FROM especies
    ORDER BY Nombre_Especie ASC
  `,

  FIND_BY_ID: `
    SELECT Id, Nombre_Especie
    FROM especies
    WHERE Id = ?
    LIMIT 1
  `,

  UPDATE: `
    UPDATE especies
    SET Nombre_Especie = ?
    WHERE Id = ?
  `,

  DELETE: `
    DELETE FROM especies
    WHERE Id = ?
  `
};

module.exports = EspeciesQueries;