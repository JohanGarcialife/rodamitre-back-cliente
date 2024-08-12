import sql from "mssql";
import { getConnection } from "../database/connections.js";

export const getgarantiaId = async (req, res) => {
    console.log(req.params.id);
    const pool = await getConnection();
   const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query(`SELECT * from GARANTIAS g WHERE CLI_ID = @id ORDER BY Numero DESC `);
    return res.json(result.recordset); 
  };