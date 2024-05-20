import sql from 'mssql'

const dbSettings = {
    user: "SA", ////este usuario es por defecto, si no te agarra a ti seguro es en minusculas
    password:"4L3x_R0m4n", /// clave del servidor 
    server:"10.0.0.237",
    database: "DB_RODAMITRE_WEB_20241605",////nombre de la base de datos
    requestTimeout: 300000,
    options: {
        encrypt:false,
        trustServerCertificate: true
    }
}


export const getConnection = async () => {
    try { 
const pool = await sql.connect(dbSettings)
    return pool;
    } catch (error){
        console.log(error)
    }   
}

