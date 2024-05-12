import sql from "mssql";
import jwt from "jsonwebtoken"
import { getConnection } from "../database/connections.js";

/* Login */

export const getclientes = async (req, res) => {  
  if ( req.body.CLI_CUIT && req.body.CLI_PASSWORD){
    console.log(req.body,  "login datos")
  
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", sql.VarChar, req.body.CLI_CUIT)
      .query("SELECT * FROM CLIENTES WHERE CLI_CUIT = @id ");
      if ( result?.recordset[0]){
    
        if (result?.recordset[0]?.CLI_ACTIVO === "SI"){
          if (result.recordset[0].CLI_PASSWORD === req.body.CLI_PASSWORD ){
    
            const data = [{
              "CLI_ID": result.recordset[0].CLI_ID,
              "CLI_CODIGO": result.recordset[0].CLI_CODIGO,
              "CLI_ACTIVO": result.recordset[0].CLI_ACTIVO,
              "CLI_DESCRIPCION": result.recordset[0].CLI_DESCRIPCION,
              "CLI_CUIT": result.recordset[0].CLI_CUIT,
              "CLI_EMAIL": result.recordset[0].CLI_EMAIL,
              "VEN_ID": result.recordset[0].VEN_ID,
              "CLI_PERMITE_PEDIDOS": result.recordset[0].CLI_PERMITE_PEDIDOS,
              "CLI_PERMITE_CTACTE": result.recordset[0].CLI_PERMITE_CTACTE,
              "CLI_PERMITE_MOVIMIENTOS": result.recordset[0].CLI_PERMITE_MOVIMIENTOS,
              "CLI_PERMITE_PRECIOS": result.recordset[0].CLI_PERMITE_PRECIOS,
              "CLI_PERMITE_STOCK": result.recordset[0].CLI_PERMITE_STOCK,
              "CLI_PERMITE_ADICIONALES": result.recordset[0].CLI_PERMITE_ADICIONALES,
              "LPP_ID": result.recordset[0].LPP_ID,
              "CLI_OFERTA_FACTURABLE": result.recordset[0].CLI_OFERTA_FACTURABLE,
              "CLI_DESCUENTO_GRAL": result.recordset[0].CLI_DESCUENTO_GRAL,
              "CLI_NOTAS": result.recordset[0].CLI_NOTAS,
            }
            ]
            const tokenGenerate = jwt.sign(
              data[0], "ClaveSecreta"
            );
            return res.json({token: tokenGenerate}); 
          } else {
            return res.status(500).json({message:"Usuario o contraseña invalida" });
          }
        } else {
          return res.status(501).json( {message:"usuario no activo"});
        }
      } else {
        return res.status(500).json({message:"Usuario o contraseña invalida" });
      }
  }else {
    return res.status(500).json({message:"Los campos no pueden estar vacios" });
  }
  };


  export const getclientesId = async (req, res) => {
    console.log(req.params.id);
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM CLIENTES WHERE CLI_ID = @id ");
    return res.json(result.recordset);
  };