const EstadoCitaQueries = {

  CREATE: `
    INSERT INTO estadocita (Estado)
    VALUES (?)
  `,

  FIND_ALL: `
    SELECT * FROM estadocita
  `,

  FIND_BY_ID: `
    SELECT * FROM estadocita WHERE Id = ? LIMIT 1
  `,

  UPDATE: `
    UPDATE estadocita
    SET Estado = ?
    WHERE Id = ?
  `,

  DELETE: `
    DELETE FROM estadocita
    WHERE Id = ?
  `
};

module.exports = EstadoCitaQueries;