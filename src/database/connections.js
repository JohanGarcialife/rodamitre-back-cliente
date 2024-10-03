import sql from "mssql";

const dbSettings = {
    user: "luis", ////este usuario es por defecto, si no te agarra a ti seguro es en minusculas
    password:"Luis..21", /// clave del servidor 
    server:"10.0.0.105",
    database: "RODAMITRE_WEB_ATIKA",////nombre de la base de datos
    requestTimeout: 300000,
    options: {
        encrypt:false,
        trustServerCertificate: true
    }
}


export const getConnection = async () => {
  try {
    const pool = await sql.connect(dbSettings);
    return pool;
  } catch (error) {
    console.log(error);
  }
};
