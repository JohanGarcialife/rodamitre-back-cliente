import sql from "mssql";

const dbSettings = {
  user: "sa", ////este usuario es por defecto, si no te agarra a ti seguro es en minusculas
  password: "24656399", /// clave del servidor
  server: "localhost",
  database: "RODAMITRE_WEB_ATIKA", ////nombre de la base de datos
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

export const getConnection = async () => {
  try {
    const pool = await sql.connect(dbSettings);
    return pool;
  } catch (error) {
    console.log(error);
  }
};
