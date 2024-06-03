import sql from "mssql";
import { getConnection } from "../database/connections.js";

/* productos id por cliente */
export const geproductosId = async (req, res) => {
  console.log("consultando familias");
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("id", sql.Int, req.params.id)
    .input("lpp", sql.Int, req.params.lpp)
    .query(
      `select p.pre_id, p.pre_codigo_fabrica as codigo, p.mar_id, p.rup_id , p.spr_id, p.pre_notas as notas, p.pre_comentarios as comentarios,
      r.rup_descripcion as rubro, sr.spr_descripcion as super_rubro, mp.mar_descripcion as marca_articulo, p.intercambiables, p.formado_por, p.es_parte_de, p.ventas_ult6meses,
	    (select distinct pd.marca_modelo, (select distinct pd4.descripcion_hover as hover
      from productos_descripciones pd4 where pd.marca_modelo = pd4.marca_modelo and pd4.pre_id= p.pre_id FOR JSON PATH) as hover
      from productos_descripciones pd where p.pre_id = pd.pre_id FOR JSON PATH ) as aplicaciones,
	    (select a.atr_descripcion, pa.pra_valor from ATRIBUTOS a, PRODUCTOS_ATRIBUTOS pa where pa.atr_id = a.atr_id
      and p.pre_id = pa.pre_id  FOR JSON PATH ) as atributos,
      (select distinct p2.pre_codigo_fabrica as codigo, pe.pre_id_principal, pe.pre_id_equivalente, mp2.mar_descripcion as marca_articulo, dpv2.ppa_precio, p2.pre_stock_actual
	    from PRODUCTOS_EQUIVALENCIAS pe, PRODUCTOS p2, MARCAS_PRODUCTOS mp2, DETALLE_LISTA_PRECIOS_VENTA dpv2 
	    where  pe.PRE_ID_EQUIVALENTE = p2.PRE_ID and pe.PRE_ID_PRINCIPAL = p.PRE_ID and p2.mar_id = mp2.mar_id and p2.PRE_ID = dpv2.PRE_ID and dpv2.LPP_ID = @lpp and p2.pre_activo = 'SI'
	    order by dpv2.ppa_precio desc FOR JSON PATH ) as equivalente,
      cdp.cdp_descuento as descuento_producto,cdm.CDM_DESCUENTO as descuento_marca, cdr.cdr_descuento as descuento_rubro, dpv.ppa_precio, p.pre_stock_actual
      from PRODUCTOS as p
      left join MARCAS_PRODUCTOS as mp on p.MAR_ID = mp.MAR_ID
      join SUPER_RUBROS as sr on p.spr_id = sr.spr_id
      join RUBROS as r on p.rup_id = r.rup_id
      left join DETALLE_LISTA_PRECIOS_VENTA  as dpv on p.PRE_ID = dpv.PRE_ID and p.PRE_ACTIVO = 'SI'
      left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.MAR_ID = cdm.MAR_ID and cdm.CLI_ID = @id and cdm.CDM_ACTIVO = 'SI'
      left join CLIENTES_DESC_PRODUCTOS as cdp on  p.PRE_ID = cdp.PRE_ID and cdp.cli_id = @id and cdp.CDP_ACTIVO = 'SI'
      left join CLIENTES_DESC_RUBROS as cdr on  p.RUP_ID = cdr.RUP_ID  and cdr.cli_id = @id and cdr.CDR_ACTIVO = 'SI'
      WHERE dpv.LPP_ID = @lpp order by p.ventas_ult6meses DESC OFFSET 0 ROWS FETCH NEXT 20 ROWS ONLY`
    );

  return res.json(result.recordset);
};

/*buscar productos segun la marca del vehiculo*/
export const getviewConsultAuto = async (req, res) => {
  const pool = await getConnection();

  const b = `select distinct p.pre_id, p.pre_codigo_fabrica as codigo, p.mar_id, p.rup_id , p.spr_id, p.pre_notas as notas, p.pre_comentarios as comentarios,
  r.rup_descripcion as rubro, sr.spr_descripcion as super_rubro, mp.mar_descripcion as marca_articulo, p.intercambiables, p.formado_por, p.es_parte_de, p.ventas_ult6meses,
  (select distinct pd.marca_modelo, (select distinct pd4.descripcion_hover as hover
  from productos_descripciones pd4 where pd.marca_modelo = pd4.marca_modelo and pd4.pre_id= p.pre_id FOR JSON PATH) as hover
  from productos_descripciones pd where p.pre_id = pd.pre_id FOR JSON PATH ) as aplicaciones,
  (select a.atr_descripcion, pa.pra_valor from ATRIBUTOS a, PRODUCTOS_ATRIBUTOS pa where pa.atr_id = a.atr_id
  and p.pre_id = pa.pre_id  FOR JSON PATH ) as atributos,
  (select distinct p2.pre_codigo_fabrica as codigo, pe.pre_id_principal, pe.pre_id_equivalente, mp2.mar_descripcion as marca_articulo, dpv2.ppa_precio, p2.pre_stock_actual
  from PRODUCTOS_EQUIVALENCIAS pe, PRODUCTOS p2, MARCAS_PRODUCTOS mp2, DETALLE_LISTA_PRECIOS_VENTA dpv2 
  where  pe.PRE_ID_EQUIVALENTE = p2.PRE_ID and pe.PRE_ID_PRINCIPAL = p.PRE_ID and p2.mar_id = mp2.mar_id and p2.PRE_ID = dpv2.PRE_ID and dpv2.LPP_ID = ${req.params.lpp} and p2.pre_activo = 'SI'
  order by dpv2.ppa_precio desc FOR JSON PATH ) as equivalente,
  cdp.cdp_descuento as descuento_producto,cdm.CDM_DESCUENTO as descuento_marca, cdr.cdr_descuento as descuento_rubro, dpv.ppa_precio, p.pre_stock_actual
  from PRODUCTOS as p
  left join MARCAS_PRODUCTOS as mp on p.MAR_ID = mp.MAR_ID
  join PRODUCTOS_DESCRIPCIONES pd on p.pre_id = pd.pre_id
  join SUPER_RUBROS as sr on p.spr_id = sr.spr_id
  join RUBROS as r on p.rup_id = r.rup_id
  left join DETALLE_LISTA_PRECIOS_VENTA  as dpv on p.PRE_ID = dpv.PRE_ID and p.PRE_ACTIVO = 'SI'
  left join CLIENTES_DESC_PROCEDENCIAS as cdm on p.MAR_ID = cdm.MAR_ID and cdm.CLI_ID = ${req.params.id} and cdm.CDM_ACTIVO = 'SI'
  left join CLIENTES_DESC_PRODUCTOS as cdp on  p.PRE_ID = cdp.PRE_ID and cdp.cli_id = ${req.params.id} and cdp.CDP_ACTIVO = 'SI'
  left join CLIENTES_DESC_RUBROS as cdr on  p.RUP_ID = cdr.RUP_ID  and cdr.cli_id = ${req.params.id} and cdr.CDR_ACTIVO = 'SI'
  WHERE dpv.LPP_ID = ${req.params.lpp}`;
  /*1*/ if (
    req.body.mau_id &&
    !req.body.rud_id &&
    !req.body.mar_id &&
    !req.body.rubro
  ) {
    const result = await pool
      .request()
      .query(
        b.concat(
          " ",
          `and pd.mau_id in (${req.body.mau_id}) order by p.ventas_ult6meses DESC`
        )
      );

    return res.json(result.recordset);
  }

  /*2*/ if (
    req.body.mau_id &&
    req.body.rud_id &&
    !req.body.mar_id &&
    !req.body.rubro
  ) {
    const result = await pool
      .request()
      .query(
        b.concat(
          " ",
          `and pd.mau_id in (${req.body.mau_id}) and p.spr_id in (${req.body.rud_id}) order by p.ventas_ult6meses DESC`
        )
      );
    return res.json(result.recordset);
  }

  /*3*/ if (
    req.body.mau_id &&
    req.body.rud_id &&
    req.body.mar_id &&
    !req.body.rubro
  ) {
    const result = await pool.request().query(
      b.concat(
        " ",
        `and pd.mau_id in (${req.body.mau_id}) and p.spr_id in (${req.body.rud_id})
          and p.mar_id in (${req.body.mar_id}) order by p.ventas_ult6meses DESC`
      )
    );
    return res.json(result.recordset);
  }
  /*4*/ if (
    req.body.mau_id &&
    req.body.rud_id &&
    req.body.mar_id &&
    req.body.rubro
  ) {
    const result = await pool.request().query(
      b.concat(
        " ",
        `and pd.mau_id in (${req.body.mau_id}) and p.spr_id in (${req.body.rud_id})
    and p.mar_id in (${req.body.mar_id}) and r.rup_codigo in ('${req.body.rubro}') order by p.ventas_ult6meses DESC`
      )
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
      .query(
        b.concat(
          " ",
          `and pd.mau_id in (${req.body.mau_id}) and p.mar_id in (${req.body.mar_id}) order by p.ventas_ult6meses DESC`
        )
      );
    return res.json(result.recordset);
  }

  if (
    req.body.mau_id &&
    req.body.rud_id &&
    !req.body.mar_id &&
    req.body.rubro
  ) {
    const result = await pool.request().query(
      b.concat(
        " ",
        `and pd.mau_id in (${req.body.mau_id}) and p.spr_id in (${req.body.rud_id})
          and r.rup_codigo in ('${req.body.rubro}') order by p.ventas_ult6meses DESC `
      )
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
      .query(
        b.concat(
          " ",
          ` and p.spr_id in (${req.body.rud_id}) order by p.ventas_ult6meses DESC`
        )
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
      .query(
        b.concat(
          " ",
          `and p.spr_id in (${req.body.rud_id}) and r.rup_codigo in ('${req.body.rubro}') order by p.ventas_ult6meses DESC`
        )
      );
    return res.json(result.recordset);
  }
  /*8*/ if (
    req.body.rud_id &&
    req.body.rubro &&
    req.body.mar_id &&
    !req.body.mau_id
  ) {
    const result = await pool.request().query(
      b.concat(
        " ",
        `and p.spr_id in (${req.body.rud_id}) and p.mar_id in (${req.body.mar_id})
    and r.rup_codigo in ('${req.body.rubro}') order by p.ventas_ult6meses DESC`
      )
    );
    return res.json(result.recordset);
  }
  /*9*/ if (
    req.body.rud_id &&
    !req.body.rubro &&
    req.body.mar_id &&
    !req.body.mau_id
  ) {
    const result = await pool.request().query(
      b.concat(
        " ",
        ` and p.spr_id in (${req.body.rud_id}) and p.mar_id in 
          (${req.body.mar_id}) order by p.ventas_ult6meses DESC`
      )
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
      .query(
        b.concat(
          " ",
          ` and  p.mar_id in (${req.body.mar_id}) order by p.ventas_ult6meses DESC`
        )
      );
    return res.json(result.recordset);
  }
};

/* producotos consulta modelo vehiculos */

export const getviewConsultmodelo = async (req, res) => {
  const pool = await getConnection();
  console.log(req.body);
  const producto = `select distinct p.pre_codigo_fabrica as codigo, p.pre_notas as notas, p.pre_stock_actual,p.ventas_ult6meses, 
  (select a.atr_descripcion, pa.pra_valor from ATRIBUTOS a, PRODUCTOS_ATRIBUTOS pa where pa.atr_id = a.atr_id 
  and p.pre_id = pa.pre_id  FOR JSON PATH ) as atributos, mp.mar_descripcion as marca_articulo, r.rup_descripcion as rubro, p.rup_id,
  cdp.cdm_descuento as descuento_marca,cdp2.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro, dlpv.ppa_precio, 
  (select distinct p2.pre_codigo_fabrica as codigo, pe.pre_id_principal, pe.pre_id_equivalente, mp2.mar_descripcion as marca_articulo, dpv2.ppa_precio, p2.pre_stock_actual
  from PRODUCTOS_EQUIVALENCIAS pe, PRODUCTOS p2, MARCAS_PRODUCTOS mp2, DETALLE_LISTA_PRECIOS_VENTA dpv2 
  where  pe.PRE_ID_EQUIVALENTE = p2.PRE_ID and pe.PRE_ID_PRINCIPAL = p.PRE_ID and p2.mar_id = mp2.mar_id and p2.PRE_ID = dpv2.PRE_ID and dpv2.LPP_ID = ${req.params.lpp} and p2.pre_activo = 'SI'
  order by dpv2.ppa_precio desc FOR JSON PATH ) as equivalente,
  (select DISTINCT  md.mde_descripcion from MOTORES_DENOMINACIONES md, PRODUCTOS_DESCRIPCIONES pd2  where pd2.mde_id = md.mde_id 
  and pd.pre_id = pd2.pre_id and pd2.mod_id in (${req.body.mod_id}) order by md.mde_descripcion desc FOR JSON PATH) as motor
  from PRODUCTOS p 
  join MARCAS_PRODUCTOS mp on p.mar_id = mp.mar_id
  join PRODUCTOS_DESCRIPCIONES pd on p.pre_id = pd.pre_id
  join RUBROS r on p.rup_id = r.rup_id
  join DETALLE_LISTA_PRECIOS_VENTA dlpv on p.pre_id = dlpv.pre_id and p.pre_activo  = 'SI'
  left join CLIENTES_DESC_PROCEDENCIAS cdp on cdp.cli_id = ${req.params.id} and p.mar_id = cdp.mar_id and cdp.cdm_activo = 'SI' 
  left join CLIENTES_DESC_PRODUCTOS cdp2 on cdp2.cli_id = ${req.params.id} and p.pre_id = cdp2.pre_id and cdp2.cdp_activo = 'SI'  
  left join CLIENTES_DESC_RUBROS cdr on cdr.cli_id = ${req.params.id} and p.rup_id = cdr.rup_id  and cdr.cdr_activo = 'SI' 
  WHERE dlpv.lpp_id = ${req.params.lpp}   
  `;
  const productoM = `select distinct p.pre_codigo_fabrica as codigo, p.pre_notas as notas, p.pre_stock_actual,p.ventas_ult6meses, 
  (select a.atr_descripcion, pa.pra_valor from ATRIBUTOS a, PRODUCTOS_ATRIBUTOS pa where pa.atr_id = a.atr_id 
  and p.pre_id = pa.pre_id  FOR JSON PATH ) as atributos, mp.mar_descripcion as marca_articulo, r.rup_descripcion as rubro, p.rup_id,
  cdp.cdm_descuento as descuento_marca,cdp2.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro, dlpv.ppa_precio, 
  (select distinct p2.pre_codigo_fabrica as codigo, pe.pre_id_principal, pe.pre_id_equivalente, mp2.mar_descripcion as marca_articulo, dpv2.ppa_precio, p2.pre_stock_actual
  from PRODUCTOS_EQUIVALENCIAS pe, PRODUCTOS p2, MARCAS_PRODUCTOS mp2, DETALLE_LISTA_PRECIOS_VENTA dpv2 
  where  pe.PRE_ID_EQUIVALENTE = p2.PRE_ID and pe.PRE_ID_PRINCIPAL = p.PRE_ID and p2.mar_id = mp2.mar_id and p2.PRE_ID = dpv2.PRE_ID and dpv2.LPP_ID = ${req.params.lpp} and p2.pre_activo = 'SI'
  order by dpv2.ppa_precio desc FOR JSON PATH ) as equivalente, 
  (select DISTINCT md.mde_descripcion from MOTORES_DENOMINACIONES md where pd.mde_id = md.mde_id  FOR JSON PATH) as motor
  from PRODUCTOS p 
  join MARCAS_PRODUCTOS mp on p.mar_id = mp.mar_id
  join PRODUCTOS_DESCRIPCIONES pd on p.pre_id = pd.pre_id
  join RUBROS r on p.rup_id = r.rup_id
  join DETALLE_LISTA_PRECIOS_VENTA dlpv on p.pre_id = dlpv.pre_id and p.pre_activo  = 'SI'
  left join CLIENTES_DESC_PROCEDENCIAS cdp on cdp.cli_id = ${req.params.id} and p.mar_id = cdp.mar_id and cdp.cdm_activo = 'SI' 
  left join CLIENTES_DESC_PRODUCTOS cdp2 on cdp2.cli_id = ${req.params.id} and p.pre_id = cdp2.pre_id and cdp2.cdp_activo = 'SI'  
  left join CLIENTES_DESC_RUBROS cdr on cdr.cli_id = ${req.params.id} and p.rup_id = cdr.rup_id  and cdr.cdr_activo = 'SI' 
  WHERE dlpv.lpp_id = ${req.params.lpp}   
  `;

  if (req.body.mod_id && !req.body.rubro && !req.body.motor) {
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("lpp", sql.Int, req.params.lpp)
      .query(
        producto.concat(
          " ",
          `and pd.mod_id = (${req.body.mod_id}) order by p.ventas_ult6meses`
        )
      );
    return res.json(result.recordset);
  }

  if (req.body.mod_id && req.body.rubro && !req.body.motor) {
    const result = await pool
      .request()
      .query(
        producto.concat(
          " ",
          `and pd.mod_id = (${req.body.mod_id}) and p.rup_id in (${req.body.rubro}) order by p.ventas_ult6meses`
        )
      );

    return res.json(result.recordset);
  }

  if (req.body.mod_id && req.body.rubro && req.body.motor) {
    console.log(req.body.motor);
    const result = await pool.request().query(
      productoM.concat(
        " ",
        `and pd.mod_id = (${req.body.mod_id}) and p.rup_id in (${req.body.rubro})
      and pd.mde_id in (${req.body.motor}) order by p.ventas_ult6meses`
      )
    );
    return res.json(result.recordset);
  }

  if (req.body.mod_id && !req.body.rubro && req.body.motor) {
    console.log(req.body.motor);
    const result = await pool
      .request()
      .query(
        productoM.concat(
          " ",
          `and pd.mod_id = (${req.body.mod_id}) and pd.mde_id in (${req.body.motor}) order by p.ventas_ult6meses`
        )
      );
    return res.json(result.recordset);
  }
};

/*Falta una condicion*/

/* marcasdeveiculos  */
export const getvehiculos = async (req, res) => {
  const pool = await getConnection();
  const result = await pool.request()
    .query(`SELECT MAU_DESCRIPCION, MAU_ID FROM MARCAS_AUTOS
    WHERE MAU_ACTIVO = 'SI' ORDER BY MAU_ORDEN,MAU_DESCRIPCION `);
  res.json(result.recordset);
};

/* modelos de las marcas de vehiculos con su id */
export const getvehiculosmarcaId = async (req, res) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("id", sql.Int, req.params.id)
    .query("SELECT * FROM MODELOS WHERE MAU_ID = @id");
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
    where  mau_id in (${req.body.mau_id}) order by v.super_rubro asc`);
    return res.json(result.recordset);
  } else {
    const result = await pool.request()
      .query(`SELECT  DISTINCT  v.super_rubro, p.spr_id  from VIEW_CONSULTA_DESCRIPCIONES as v
    join PRODUCTOS as p on v.pre_id = p.pre_id order by v.super_rubro asc
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
    join PRODUCTOS as p on v.pre_id = p.pre_id order by v.marca_articulo asc`);
    return res.json(result.recordset);
  }
  if (req.body?.mau_id && !req.body.rud_id && !req.body.rubro) {
    const result = await pool.request()
      .query(`SELECT  DISTINCT  v.marca_articulo as marca_a , p.mar_id  from VIEW_CONSULTA_DESCRIPCIONES as v 
    join PRODUCTOS as p on v.pre_id = p.pre_id  where v.mau_id in (${req.body.mau_id}) order by v.marca_articulo asc `);
    return res.json(result.recordset);
  }
  if (req.body.rud_id && !req.body.mau_id && !req.body.rubro) {
    const result = await pool.request()
      .query(`SELECT  DISTINCT  v.marca_articulo as marca_a , p.mar_id  from VIEW_CONSULTA_DESCRIPCIONES as v 
    join PRODUCTOS as p on v.pre_id = p.pre_id  where p.spr_id in (${req.body.rud_id}) order by v.marca_articulo asc `);
    return res.json(result.recordset);
  }
  if (req.body.rud_id && req.body.mau_id && !req.body.rubro) {
    const result = await pool.request()
      .query(`SELECT  DISTINCT  v.marca_articulo as marca_a , p.mar_id  from VIEW_CONSULTA_DESCRIPCIONES as v 
    join PRODUCTOS as p on v.pre_id = p.pre_id  where v.mau_id in (${req.body.mau_id}) and p.spr_id in (${req.body.rud_id}) order by v.marca_articulo asc `);
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
      where v.MAU_ID in (${req.body.mau_id}) and r.spr_id in (${req.body.rud_id})
      order by r.rup_descripcion asc`);
    return res.json(result.recordset);
  }
  if (req.body.rud_id && !req.body?.mau_id && !req.body.mar_id) {
    const result = await pool.request()
      .query(`SELECT DISTINCT v.rubro, r.rup_descripcion from VIEW_CONSULTA_DESCRIPCIONES as v
      join Rubros as r on v.rubro = r.rup_codigo 
      where r.spr_id in (${req.body.rud_id}) 
      order by r.rup_descripcion asc`);
    return res.json(result.recordset);
  }

  if (req.body.rud_id && req.body.mau_id && req.body.mar_id) {
    const result = await pool.request()
      .query(`SELECT DISTINCT v.rubro, r.rup_descripcion from VIEW_CONSULTA_DESCRIPCIONES as v
      join Rubros as r on v.rubro = r.rup_codigo
      join Productos as p on v.pre_id = p.pre_id
      where v.MAU_ID in (${req.body.mau_id}) and r.spr_id in (${req.body.rud_id}) and p.mar_id in (${req.body.mar_id})
      order by r.rup_descripcion asc`);
    return res.json(result.recordset);
  }
};

/////////// Rrubro por modelo /////
export const getrubrosMod = async (req, res) => {
  const pool = await getConnection();

  const result = await pool.request()
    .query(`SELECT  DISTINCT  v.rup_id, r.rup_descripcion from VIEW_CONSULTA_DESCRIPCIONES as v
    join RUBROS  as r on v.rup_id = r.rup_id
    where  v.mod_id in  (${req.body.mod_id}) order by r.rup_descripcion asc`);
  return res.json(result.recordset);
};

///////////// motor segun el rubro /////
export const getmotorRu = async (req, res) => {
  const pool = await getConnection();
  if ((req.body.mod_id, !req.body.rubro)) {
    const result = await pool.request().query(`  
    SELECT distinct md.mde_id, md.mde_descripcion from MOTORES_DENOMINACIONES md , 
    PRODUCTOS_DESCRIPCIONES pd WHERE pd.MDE_ID = md.MDE_ID and pd.MOD_ID in (${req.body.mod_id})   
     `);
    return res.json(result.recordset);
  } else if ((req.body.mod_id, req.body.rubro)) {
    console.log("soy un motor");
    const result = await pool.request().query(`  
        select DISTINCT  me.mde_id, me.mde_descripcion  from MOTORES_DENOMINACIONES me, VIEW_CONSULTA_DESCRIPCIONES v 
        where v.mde_id = me.mde_id and v.mod_id in (${req.body.mod_id}) and v.rup_id in (${req.body.rubro})   
       `);
    return res.json(result.recordset);
  }
};

// /*prueba codigo relacion */

////////hoy////
export const getCodiB = async (req, res) => {
  const pool = await getConnection();
  const result = await pool.request().query(`
  SELECT DISTINCT TOP 10 CODIGO FROM VIEW_CONSULTA_DESCRIPCIONES vcd 
    WITH(NOLOCK) WHERE CODIGO LIKE '${req.body.p}%' ORDER  BY CODIGO    
    `);
  return res.json(result.recordset);
};
////// marca segun el producto///
export const getMarcProdut = async (req, res) => {
  const pool = await getConnection();
  const result = await pool.request().query(`
 select distinct  marca_articulo as marca from view_consulta_descripciones
where codigo = '${req.body.p}'`);
  return res.json(result.recordset);
};

export const getMotorProduct = async (req, res) => {
  // console.log(req.params.id);
  const pool = await getConnection();
  const result = await pool.request().input("id", sql.Int, req.params.id)
    .query(`select distinct m.mde_descripcion from motores_denominaciones as m  
    join productos_descripciones as pd on m.mde_id = pd.mde_id 
    where pd.mod_id = @id `);
  return res.json(result.recordset);
};
