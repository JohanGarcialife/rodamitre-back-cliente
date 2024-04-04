import sql from 'mssql'

const dbSettings = {
    user: "SA", ////este usuario es por defecto, si no te agarra a ti seguro es en minusculas
    password:"Orion.2023*/", /// clave del servidor 
    server:"localhost",
    database: "DB_RODAMITRE_WEB",////nombre de la base de datos
    options: {
        encrypt:true,
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

