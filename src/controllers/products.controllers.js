import sql from "mssql";
import { getConnection } from "../database/connections.js";

/* productos id por cliente */
export const geproductosId = async (req, res) => {
  const pool = await getConnection();
  const result = await /*  .query(
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
    );  */
  pool
    .request()
    .input("id", sql.Int, req.params.id)
    .input("lpp", sql.Int, req.params.lpp)
    .query(`select p.pre_id, p.pre_codigo_fabrica as codigo, p.mar_id, p.rup_id , p.spr_id, p.pre_notas as notas, p.pre_comentarios as comentarios, 
      r.rup_descripcion as rubro, sr.spr_descripcion as super_rubro, mp.mar_descripcion as marca_articulo, p.intercambiables, p.formado_por, p.es_parte_de,
      (select a.atr_descripcion, pa.pra_valor from ATRIBUTOS a, productos_atributos pa where pa.atr_id = a.atr_id 
	  and pa.pre_id = p.PRE_ID  FOR JSON PATH ) as atributos,(select distinct v.marca_auto, v.modelo, (select distinct descripcion_completa as descripcion 
      from VIEW_CONSULTA_DESCRIPCIONES vr where v.marca_auto = vr.marca_auto and v.modelo = vr.modelo and vr.pre_id= p.pre_id FOR JSON PATH) as hover
      from VIEW_CONSULTA_DESCRIPCIONES v where p.pre_id = v.pre_id FOR JSON PATH ) as aplicaciones,
      cdp.cdp_descuento as descuento_producto,cdm.CDM_DESCUENTO as descuento_marca , cdr.cdr_descuento as descuento_rubro, dpv.ppa_precio, p.pre_stock_actual 
      from PRODUCTOS as p  
      left join MARCAS_PRODUCTOS as mp on p.MAR_ID = mp.MAR_ID 
      join SUPER_RUBROS as sr on p.spr_id = sr.spr_id
      join RUBROS as r on p.rup_id = r.rup_id
      left join DETALLE_LISTA_PRECIOS_VENTA  as dpv on p.PRE_ID = dpv.PRE_ID and p.PRE_ACTIVO = 'SI' 
      left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.MAR_ID = cdm.MAR_ID and cdm.CLI_ID = @id and cdm.CDM_ACTIVO = 'SI' 
      left join CLIENTES_DESC_PRODUCTOS as cdp on  p.PRE_ID = cdp.PRE_ID and cdp.cli_id = @id and cdp.CDP_ACTIVO = 'SI' 
      left join CLIENTES_DESC_RUBROS as cdr on  p.RUP_ID = cdr.RUP_ID  and cdr.cli_id = @id and cdr.CDR_ACTIVO = 'SI' 
      WHERE dpv.LPP_ID = @lpp and  p.ventas_ult6meses > 30 order by p.ventas_ult6meses DESC`);
  return res.json(result.recordset);
}; //p.ventas_ult6meses > 30 order by p.ventas_ult6meses DESC

/*buscar productos segun la marca del vehiculo*/
export const getviewConsultAuto = async (req, res) => {
  const pool = await getConnection();

  /*1*/ if (
    req.body.mau_id &&
    !req.body.rud_id &&
    !req.body.mar_id &&
    !req.body.rubro
  ) {
    console.log("solo auto");

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("lpp", sql.Int, req.params.lpp)
      .query(
        `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
        p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
        p.pre_stock_actual, dpv.ppa_precio, p.intercambiables, p.formado_por, p.es_parte_de,
        (select a.atr_descripcion, pa.pra_valor from ATRIBUTOS a, productos_atributos pa where pa.atr_id = a.atr_id 
        and pa.pre_id = p.PRE_ID  FOR JSON PATH ) as atributos,(select distinct v.marca_auto, v.modelo, (select distinct descripcion_completa as descripcion 
        from VIEW_CONSULTA_DESCRIPCIONES vr where v.marca_auto = vr.marca_auto and v.modelo = vr.modelo and vr.pre_id= p.pre_id FOR JSON PATH) as hover
        from VIEW_CONSULTA_DESCRIPCIONES v where p.pre_id = v.pre_id FOR JSON PATH ) as aplicaciones,
        p.ventas_ult6meses
        from VIEW_CONSULTA_DESCRIPCIONES as v 
        join DETALLE_LISTA_PRECIOS_VENTA  as dpv on v.pre_id = dpv.pre_id
        join PRODUCTOS as p on v.pre_id = p.pre_id 
        join RUBROS as r on p.rup_id = r.rup_id
        left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.mar_id = cdm.mar_id and cdm.cli_id = @id and cdm.CDM_ACTIVO = 'SI'
        left join CLIENTES_DESC_PRODUCTOS as cdp on  v.pre_id = cdp.pre_id and cdp.cli_id = @id and cdp.CDP_ACTIVO = 'SI'
        left join CLIENTES_DESC_RUBROS as cdr on  p.rup_id = cdr.rup_id  and cdr.cli_id = @id and cdr.CDR_ACTIVO = 'SI'
        WHERE dpv.LPP_ID = @lpp and v.mau_id in (${req.body.mau_id}) order by p.ventas_ult6meses DESC `
      );
    return res.json(result.recordset);
  }

  /*2*/ if (
    req.body.mau_id &&
    req.body.rud_id &&
    !req.body.mar_id &&
    !req.body.rubro
  ) {
    console.log(req.body.rud_id, "por que");

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("lpp", sql.Int, req.params.lpp)
      .query(
        `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
        p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
        p.pre_stock_actual, dpv.ppa_precio, p.intercambiables, p.formado_por, p.es_parte_de,
        (select a.atr_descripcion, pa.pra_valor from ATRIBUTOS a, productos_atributos pa where pa.atr_id = a.atr_id 
        and pa.pre_id = p.PRE_ID  FOR JSON PATH ) as atributos,(select distinct v.marca_auto, v.modelo, (select distinct descripcion_completa as descripcion 
        from VIEW_CONSULTA_DESCRIPCIONES vr where v.marca_auto = vr.marca_auto and v.modelo = vr.modelo and vr.pre_id= p.pre_id FOR JSON PATH) as hover
        from VIEW_CONSULTA_DESCRIPCIONES v where p.pre_id = v.pre_id FOR JSON PATH ) as aplicaciones,
        p.ventas_ult6meses
        from VIEW_CONSULTA_DESCRIPCIONES as v 
        join DETALLE_LISTA_PRECIOS_VENTA  as dpv on v.pre_id = dpv.pre_id
        join PRODUCTOS as p on v.pre_id = p.pre_id 
        join RUBROS as r on p.rup_id = r.rup_id
        left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.mar_id = cdm.mar_id and cdm.cli_id = @id and cdm.CDM_ACTIVO = 'SI'
        left join CLIENTES_DESC_PRODUCTOS as cdp on  v.pre_id = cdp.pre_id and cdp.cli_id = @id and cdp.CDP_ACTIVO = 'SI'
        left join CLIENTES_DESC_RUBROS as cdr on  p.rup_id = cdr.rup_id  and cdr.cli_id = @id and cdr.CDR_ACTIVO = 'SI'
        WHERE dpv.LPP_ID = @lpp and v.mau_id in (${req.body.mau_id}) and p.spr_id in (${req.body.rud_id}) order by p.ventas_ult6meses DESC `
      );
    return res.json(result.recordset);
  }

  /*3*/ if (
    req.body.mau_id &&
    req.body.rud_id &&
    req.body.mar_id &&
    !req.body.rubro
  ) {
    console.log("solo auto. sp, ma");

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("lpp", sql.Int, req.params.lpp)
      .query(
        `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
     p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
     p.pre_stock_actual, dpv.ppa_precio, p.intercambiables, p.formado_por, p.es_parte_de, 
     (select a.atr_descripcion, pa.pra_valor from ATRIBUTOS a, productos_atributos pa where pa.atr_id = a.atr_id 
     and pa.pre_id = p.PRE_ID  FOR JSON PATH ) as atributos,(select distinct v.marca_auto, v.modelo, (select distinct descripcion_completa as descripcion 
     from VIEW_CONSULTA_DESCRIPCIONES vr where v.marca_auto = vr.marca_auto and v.modelo = vr.modelo and vr.pre_id= p.pre_id FOR JSON PATH) as hover
     from VIEW_CONSULTA_DESCRIPCIONES v where p.pre_id = v.pre_id FOR JSON PATH ) as aplicaciones,
     p.ventas_ult6meses
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
    return res.json(result.recordset);
  }
  /*4*/ if (
    req.body.mau_id &&
    req.body.rud_id &&
    req.body.mar_id &&
    req.body.rubro
  ) {
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("lpp", sql.Int, req.params.lpp)
      .query(
        `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
    p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
    p.pre_stock_actual, dpv.ppa_precio, p.intercambiables, p.formado_por, p.es_parte_de,
    (select a.atr_descripcion, pa.pra_valor from ATRIBUTOS a, productos_atributos pa where pa.atr_id = a.atr_id 
    and pa.pre_id = p.PRE_ID  FOR JSON PATH ) as atributos,(select distinct v.marca_auto, v.modelo, (select distinct descripcion_completa as descripcion 
    from VIEW_CONSULTA_DESCRIPCIONES vr where v.marca_auto = vr.marca_auto and v.modelo = vr.modelo and vr.pre_id= p.pre_id FOR JSON PATH) as hover
    from VIEW_CONSULTA_DESCRIPCIONES v where p.pre_id = v.pre_id FOR JSON PATH ) as aplicaciones,
    p.ventas_ult6meses
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
    return res.json(result.recordset);
  }

  /*5*/ if (
    req.body.mau_id &&
    !req.body.rud_id &&
    !req.body.rubro &&
    req.body.mar_id
  ) {
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("lpp", sql.Int, req.params.lpp)
      .query(
        `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
    p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
    p.pre_stock_actual, dpv.ppa_precio, p.intercambiables, p.formado_por, p.es_parte_de,
    (select a.atr_descripcion, pa.pra_valor from ATRIBUTOS a, productos_atributos pa where pa.atr_id = a.atr_id 
    and pa.pre_id = p.PRE_ID  FOR JSON PATH ) as atributos,(select distinct v.marca_auto, v.modelo, (select distinct descripcion_completa as descripcion 
    from VIEW_CONSULTA_DESCRIPCIONES vr where v.marca_auto = vr.marca_auto and v.modelo = vr.modelo and vr.pre_id= p.pre_id FOR JSON PATH) as hover
    from VIEW_CONSULTA_DESCRIPCIONES v where p.pre_id = v.pre_id FOR JSON PATH ) as aplicaciones,
    p.ventas_ult6meses
    from VIEW_CONSULTA_DESCRIPCIONES as v 
    join DETALLE_LISTA_PRECIOS_VENTA  as dpv on v.pre_id = dpv.pre_id
    join PRODUCTOS as p on v.pre_id = p.pre_id 
    join RUBROS as r on p.rup_id = r.rup_id
    left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.mar_id = cdm.mar_id and cdm.cli_id = @id and cdm.CDM_ACTIVO = 'SI'
    left join CLIENTES_DESC_PRODUCTOS as cdp on  v.pre_id = cdp.pre_id and cdp.cli_id = @id and cdp.CDP_ACTIVO = 'SI'
    left join CLIENTES_DESC_RUBROS as cdr on  p.rup_id = cdr.rup_id  and cdr.cli_id = @id and cdr.CDR_ACTIVO = 'SI'
    WHERE dpv.LPP_ID = @lpp and v.mau_id in (${req.body.mau_id}) and p.mar_id in (${req.body.mar_id}) order by p.ventas_ult6meses DESC`
      );
    return res.json(result.recordset);
  }

  if (
    req.body.mau_id &&
    req.body.rud_id &&
    !req.body.mar_id &&
    req.body.rubro
  ) {
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("lpp", sql.Int, req.params.lpp)
      .query(
        `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
   p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
   p.pre_stock_actual, dpv.ppa_precio, p.intercambiables, p.formado_por, p.es_parte_de,
   (select a.atr_descripcion, pa.pra_valor from ATRIBUTOS a, productos_atributos pa where pa.atr_id = a.atr_id 
   and pa.pre_id = p.PRE_ID  FOR JSON PATH ) as atributos,(select distinct v.marca_auto, v.modelo, (select distinct descripcion_completa as descripcion 
   from VIEW_CONSULTA_DESCRIPCIONES vr where v.marca_auto = vr.marca_auto and v.modelo = vr.modelo and vr.pre_id= p.pre_id FOR JSON PATH) as hover
   from VIEW_CONSULTA_DESCRIPCIONES v where p.pre_id = v.pre_id FOR JSON PATH ) as aplicaciones,
   p.ventas_ult6meses
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
    return res.json(result.recordset);
  }

  /*6*/ if (
    req.body.rud_id &&
    !req.body.mau_id &&
    !req.body.rubro &&
    !req.body.mar_id
  ) {
    console.log("solo SP");

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("lpp", sql.Int, req.params.lpp)
      .query(
        `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
        p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
        p.pre_stock_actual, dpv.ppa_precio, p.intercambiables, p.formado_por, p.es_parte_de, 
        (select a.atr_descripcion, pa.pra_valor from ATRIBUTOS a, productos_atributos pa where pa.atr_id = a.atr_id 
        and pa.pre_id = p.PRE_ID  FOR JSON PATH ) as atributos,(select distinct v.marca_auto, v.modelo, (select distinct descripcion_completa as descripcion 
        from VIEW_CONSULTA_DESCRIPCIONES vr where v.marca_auto = vr.marca_auto and v.modelo = vr.modelo and vr.pre_id= p.pre_id FOR JSON PATH) as hover
        from VIEW_CONSULTA_DESCRIPCIONES v where p.pre_id = v.pre_id FOR JSON PATH ) as aplicaciones,
        p.ventas_ult6meses
        from VIEW_CONSULTA_DESCRIPCIONES as v 
        join DETALLE_LISTA_PRECIOS_VENTA  as dpv on v.pre_id = dpv.pre_id
        join PRODUCTOS as p on v.pre_id = p.pre_id 
        join RUBROS as r on p.rup_id = r.rup_id
        left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.mar_id = cdm.mar_id and cdm.cli_id = @id and cdm.CDM_ACTIVO = 'SI'
        left join CLIENTES_DESC_PRODUCTOS as cdp on  v.pre_id = cdp.pre_id and cdp.cli_id = @id and cdp.CDP_ACTIVO = 'SI'
        left join CLIENTES_DESC_RUBROS as cdr on  p.rup_id = cdr.rup_id  and cdr.cli_id = @id and cdr.CDR_ACTIVO = 'SI'
        WHERE dpv.LPP_ID = @lpp and p.spr_id in (${req.body.rud_id}) order by p.ventas_ult6meses DESC`
      );
    return res.json(result.recordset);
  }

  /*7*/ if (
    req.body.rud_id &&
    req.body.rubro &&
    !req.body.mau_id &&
    !req.body.mar_id
  ) {
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("lpp", sql.Int, req.params.lpp)
      .query(
        `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
    p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
    p.pre_stock_actual, dpv.ppa_precio, p.intercambiables, p.formado_por, p.es_parte_de, 
    (select a.atr_descripcion, pa.pra_valor from ATRIBUTOS a, productos_atributos pa where pa.atr_id = a.atr_id 
    and pa.pre_id = p.PRE_ID  FOR JSON PATH ) as atributos,(select distinct v.marca_auto, v.modelo, (select distinct descripcion_completa as descripcion 
    from VIEW_CONSULTA_DESCRIPCIONES vr where v.marca_auto = vr.marca_auto and v.modelo = vr.modelo and vr.pre_id= p.pre_id FOR JSON PATH) as hover
    from VIEW_CONSULTA_DESCRIPCIONES v where p.pre_id = v.pre_id FOR JSON PATH ) as aplicaciones,
    p.ventas_ult6meses
    from VIEW_CONSULTA_DESCRIPCIONES as v 
    join DETALLE_LISTA_PRECIOS_VENTA  as dpv on v.pre_id = dpv.pre_id
    join PRODUCTOS as p on v.pre_id = p.pre_id 
    join RUBROS as r on p.rup_id = r.rup_id
    left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.mar_id = cdm.mar_id and cdm.cli_id = @id and cdm.CDM_ACTIVO = 'SI'
    left join CLIENTES_DESC_PRODUCTOS as cdp on  v.pre_id = cdp.pre_id and cdp.cli_id = @id and cdp.CDP_ACTIVO = 'SI'
    left join CLIENTES_DESC_RUBROS as cdr on  p.rup_id = cdr.rup_id  and cdr.cli_id = @id and cdr.CDR_ACTIVO = 'SI'
    WHERE dpv.LPP_ID = @lpp and p.spr_id in (${req.body.rud_id}) and v.rubro in ('${req.body.rubro}') order by p.ventas_ult6meses DESC`
      );
    return res.json(result.recordset);
  }
  /*8*/ if (
    req.body.rud_id &&
    req.body.rubro &&
    req.body.mar_id &&
    !req.body.mau_id
  ) {
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("lpp", sql.Int, req.params.lpp)
      .query(
        `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
    p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
    p.pre_stock_actual, dpv.ppa_precio, p.intercambiables, p.formado_por, p.es_parte_de,
    (select a.atr_descripcion, pa.pra_valor from ATRIBUTOS a, productos_atributos pa where pa.atr_id = a.atr_id 
    and pa.pre_id = p.PRE_ID  FOR JSON PATH ) as atributos,(select distinct v.marca_auto, v.modelo, (select distinct descripcion_completa as descripcion 
    from VIEW_CONSULTA_DESCRIPCIONES vr where v.marca_auto = vr.marca_auto and v.modelo = vr.modelo and vr.pre_id= p.pre_id FOR JSON PATH) as hover
    from VIEW_CONSULTA_DESCRIPCIONES v where p.pre_id = v.pre_id FOR JSON PATH ) as aplicaciones,
    p.ventas_ult6meses
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
    return res.json(result.recordset);
  }
  /*9*/ if (
    req.body.rud_id &&
    !req.body.rubro &&
    req.body.mar_id &&
    !req.body.mau_id
  ) {
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("lpp", sql.Int, req.params.lpp)
      .query(
        `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
    p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
    p.pre_stock_actual, dpv.ppa_precio, p.intercambiables, p.formado_por, p.es_parte_de, 
    (select a.atr_descripcion, pa.pra_valor from ATRIBUTOS a, productos_atributos pa where pa.atr_id = a.atr_id 
    and pa.pre_id = p.PRE_ID  FOR JSON PATH ) as atributos,(select distinct v.marca_auto, v.modelo, (select distinct descripcion_completa as descripcion 
    from VIEW_CONSULTA_DESCRIPCIONES vr where v.marca_auto = vr.marca_auto and v.modelo = vr.modelo and vr.pre_id= p.pre_id FOR JSON PATH) as hover
    from VIEW_CONSULTA_DESCRIPCIONES v where p.pre_id = v.pre_id FOR JSON PATH ) as aplicaciones,
    p.ventas_ult6meses
    from VIEW_CONSULTA_DESCRIPCIONES as v 
    join DETALLE_LISTA_PRECIOS_VENTA  as dpv on v.pre_id = dpv.pre_id
    join PRODUCTOS as p on v.pre_id = p.pre_id 
    join RUBROS as r on p.rup_id = r.rup_id
    left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.mar_id = cdm.mar_id and cdm.cli_id = @id and cdm.CDM_ACTIVO = 'SI'
    left join CLIENTES_DESC_PRODUCTOS as cdp on  v.pre_id = cdp.pre_id and cdp.cli_id = @id and cdp.CDP_ACTIVO = 'SI'
    left join CLIENTES_DESC_RUBROS as cdr on  p.rup_id = cdr.rup_id  and cdr.cli_id = @id and cdr.CDR_ACTIVO = 'SI'
    WHERE dpv.LPP_ID = @lpp and p.spr_id in (${req.body.rud_id}) and p.mar_id in (${req.body.mar_id}) order by p.ventas_ult6meses DESC`
      );
    return res.json(result.recordset);
  }
  /*10*/ if (
    req.body.mar_id &&
    !req.body.rud_id &&
    !req.body.mau_id &&
    !req.body.rubro
  ) {
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("lpp", sql.Int, req.params.lpp)
      .query(
        `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
     p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
     p.pre_stock_actual, dpv.ppa_precio, p.intercambiables, p.formado_por, p.es_parte_de, 
     (select a.atr_descripcion, pa.pra_valor from ATRIBUTOS a, productos_atributos pa where pa.atr_id = a.atr_id 
     and pa.pre_id = p.PRE_ID  FOR JSON PATH ) as atributos,(select distinct v.marca_auto, v.modelo, (select distinct descripcion_completa as descripcion 
     from VIEW_CONSULTA_DESCRIPCIONES vr where v.marca_auto = vr.marca_auto and v.modelo = vr.modelo and vr.pre_id= p.pre_id FOR JSON PATH) as hover
     from VIEW_CONSULTA_DESCRIPCIONES v where p.pre_id = v.pre_id FOR JSON PATH ) as aplicaciones,
     p.ventas_ult6meses
     from VIEW_CONSULTA_DESCRIPCIONES as v 
     join DETALLE_LISTA_PRECIOS_VENTA  as dpv on v.pre_id = dpv.pre_id
     join PRODUCTOS as p on v.pre_id = p.pre_id 
     join RUBROS as r on p.rup_id = r.rup_id
     left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.mar_id = cdm.mar_id and cdm.cli_id = @id and cdm.CDM_ACTIVO = 'SI'
     left join CLIENTES_DESC_PRODUCTOS as cdp on  v.pre_id = cdp.pre_id and cdp.cli_id = @id and cdp.CDP_ACTIVO = 'SI'
     left join CLIENTES_DESC_RUBROS as cdr on  p.rup_id = cdr.rup_id  and cdr.cli_id = @id and cdr.CDR_ACTIVO = 'SI'
     WHERE dpv.LPP_ID = @lpp and  p.mar_id in (${req.body.mar_id}) order by p.ventas_ult6meses DESC`
      );
    return res.json(result.recordset);
  }
};

/* producotos consulta modelo vehiculos */

export const getviewConsultmodelo = async (req, res) => {
  const pool = await getConnection();

  if (req.body.mod_id && !req.body.rubro) {
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("lpp", sql.Int, req.params.lpp)
      .query(
        `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, (select distinct md.mde_descripcion as motor from MOTORES_DENOMINACIONES md, VIEW_CONSULTA_DESCRIPCIONES vcd  where vcd.mde_id = md.mde_id and v.pre_id = vcd.pre_id and v.mod_id = (${req.body.mod_id}) FOR JSON PATH ) as motor, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
    p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
    p.pre_stock_actual, dpv.ppa_precio, p.intercambiables, p.formado_por, p.es_parte_de,
    (select a.atr_descripcion, pa.pra_valor from ATRIBUTOS a, productos_atributos pa where pa.atr_id = a.atr_id 
    and pa.pre_id = p.PRE_ID  FOR JSON PATH ) as atributos,
    p.ventas_ult6meses
    from VIEW_CONSULTA_DESCRIPCIONES as v 
    join DETALLE_LISTA_PRECIOS_VENTA  as dpv on v.pre_id = dpv.pre_id
    join PRODUCTOS as p on v.pre_id = p.pre_id 
    join RUBROS as r on p.rup_id = r.rup_id
    left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.mar_id = cdm.mar_id and cdm.cli_id = @id and cdm.CDM_ACTIVO = 'SI'
    left join CLIENTES_DESC_PRODUCTOS as cdp on  v.pre_id = cdp.pre_id and cdp.cli_id = @id and cdp.CDP_ACTIVO = 'SI'
    left join CLIENTES_DESC_RUBROS as cdr on  p.rup_id = cdr.rup_id  and cdr.cli_id = @id and cdr.CDR_ACTIVO = 'SI'
    WHERE dpv.LPP_ID = @lpp and v.mod_id in (${req.body.mod_id}) order by p.ventas_ult6meses DESC `
      );

    return res.json(result.recordset);
  }

  if (req.body.mod_id && req.body.rubro && !req.body.motor) {
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("lpp", sql.Int, req.params.lpp)
      .query(
        `SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, (select distinct md.mde_descripcion as motor from MOTORES_DENOMINACIONES md, VIEW_CONSULTA_DESCRIPCIONES vcd  where vcd.mde_id = md.mde_id and v.pre_id = vcd.pre_id  FOR JSON PATH ) as motor, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
    p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
    p.pre_stock_actual, dpv.ppa_precio, p.intercambiables, p.formado_por, p.es_parte_de,
    (select a.atr_descripcion, pa.pra_valor from ATRIBUTOS a, productos_atributos pa where pa.atr_id = a.atr_id 
    and pa.pre_id = p.PRE_ID  FOR JSON PATH ) as atributos,
    p.ventas_ult6meses
    from VIEW_CONSULTA_DESCRIPCIONES as v 
    join DETALLE_LISTA_PRECIOS_VENTA  as dpv on v.pre_id = dpv.pre_id
    join PRODUCTOS as p on v.pre_id = p.pre_id 
    join RUBROS as r on p.rup_id = r.rup_id
    left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.mar_id = cdm.mar_id and cdm.cli_id = @id and cdm.CDM_ACTIVO = 'SI'
    left join CLIENTES_DESC_PRODUCTOS as cdp on  v.pre_id = cdp.pre_id and cdp.cli_id = @id and cdp.CDP_ACTIVO = 'SI'
    left join CLIENTES_DESC_RUBROS as cdr on  p.rup_id = cdr.rup_id  and cdr.cli_id = @id and cdr.CDR_ACTIVO = 'SI'
    WHERE dpv.LPP_ID = @lpp and v.mod_id in (${req.body.mod_id}) and p.rup_id in (${req.body.rubro})  order by p.ventas_ult6meses DESC `
      );
    return res.json(result.recordset);
  }

  if (req.body.mod_id && req.body.rubro && req.body.motor) {
    console.log(req.body.motor);
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("lpp", sql.Int, req.params.lpp)
      .query(
        ` SELECT DISTINCT  v.pre_id , v.codigo, v.super_rubro, (select distinct md.mde_descripcion as motor from MOTORES_DENOMINACIONES md, VIEW_CONSULTA_DESCRIPCIONES vcd  where vcd.mde_id = md.mde_id and v.pre_id = vcd.pre_id FOR JSON PATH ) as motor, r.rup_descripcion as rubro, p.rup_id, v.marca_articulo, v.notas, v.comentarios, 
    p.mar_id, cdm.cdm_descuento as descuento_marca, cdp.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
    p.pre_stock_actual, dpv.ppa_precio, p.intercambiables, p.formado_por, p.es_parte_de,
    (select a.atr_descripcion, pa.pra_valor from ATRIBUTOS a, productos_atributos pa where pa.atr_id = a.atr_id 
    and pa.pre_id = p.PRE_ID  FOR JSON PATH ) as atributos,
    p.ventas_ult6meses
    from VIEW_CONSULTA_DESCRIPCIONES as v 
    join DETALLE_LISTA_PRECIOS_VENTA  as dpv on v.pre_id = dpv.pre_id
    join PRODUCTOS as p on v.pre_id = p.pre_id 
    join RUBROS as r on p.rup_id = r.rup_id
    left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.mar_id = cdm.mar_id and cdm.cli_id = 1 and cdm.CDM_ACTIVO = 'SI'
    left join CLIENTES_DESC_PRODUCTOS as cdp on  v.pre_id = cdp.pre_id and cdp.cli_id = 1 and cdp.CDP_ACTIVO = 'SI'
    left join CLIENTES_DESC_RUBROS as cdr on  p.rup_id = cdr.rup_id  and cdr.cli_id = 1 and cdr.CDR_ACTIVO = 'SI'
    WHERE dpv.LPP_ID = 1 and v.mod_id in (${req.body.mod_id}) and p.rup_id in (${req.body.rubro}) and v.mde_id in (${req.body.motor}) order by p.ventas_ult6meses DESC `
      );
    return res.json(result.recordset);
  }
};

/* marcasdeveiculos  */
export const getvehiculos = async (req, res) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .query("SELECT * FROM MARCAS_AUTOS WHERE MAU_ACTIVO = 'SI' ");
  res.json(result.recordset);
};

/* modelos de las marcas de vehiculos con su id */
export const getvehiculosmarcaId = async (req, res) => {
  console.log(req.params.id);
  console.log("estamossss aqui");
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

  if (req.body.mau_id) {
    const result = await pool.request()
      .query(`SELECT  DISTINCT  v.super_rubro, p.spr_id  from VIEW_CONSULTA_DESCRIPCIONES as v
    join PRODUCTOS as p on v.pre_id = p.pre_id
    where  mau_id in (${req.body.mau_id})`);
    return res.json(result.recordset);
  } else {
    const result = await pool.request()
      .query(`SELECT  DISTINCT  v.super_rubro, p.spr_id  from VIEW_CONSULTA_DESCRIPCIONES as v
    join PRODUCTOS as p on v.pre_id = p.pre_id
    `);
    return res.json(result.recordset);
  }
};

/*Super todas las marcas y segun el rubro */
export const getmarcaArticulo = async (req, res) => {
  const pool = await getConnection();

  if (!req.body?.mau_id && !req.body.rud_id && !req.body.rubro) {
    const result = await pool.request()
      .query(`SELECT  DISTINCT  v.marca_articulo as marca_a , p.mar_id  from VIEW_CONSULTA_DESCRIPCIONES as v 
    join PRODUCTOS as p on v.pre_id = p.pre_id`);
    return res.json(result.recordset);
  }
  if (req.body?.mau_id && !req.body.rud_id && !req.body.rubro) {
    const result = await pool.request()
      .query(`SELECT  DISTINCT  v.marca_articulo as marca_a , p.mar_id  from VIEW_CONSULTA_DESCRIPCIONES as v 
    join PRODUCTOS as p on v.pre_id = p.pre_id  where v.mau_id in (${req.body.mau_id}) `);
    return res.json(result.recordset);
  }
  if (req.body.rud_id && !req.body.mau_id && !req.body.rubro) {
    const result = await pool.request()
      .query(`SELECT  DISTINCT  v.marca_articulo as marca_a , p.mar_id  from VIEW_CONSULTA_DESCRIPCIONES as v 
    join PRODUCTOS as p on v.pre_id = p.pre_id  where p.spr_id in (${req.body.rud_id}) `);
    return res.json(result.recordset);
  }
  if (req.body.rud_id && req.body.mau_id && !req.body.rubro) {
    const result = await pool.request()
      .query(`SELECT  DISTINCT  v.marca_articulo as marca_a , p.mar_id  from VIEW_CONSULTA_DESCRIPCIONES as v 
    join PRODUCTOS as p on v.pre_id = p.pre_id  where v.mau_id in (${req.body.mau_id}) and p.spr_id in (${req.body.rud_id}) `);
    return res.json(result.recordset);
  }

  if (req.body.rud_id && !req.body.mau_id && req.body.rubro) {
    console.log("entradndo aqui");

    const result = await pool.request()
      .query(`SELECT  DISTINCT  v.marca_articulo as marca_a , p.mar_id  from VIEW_CONSULTA_DESCRIPCIONES as v 
    join PRODUCTOS as p on v.pre_id = p.pre_id  where p.spr_id in (${req.body.rud_id}) and v.rubro in ('${req.body.rubro}') `);
    return res.json(result.recordset);
  }
};

////////// rubros segun su super rubro o marca ///////

export const getrubroArticulo = async (req, res) => {
  const pool = await getConnection();
  if (req.body?.mau_id && req.body.rud_id && !req.body.mar_id) {
    const result = await pool.request()
      .query(`SELECT DISTINCT v.rubro, r.rup_descripcion from VIEW_CONSULTA_DESCRIPCIONES as v
      join Rubros as r on v.rubro = r.rup_codigo
      where v.MAU_ID in (${req.body.mau_id}) and r.spr_id in (${req.body.rud_id})`);
    return res.json(result.recordset);
  }
  if (req.body.rud_id && !req.body?.mau_id && !req.body.mar_id) {
    const result = await pool.request()
      .query(`SELECT DISTINCT v.rubro, r.rup_descripcion from VIEW_CONSULTA_DESCRIPCIONES as v
      join Rubros as r on v.rubro = r.rup_codigo
      where r.spr_id in (${req.body.rud_id})`);
    return res.json(result.recordset);
  }

  if (req.body.rud_id && req.body.mau_id && req.body.mar_id) {
    const result = await pool.request()
      .query(`SELECT DISTINCT v.rubro, r.rup_descripcion from VIEW_CONSULTA_DESCRIPCIONES as v
      join Rubros as r on v.rubro = r.rup_codigo
      join Productos as p on v.pre_id = p.pre_id
      where v.MAU_ID in (${req.body.mau_id}) and r.spr_id in (${req.body.rud_id}) and p.mar_id in (${req.body.mar_id})`);
    return res.json(result.recordset);
  }
};

/////////// Rrubro por modelo /////
export const getrubrosMod = async (req, res) => {
  const pool = await getConnection();

  const result = await pool.request()
    .query(`SELECT  DISTINCT  v.rup_id, r.rup_descripcion from VIEW_CONSULTA_DESCRIPCIONES as v
    join RUBROS  as r on v.rup_id = r.rup_id
    where  v.mod_id in  (${req.body.mod_id})`);
  return res.json(result.recordset);
};

///////////// motor segun el rubro /////
export const getmotorRu = async (req, res) => {
  const pool = await getConnection();
  const result = await pool.request().query(`
    
    select DISTINCT  me.mde_id, me.mde_descripcion  from MOTORES_DENOMINACIONES me, VIEW_CONSULTA_DESCRIPCIONES v 
    where v.mde_id = me.mde_id and v.mod_id in (${req.body.mod_id}) and v.rup_id in (${req.body.rubro})   
   `);
  return res.json(result.recordset);
};


// /*prueba codigo relacion */

export const buscador = async (req, res) => {
  console.log(req.body.p);
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("id", sql.Int, req.params.id)
    .input("lpp", sql.Int, req.params.lpp)
    .query(`select distinct p.pre_id, p.pre_codigo_fabrica as codigo, p.pre_notas as notas , p.pre_stock_actual, p.intercambiables, p.formado_por, 
p.es_parte_de, p.ventas_ult6meses, mp.mar_descripcion as marca_articulo, sr.SPR_DESCRIPCION as super_rubro, r.rup_descripcion as rubro,
cdp.cdm_descuento as descuento_marca, cdp2.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro,
dlpv.ppa_precio,
(select a.atr_descripcion, pa.pra_valor from ATRIBUTOS a, PRODUCTOS_ATRIBUTOS pa where pa.atr_id = a.atr_id 
 and p.pre_id = pa.pre_id  FOR JSON PATH ) as atributos,
(select distinct ma.mau_descripcion as marca_auto, m.mod_descripcion as modelo from MARCAS_AUTOS ma, MODELOS m , PRODUCTOS_DESCRIPCIONES pd 
where p.pre_id = pd.pre_id and pd.mau_id = ma.mau_id and pd.mod_id = m.mod_id FOR JSON PATH ) as aplicaciones  
from PRODUCTOS p join MARCAS_PRODUCTOS mp on p.mar_id = mp.mar_id
Join PRODUCTOS_DESCRIPCIONES pd on p.pre_id = pd.pre_id
join MARCAS_AUTOS ma on pd.mau_id = ma.mau_id 
join MODELOS m on pd.mod_id = m.mod_id
Join SUPER_RUBROS sr on p.spr_id = sr.spr_id
join RUBROS r on p.rup_id = r.rup_id
join DETALLE_LISTA_PRECIOS_VENTA dlpv on dlpv.lpp_id = @lpp and p.pre_id = dlpv.pre_id and p.pre_activo  = 'SI'
left join CLIENTES_DESC_PROCEDENCIAS cdp on p.mar_id = cdp.mar_id and cdp.cli_id = @id and cdp.cdm_activo = 'SI' 
left join CLIENTES_DESC_PRODUCTOS cdp2 on cdp2.cli_id = @id and cdp2.cdp_activo = 'SI' and p.pre_id = cdp2.pre_id 
left join CLIENTES_DESC_RUBROS cdr on cdr.cli_id= @id and cdr.cdr_activo = 'SI' and p.rup_id = cdr.rup_id 
where ma.mau_descripcion like '%${req.body.p}%' or m.mod_descripcion like '%${req.body.p}%' or p.pre_codigo_fabrica like '%${req.body.p}%'
or r.rup_descripcion like '%${req.body.p}%'
order by p.ventas_ult6meses DESC`);

  return res.json(result.recordset);
};

