import sql from "mssql";
import { getConnection } from "../database/connections.js";

/* productos id por cliente */
export const geproductosId = async (req, res) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("id", sql.Int, req.params.id)
    .input("lpp", sql.Int, req.params.lpp)
    .query(
     `select p.pre_id, p.pre_codigo_fabrica as codigo, p.mar_id, p.rup_id , p.spr_id, p.pre_notas as notas, p.pre_comentarios as comentarios, r.rup_descripcion as rubro,
      sr.spr_descripcion as super_rubro, dpv.ppa_precio, mp.mar_descripcion as marca_articulo, cdp.cdp_descuento as descuento_producto, 
      p.atributos, p.intercambiables, p.formado_por, p.es_parte_de, cdm.CDM_DESCUENTO as descuento_marca , cdr.cdr_descuento as descuento_rubro, p.pre_stock_actual 
      from PRODUCTOS as p 
      left join MARCAS_PRODUCTOS as mp on p.MAR_ID = mp.MAR_ID 
      join SUPER_RUBROS as sr on p.spr_id = sr.spr_id
      join RUBROS as r on p.rup_id = r.rup_id
      left join DETALLE_LISTA_PRECIOS_VENTA  as dpv on p.PRE_ID = dpv.PRE_ID and p.PRE_ACTIVO = 'SI' 
      left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.MAR_ID = cdm.MAR_ID and cdm.CLI_ID = @id and cdm.CDM_ACTIVO = 'SI' 
      left join CLIENTES_DESC_PRODUCTOS as cdp on  p.PRE_ID = cdp.PRE_ID and cdp.cli_id = @id and cdp.CDP_ACTIVO = 'SI' 
      left join CLIENTES_DESC_RUBROS as cdr on  p.RUP_ID = cdr.RUP_ID  and cdr.cli_id = @id and cdr.CDR_ACTIVO = 'SI' 
      WHERE dpv.LPP_ID = @lpp and p.ventas_ult6meses > 30 order by p.ventas_ult6meses DESC` 
    ); 
  return res.json(result.recordset);
}; //p.ventas_ult6meses > 30 order by p.ventas_ult6meses DESC 

/*productos comparacion para vista de modelos y marcas*/
export const getviewConsult = async (req, res) => {
   const pool = await getConnection();
  const result = await pool
    .request()
    .query(`SELECT * FROM VIEW_CONSULTA_DESCRIPCIONES WHERE PRE_ID < 20  `);
  return res.json( result.recordset);
};

/*buscar productos segun la marca del vehiculo*/
export const getviewConsultAuto = async (req, res) => {
   
    const pool = await getConnection();

   /*1*/ if (req.body.mau_id && !req.body.rud_id  && !req.body.mar_id && !req.body.rubro) {
    console.log("solo auto")

      const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("lpp", sql.Int, req.params.lpp)
      .query(
        `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
        p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
        p.pre_stock_actual, dpv.ppa_precio, p.atributos, p.intercambiables, p.formado_por, p.es_parte_de, p.ventas_ult6meses
        from VIEW_CONSULTA_DESCRIPCIONES as v 
        join DETALLE_LISTA_PRECIOS_VENTA  as dpv on v.pre_id = dpv.pre_id
        join PRODUCTOS as p on v.pre_id = p.pre_id 
        join RUBROS as r on p.rup_id = r.rup_id
        left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.mar_id = cdm.mar_id and cdm.cli_id = @id and cdm.CDM_ACTIVO = 'SI'
        left join CLIENTES_DESC_PRODUCTOS as cdp on  v.pre_id = cdp.pre_id and cdp.cli_id = @id and cdp.CDP_ACTIVO = 'SI'
        left join CLIENTES_DESC_RUBROS as cdr on  p.rup_id = cdr.rup_id  and cdr.cli_id = @id and cdr.CDR_ACTIVO = 'SI'
        WHERE dpv.LPP_ID = @lpp and v.mau_id in (${req.body.mau_id}) order by p.ventas_ult6meses DESC `
      );
      return res.json( result.recordset);
    } 

  /*2*/ if (req.body.mau_id && req.body.rud_id && !req.body.mar_id && !req.body.rubro )
       {
        console.log(req.body.rud_id, "por que")

      const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("lpp", sql.Int, req.params.lpp)
      .query(
        `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
        p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
        p.pre_stock_actual, dpv.ppa_precio, p.atributos, p.intercambiables, p.formado_por, p.es_parte_de, p.ventas_ult6meses
        from VIEW_CONSULTA_DESCRIPCIONES as v 
        join DETALLE_LISTA_PRECIOS_VENTA  as dpv on v.pre_id = dpv.pre_id
        join PRODUCTOS as p on v.pre_id = p.pre_id 
        join RUBROS as r on p.rup_id = r.rup_id
        left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.mar_id = cdm.mar_id and cdm.cli_id = @id and cdm.CDM_ACTIVO = 'SI'
        left join CLIENTES_DESC_PRODUCTOS as cdp on  v.pre_id = cdp.pre_id and cdp.cli_id = @id and cdp.CDP_ACTIVO = 'SI'
        left join CLIENTES_DESC_RUBROS as cdr on  p.rup_id = cdr.rup_id  and cdr.cli_id = @id and cdr.CDR_ACTIVO = 'SI'
        WHERE dpv.LPP_ID = @lpp and v.mau_id in (${req.body.mau_id}) and p.spr_id in (${req.body.rud_id}) order by p.ventas_ult6meses DESC `
      );
      return res.json( result.recordset);
    } 

  /*3*/  if (req.body.mau_id && req.body.rud_id && req.body.mar_id && !req.body.rubro )
    {

      console.log("solo auto. sp, ma")

    const result = await pool
   .request()
   .input("id", sql.Int, req.params.id)
   .input("lpp", sql.Int, req.params.lpp)
   .query(
     `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
     p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
     p.pre_stock_actual, dpv.ppa_precio, p.atributos, p.intercambiables, p.formado_por, p.es_parte_de, p.ventas_ult6meses
     from VIEW_CONSULTA_DESCRIPCIONES as v 
     join DETALLE_LISTA_PRECIOS_VENTA  as dpv on v.pre_id = dpv.pre_id
     join PRODUCTOS as p on v.pre_id = p.pre_id 
     join RUBROS as r on p.rup_id = r.rup_id
     left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.mar_id = cdm.mar_id and cdm.cli_id = @id and cdm.CDM_ACTIVO = 'SI'
     left join CLIENTES_DESC_PRODUCTOS as cdp on  v.pre_id = cdp.pre_id and cdp.cli_id = @id and cdp.CDP_ACTIVO = 'SI'
     left join CLIENTES_DESC_RUBROS as cdr on  p.rup_id = cdr.rup_id  and cdr.cli_id = @id and cdr.CDR_ACTIVO = 'SI'
     WHERE dpv.LPP_ID = @lpp and v.mau_id in (${req.body.mau_id}) 
     and p.spr_id in (${req.body.rud_id}) and p.mar_id in (${req.body.mar_id}) order by p.ventas_ult6meses DESC`
   );
   return res.json( result.recordset); 
 }
/*4*/ if (req.body.mau_id && req.body.rud_id && req.body.mar_id && req.body.rubro ){
  
   const result = await pool
  .request()
  .input("id", sql.Int, req.params.id)
  .input("lpp", sql.Int, req.params.lpp)
  .query(
    `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
    p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
    p.pre_stock_actual, dpv.ppa_precio, p.atributos, p.intercambiables, p.formado_por, p.es_parte_de, p.ventas_ult6meses
    from VIEW_CONSULTA_DESCRIPCIONES as v 
    join DETALLE_LISTA_PRECIOS_VENTA  as dpv on v.pre_id = dpv.pre_id
    join PRODUCTOS as p on v.pre_id = p.pre_id 
    join RUBROS as r on p.rup_id = r.rup_id
    left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.mar_id = cdm.mar_id and cdm.cli_id = @id and cdm.CDM_ACTIVO = 'SI'
    left join CLIENTES_DESC_PRODUCTOS as cdp on  v.pre_id = cdp.pre_id and cdp.cli_id = @id and cdp.CDP_ACTIVO = 'SI'
    left join CLIENTES_DESC_RUBROS as cdr on  p.rup_id = cdr.rup_id  and cdr.cli_id = @id and cdr.CDR_ACTIVO = 'SI'
    WHERE dpv.LPP_ID = @lpp and v.mau_id in (${req.body.mau_id}) and p.spr_id in (${req.body.rud_id})
    and p.mar_id in (${req.body.mar_id}) and v.rubro in ('${req.body.rubro}') order by p.ventas_ult6meses DESC`
  );
  return res.json( result.recordset); 
 }

/*5*/ if (req.body.mau_id && !req.body.rud_id && !req.body.rubro && req.body.mar_id ){
  const result = await pool
  .request()
  .input("id", sql.Int, req.params.id)
  .input("lpp", sql.Int, req.params.lpp)
  .query(
    `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
    p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
    p.pre_stock_actual, dpv.ppa_precio, p.atributos, p.intercambiables, p.formado_por, p.es_parte_de, p.ventas_ult6meses
    from VIEW_CONSULTA_DESCRIPCIONES as v 
    join DETALLE_LISTA_PRECIOS_VENTA  as dpv on v.pre_id = dpv.pre_id
    join PRODUCTOS as p on v.pre_id = p.pre_id 
    join RUBROS as r on p.rup_id = r.rup_id
    left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.mar_id = cdm.mar_id and cdm.cli_id = @id and cdm.CDM_ACTIVO = 'SI'
    left join CLIENTES_DESC_PRODUCTOS as cdp on  v.pre_id = cdp.pre_id and cdp.cli_id = @id and cdp.CDP_ACTIVO = 'SI'
    left join CLIENTES_DESC_RUBROS as cdr on  p.rup_id = cdr.rup_id  and cdr.cli_id = @id and cdr.CDR_ACTIVO = 'SI'
    WHERE dpv.LPP_ID = @lpp and v.mau_id in (${req.body.mau_id}) and p.mar_id in (${req.body.mar_id}) order by p.ventas_ult6meses DESC`
  );
  return res.json( result.recordset); 
 }

 if (req.body.mau_id && req.body.rud_id && !req.body.mar_id && req.body.rubro ){
  
  const result = await pool
 .request()
 .input("id", sql.Int, req.params.id)
 .input("lpp", sql.Int, req.params.lpp)
 .query(
   `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
   p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
   p.pre_stock_actual, dpv.ppa_precio, p.atributos, p.intercambiables, p.formado_por, p.es_parte_de, p.ventas_ult6meses
   from VIEW_CONSULTA_DESCRIPCIONES as v 
   join DETALLE_LISTA_PRECIOS_VENTA  as dpv on v.pre_id = dpv.pre_id
   join PRODUCTOS as p on v.pre_id = p.pre_id 
   join RUBROS as r on p.rup_id = r.rup_id
   left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.mar_id = cdm.mar_id and cdm.cli_id = @id and cdm.CDM_ACTIVO = 'SI'
   left join CLIENTES_DESC_PRODUCTOS as cdp on  v.pre_id = cdp.pre_id and cdp.cli_id = @id and cdp.CDP_ACTIVO = 'SI'
   left join CLIENTES_DESC_RUBROS as cdr on  p.rup_id = cdr.rup_id  and cdr.cli_id = @id and cdr.CDR_ACTIVO = 'SI'
   WHERE dpv.LPP_ID = @lpp and v.mau_id in (${req.body.mau_id}) and p.spr_id in (${req.body.rud_id})
   and v.rubro in ('${req.body.rubro}') order by p.ventas_ult6meses DESC`
 );
 return res.json( result.recordset); 
}




 /*6*/   if (req.body.rud_id && !req.body.mau_id && !req.body.rubro && !req.body.mar_id)
       {
        console.log("solo SP")

       const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("lpp", sql.Int, req.params.lpp)
      .query(
        `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
        p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
        p.pre_stock_actual, dpv.ppa_precio, p.atributos, p.intercambiables, p.formado_por, p.es_parte_de, p.ventas_ult6meses
        from VIEW_CONSULTA_DESCRIPCIONES as v 
        join DETALLE_LISTA_PRECIOS_VENTA  as dpv on v.pre_id = dpv.pre_id
        join PRODUCTOS as p on v.pre_id = p.pre_id 
        join RUBROS as r on p.rup_id = r.rup_id
        left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.mar_id = cdm.mar_id and cdm.cli_id = @id and cdm.CDM_ACTIVO = 'SI'
        left join CLIENTES_DESC_PRODUCTOS as cdp on  v.pre_id = cdp.pre_id and cdp.cli_id = @id and cdp.CDP_ACTIVO = 'SI'
        left join CLIENTES_DESC_RUBROS as cdr on  p.rup_id = cdr.rup_id  and cdr.cli_id = @id and cdr.CDR_ACTIVO = 'SI'
        WHERE dpv.LPP_ID = @lpp and p.spr_id in (${req.body.rud_id}) order by p.ventas_ult6meses DESC`
      );
      return res.json( result.recordset); 
    }

/*7*/    if (req.body.rud_id && req.body.rubro && !req.body.mau_id && !req.body.mar_id ){
  console.log("Sp y rubro")

  const result = await pool
  .request()
  .input("id", sql.Int, req.params.id)
  .input("lpp", sql.Int, req.params.lpp)
  .query(
    `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
    p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
    p.pre_stock_actual, dpv.ppa_precio, p.atributos, p.intercambiables, p.formado_por, p.es_parte_de, p.ventas_ult6meses
    from VIEW_CONSULTA_DESCRIPCIONES as v 
    join DETALLE_LISTA_PRECIOS_VENTA  as dpv on v.pre_id = dpv.pre_id
    join PRODUCTOS as p on v.pre_id = p.pre_id 
    join RUBROS as r on p.rup_id = r.rup_id
    left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.mar_id = cdm.mar_id and cdm.cli_id = @id and cdm.CDM_ACTIVO = 'SI'
    left join CLIENTES_DESC_PRODUCTOS as cdp on  v.pre_id = cdp.pre_id and cdp.cli_id = @id and cdp.CDP_ACTIVO = 'SI'
    left join CLIENTES_DESC_RUBROS as cdr on  p.rup_id = cdr.rup_id  and cdr.cli_id = @id and cdr.CDR_ACTIVO = 'SI'
    WHERE dpv.LPP_ID = @lpp and p.spr_id in (${req.body.rud_id}) and v.rubro in ('${req.body.rubro}') order by p.ventas_ult6meses DESC`
  );
  return res.json( result.recordset);  
     }
/*8*/ if (req.body.rud_id && req.body.rubro  && req.body.mar_id && !req.body.mau_id ){
  const result = await pool
  .request()
  .input("id", sql.Int, req.params.id)
  .input("lpp", sql.Int, req.params.lpp)
  .query(
    `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
    p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
    p.pre_stock_actual, dpv.ppa_precio, p.atributos, p.intercambiables, p.formado_por, p.es_parte_de, p.ventas_ult6meses
    from VIEW_CONSULTA_DESCRIPCIONES as v 
    join DETALLE_LISTA_PRECIOS_VENTA  as dpv on v.pre_id = dpv.pre_id
    join PRODUCTOS as p on v.pre_id = p.pre_id 
    join RUBROS as r on p.rup_id = r.rup_id
    left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.mar_id = cdm.mar_id and cdm.cli_id = @id and cdm.CDM_ACTIVO = 'SI'
    left join CLIENTES_DESC_PRODUCTOS as cdp on  v.pre_id = cdp.pre_id and cdp.cli_id = @id and cdp.CDP_ACTIVO = 'SI'
    left join CLIENTES_DESC_RUBROS as cdr on  p.rup_id = cdr.rup_id  and cdr.cli_id = @id and cdr.CDR_ACTIVO = 'SI'
    WHERE dpv.LPP_ID = @lpp  and p.spr_id in (${req.body.rud_id}) and p.mar_id in (${req.body.mar_id})
    and v.rubro in ('${req.body.rubro}') order by p.ventas_ult6meses DESC`
  );
  return res.json( result.recordset); 

     }
/*9*/   if (req.body.rud_id && !req.body.rubro  && req.body.mar_id && !req.body.mau_id ){
  const result = await pool
  .request()
  .input("id", sql.Int, req.params.id)
  .input("lpp", sql.Int, req.params.lpp)
  .query(
    `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
    p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
    p.pre_stock_actual, dpv.ppa_precio, p.atributos, p.intercambiables, p.formado_por, p.es_parte_de, p.ventas_ult6meses
    from VIEW_CONSULTA_DESCRIPCIONES as v 
    join DETALLE_LISTA_PRECIOS_VENTA  as dpv on v.pre_id = dpv.pre_id
    join PRODUCTOS as p on v.pre_id = p.pre_id 
    join RUBROS as r on p.rup_id = r.rup_id
    left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.mar_id = cdm.mar_id and cdm.cli_id = @id and cdm.CDM_ACTIVO = 'SI'
    left join CLIENTES_DESC_PRODUCTOS as cdp on  v.pre_id = cdp.pre_id and cdp.cli_id = @id and cdp.CDP_ACTIVO = 'SI'
    left join CLIENTES_DESC_RUBROS as cdr on  p.rup_id = cdr.rup_id  and cdr.cli_id = @id and cdr.CDR_ACTIVO = 'SI'
    WHERE dpv.LPP_ID = @lpp and p.spr_id in (${req.body.rud_id}) and p.mar_id in (${req.body.mar_id}) order by p.ventas_ult6meses DESC`
  );
  return res.json( result.recordset);    
     }   
/*10*/   if (req.body.mar_id && !req.body.rud_id && !req.body.mau_id && !req.body.rubro )
    {
    const result = await pool
   .request()
   .input("id", sql.Int, req.params.id)
   .input("lpp", sql.Int, req.params.lpp)
   .query(
     `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
     p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
     p.pre_stock_actual, dpv.ppa_precio, p.atributos, p.intercambiables, p.formado_por, p.es_parte_de, p.ventas_ult6meses
     from VIEW_CONSULTA_DESCRIPCIONES as v 
     join DETALLE_LISTA_PRECIOS_VENTA  as dpv on v.pre_id = dpv.pre_id
     join PRODUCTOS as p on v.pre_id = p.pre_id 
     join RUBROS as r on p.rup_id = r.rup_id
     left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.mar_id = cdm.mar_id and cdm.cli_id = @id and cdm.CDM_ACTIVO = 'SI'
     left join CLIENTES_DESC_PRODUCTOS as cdp on  v.pre_id = cdp.pre_id and cdp.cli_id = @id and cdp.CDP_ACTIVO = 'SI'
     left join CLIENTES_DESC_RUBROS as cdr on  p.rup_id = cdr.rup_id  and cdr.cli_id = @id and cdr.CDR_ACTIVO = 'SI'
     WHERE dpv.LPP_ID = @lpp and  p.mar_id in (${req.body.mar_id}) order by p.ventas_ult6meses DESC`
   );
   return res.json( result.recordset); 
 }

}; 

/* producotos consulta modelo vehiculos */
export const getviewConsultmodelo = async (req, res) => {

  const pool = await getConnection();

    if (req.body.mod_id && !req.body.rubro ){

  const result = await pool 
  .request()
  .input("id", sql.Int, req.params.id)
  .input("lpp", sql.Int, req.params.lpp)
  .query(
    `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
    p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
    p.pre_stock_actual, dpv.ppa_precio,  dpv.ppa_precio, p.atributos, p.intercambiables, p.formado_por, p.es_parte_de, p.ventas_ult6meses
    from VIEW_CONSULTA_DESCRIPCIONES as v 
    join DETALLE_LISTA_PRECIOS_VENTA  as dpv on v.pre_id = dpv.pre_id
    join PRODUCTOS as p on v.pre_id = p.pre_id 
    join RUBROS as r on p.rup_id = r.rup_id
    left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.mar_id = cdm.mar_id and cdm.cli_id = @id and cdm.CDM_ACTIVO = 'SI'
    left join CLIENTES_DESC_PRODUCTOS as cdp on  v.pre_id = cdp.pre_id and cdp.cli_id = @id and cdp.CDP_ACTIVO = 'SI'
    left join CLIENTES_DESC_RUBROS as cdr on  p.rup_id = cdr.rup_id  and cdr.cli_id = @id and cdr.CDR_ACTIVO = 'SI'
    WHERE dpv.LPP_ID = @lpp and v.mod_id in (${req.body.mod_id}) order by p.ventas_ult6meses DESC `
  );
  return res.json( result.recordset);
}

};

/* marcasdeveiculos  */
export const getvehiculos = async (req, res) => {
  const pool = await getConnection();
  const result = await pool.request().query("SELECT * FROM MARCAS_AUTOS WHERE MAU_ACTIVO = 'SI' ");
  res.json(result.recordset);
};

/* modelos de las marcas de vehiculos con su id */
export const getvehiculosmarcaId = async (req, res) => {
  console.log(req.params.id);
  console.log("estamossss aqui")
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("id", sql.Int, req.params.id)
    .query("SELECT * FROM MODELOS WHERE MAU_ID = @id ");
  return res.json(result.recordset);
};


/*Super rubros todos y segun la marca del auto */

export const getrubrosId = async (req, res) => {
  console.log(req.body.mau_id);
  const pool = await getConnection();
  
  if (req.body.mau_id)
  {  
    const result = await pool
    .request()
    .query(`SELECT  DISTINCT  v.super_rubro, p.spr_id  from VIEW_CONSULTA_DESCRIPCIONES as v
    join PRODUCTOS as p on v.pre_id = p.pre_id
    where  mau_id in (${req.body.mau_id})`)
    return res.json(result.recordset);

  } else {
    const result = await pool
    .request()
    .query(`SELECT  DISTINCT  v.super_rubro, p.spr_id  from VIEW_CONSULTA_DESCRIPCIONES as v
    join PRODUCTOS as p on v.pre_id = p.pre_id
    ` )
    return res.json(result.recordset);
  }
};

/*Super todas las marcas y segun el rubro */

export const getmarcaArticulo = async (req, res) => {
const pool = await getConnection();
  
  if ( !req.body?.mau_id  && !req.body.rud_id && !req.body.rubro )
  {  
    const result = await pool
    .request()
    .query(`SELECT  DISTINCT  v.marca_articulo as marca_a , p.mar_id  from VIEW_CONSULTA_DESCRIPCIONES as v 
    join PRODUCTOS as p on v.pre_id = p.pre_id`)
    return res.json(result.recordset);
  } 
  if (req.body?.mau_id  && !req.body.rud_id && !req.body.rubro)
   {
    const result = await pool
    .request()
    .query(`SELECT  DISTINCT  v.marca_articulo as marca_a , p.mar_id  from VIEW_CONSULTA_DESCRIPCIONES as v 
    join PRODUCTOS as p on v.pre_id = p.pre_id  where v.mau_id in (${req.body.mau_id}) `)
    return res.json(result.recordset);
  } 
  if (req.body.rud_id  && !req.body.mau_id && !req.body.rubro){

    const result = await pool
    .request()
    .query(`SELECT  DISTINCT  v.marca_articulo as marca_a , p.mar_id  from VIEW_CONSULTA_DESCRIPCIONES as v 
    join PRODUCTOS as p on v.pre_id = p.pre_id  where p.spr_id in (${req.body.rud_id}) `)
    return res.json(result.recordset);
  }
  if (req.body.rud_id  && req.body.mau_id && !req.body.rubro){

    const result = await pool
    .request()
    .query(`SELECT  DISTINCT  v.marca_articulo as marca_a , p.mar_id  from VIEW_CONSULTA_DESCRIPCIONES as v 
    join PRODUCTOS as p on v.pre_id = p.pre_id  where v.mau_id in (${req.body.mau_id}) and p.spr_id in (${req.body.rud_id}) `)
    return res.json(result.recordset);
  }

  if (req.body.rud_id  &&  !req.body.mau_id && req.body.rubro ){
    console.log("entradndo aqui")

    const result = await pool
    .request()
    .query(`SELECT  DISTINCT  v.marca_articulo as marca_a , p.mar_id  from VIEW_CONSULTA_DESCRIPCIONES as v 
    join PRODUCTOS as p on v.pre_id = p.pre_id  where p.spr_id in (${req.body.rud_id}) and v.rubro in ('${req.body.rubro}') `)
    return res.json(result.recordset);
  }


};

////////// rubros segun su super rubro o marca ///////

export const getrubroArticulo = async (req, res) => {
 
   const pool = await getConnection();
    
    if ( req.body?.mau_id  && req.body.rud_id && !req.body.mar_id  )
    {  
      const result = await pool
      .request()
      .query(`SELECT DISTINCT v.rubro, r.rup_descripcion from VIEW_CONSULTA_DESCRIPCIONES as v
      join Rubros as r on v.rubro = r.rup_codigo
      where v.MAU_ID in (${req.body.mau_id}) and r.spr_id in (${req.body.rud_id})`)
      return res.json(result.recordset); 
    } 
    if (req.body.rud_id &&  !req.body?.mau_id && !req.body.mar_id )
     {
      const result = await pool
      .request()
      .query(`SELECT DISTINCT v.rubro, r.rup_descripcion from VIEW_CONSULTA_DESCRIPCIONES as v
      join Rubros as r on v.rubro = r.rup_codigo
      where r.spr_id in (${req.body.rud_id})`)
      return res.json(result.recordset); 
    } 
   
    if (req.body.rud_id  && req.body.mau_id && req.body.mar_id ){
        const result = await pool
      .request()
      .query(`SELECT DISTINCT v.rubro, r.rup_descripcion from VIEW_CONSULTA_DESCRIPCIONES as v
      join Rubros as r on v.rubro = r.rup_codigo
      join Productos as p on v.pre_id = p.pre_id
      where v.MAU_ID in (${req.body.mau_id}) and r.spr_id in (${req.body.rud_id}) and p.mar_id in (${req.body.mar_id})`)
      return res.json(result.recordset); 
    }
  };
  
///////////


export const getrubrosMod = async (req, res) => {
  const pool = await getConnection();

    const result = await pool
    .request()
    .query(`SELECT  DISTINCT  v.rup_id, r.rup_descripcion from VIEW_CONSULTA_DESCRIPCIONES as v
    join RUBROS  as r on v.rup_id = r.rup_id
    where  v.mod_id in  (${req.body.mod_id})`)
    return res.json(result.recordset);
};

export const getmotorRu = async (req, res) => {

  const pool = await getConnection();

    const result = await pool
    .request() 
    .query(`SELECT  DISTINCT  v.motor from VIEW_CONSULTA_DESCRIPCIONES as v
    where  v.mod_id in (${req.body.mod_id}) and v.rup_id in (${req.body.rubro})   `)
    return res.json(result.recordset);
};
 

// /*prueba productos relacion */

export const busquedaCodigo = async (req, res) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .query("SELECT pre_id, codigo, atributo, valor from VIEW_CONSULTA_ATRIBUTOS WHERE codigo = '636114' ");
  return res.json(result.recordset);
};
