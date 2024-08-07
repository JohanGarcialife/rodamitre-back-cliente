import sql from "mssql";
import { getConnection } from "../database/connections.js";

export const buscador = async (req, res) => {
  const pool = await getConnection();
  const h = req.body.p.trim();
  const busqv = h.split(" ");
  console.log(busqv);
  
 
  const concatenar =
    busqv.length === 1
      ? `and pe.CAMPO_BUSQUEDA  like '%${busqv[0]}%'`
      : busqv.length === 2
      ? `and pe.CAMPO_BUSQUEDA like '%${busqv[0]}%' and pe.CAMPO_BUSQUEDA like '%${busqv[1]}%'`
      : busqv.length === 3
      ? `and pe.CAMPO_BUSQUEDA like '%${busqv[0]}%' and pe.CAMPO_BUSQUEDA like '%${busqv[1]}%' and pe.CAMPO_BUSQUEDA like '%${busqv[2]}%'`
      : `and pe.CAMPO_BUSQUEDA like '%${busqv[0]}%' and pe.CAMPO_BUSQUEDA like '%${busqv[1]}%' and pe.CAMPO_BUSQUEDA like '%${busqv[2]}%' and pe.CAMPO_BUSQUEDA like '%${busqv[3]}%'`;

  const a = `select distinct p.pre_id, p.pre_codigo_fabrica as codigo, p.pre_notas as notas, p.pre_stock_actual, p.intercambiables, p.formado_por, 
      p.es_parte_de, p.ventas_ult6meses, p.altura, p.exterior, p.interior , 
      (select a.atr_descripcion, pa.pra_valor from ATRIBUTOS a, PRODUCTOS_ATRIBUTOS pa where pa.atr_id = a.atr_id and p.pre_id = pa.pre_id  FOR JSON PATH ) as atributos,
      (select distinct pd.marca_modelo, (select distinct pd4.descripcion_hover as hover 
       from productos_descripciones pd4 where pd.marca_modelo = pd4.marca_modelo and pd4.pre_id= p.pre_id FOR JSON PATH) as hover 
      from productos_descripciones pd where p.pre_id = pd.pre_id FOR JSON PATH ) as aplicaciones,
      mp.mar_descripcion as marca_articulo, sr.spr_descripcion as super_rubro, r.rup_descripcion as rubro, cdp.cdm_descuento as descuento_marca, 
      cdp2.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro, dlpv.ppa_precio
      from PRODUCTOS p
      left join PRODUCTOS_EQUIVALENCIAS pe on p.pre_id = pe.pre_id_principal or p.pre_id = pe.pre_id_equivalente 
      join MARCAS_PRODUCTOS mp on p.mar_id = mp.mar_id
      Join SUPER_RUBROS sr on p.spr_id = sr.spr_id
      join RUBROS r on p.rup_id = r.rup_id
      join DETALLE_LISTA_PRECIOS_VENTA dlpv on p.pre_id = dlpv.pre_id and p.pre_activo  = 'SI'
      left join CLIENTES_DESC_PROCEDENCIAS cdp on cdp.cli_id = ${req.params.id} and p.mar_id = cdp.mar_id and cdp.cdm_activo = 'SI' 
      left join CLIENTES_DESC_PRODUCTOS cdp2 on cdp2.cli_id = ${req.params.id} and p.pre_id = cdp2.pre_id and cdp2.cdp_activo = 'SI'  
      left join CLIENTES_DESC_RUBROS cdr on cdr.cli_id = ${req.params.id} and p.rup_id = cdr.rup_id  and cdr.cdr_activo = 'SI' 
      WHERE dlpv.lpp_id = ${req.params.lpp}`;

  const b = a.concat(" ", concatenar);

  const c = `select distinct p.pre_id, p.pre_codigo_fabrica as codigo, p.pre_notas as notas, p.pre_stock_actual, p.intercambiables, p.formado_por, 
    p.es_parte_de, p.ventas_ult6meses, p.altura, p.exterior, p.interior, pe.pre_ids_mostrar,
    (select a.atr_descripcion, pa.pra_valor from ATRIBUTOS a, PRODUCTOS_ATRIBUTOS pa where pa.atr_id = a.atr_id and p.pre_id = pa.pre_id  FOR JSON PATH ) as atributos,
    (select distinct pd.marca_modelo, (select distinct pd4.descripcion_hover as hover 
    from productos_descripciones pd4 where pd.marca_modelo = pd4.marca_modelo and pd4.pre_id= p.pre_id FOR JSON PATH) as hover 
    from productos_descripciones pd where p.pre_id = pd.pre_id FOR JSON PATH ) as aplicaciones,
    mp.mar_descripcion as marca_articulo, sr.spr_descripcion as super_rubro, r.rup_descripcion as rubro, cdp.cdm_descuento as descuento_marca, 
    cdp2.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro, dlpv.ppa_precio, dlpv.lpp_id, pe.codigo_principal, pe.pre_id_principal
    from PRODUCTOS p
    left join PRODUCTOS_EQUIVALENCIAS pe on p.pre_id = pe.pre_id_principal or p.pre_id = pe.pre_id_equivalente
    join MARCAS_PRODUCTOS mp on p.mar_id = mp.mar_id
    Join SUPER_RUBROS sr on p.spr_id = sr.spr_id
    join RUBROS r on p.rup_id = r.rup_id
    join DETALLE_LISTA_PRECIOS_VENTA dlpv on p.pre_id = dlpv.pre_id and p.pre_activo  = 'SI'
    left join CLIENTES_DESC_PROCEDENCIAS cdp on cdp.cli_id = ${req.params.id} and p.mar_id = cdp.mar_id and cdp.cdm_activo = 'SI' 
    left join CLIENTES_DESC_PRODUCTOS cdp2 on cdp2.cli_id = ${req.params.id} and p.pre_id = cdp2.pre_id and cdp2.cdp_activo = 'SI'  
    left join CLIENTES_DESC_RUBROS cdr on cdr.cli_id = ${req.params.id} and p.rup_id = cdr.rup_id  and cdr.cdr_activo = 'SI' 
    WHERE dlpv.lpp_id = ${req.params.lpp}`;

  const d = `SELECT DISTINCT productos.pre_id, pre_codigo_fabrica as codigo,mar_descripcion as marca_articulo, pre_stock_actual,
  ppa_precio, pe.codigo_principal, pe.pre_id_principal FROM  MARCAS_PRODUCTOS WITH(NOLOCK) INNER JOIN DETALLE_LISTA_PRECIOS_VENTA 
  WITH(NOLOCK) INNER JOIN PRODUCTOS WITH(NOLOCK) ON DETALLE_LISTA_PRECIOS_VENTA.PRE_ID = PRODUCTOS.PRE_ID 
  ON MARCAS_PRODUCTOS.MAR_ID = PRODUCTOS.MAR_ID left join PRODUCTOS_EQUIVALENCIAS pe on PRODUCTOS.PRE_ID = pe.pre_id_principal or
  PRODUCTOS.PRE_ID = pe.pre_id_equivalente
  WHERE LPP_ID = ${req.params.lpp}`;

/* const e = `
SELECT DISTINCT p.pre_id, pe.codigo_principal, pe.pre_ids_mostrar FROM productos p
left join PRODUCTOS_EQUIVALENCIAS pe on p.pre_id = pe.pre_id_principal or p.pre_id = pe.pre_id_equivalente WHERE 
p.pre_codigo_fabrica = '${req.body.p}'` */

  const ap = req.body.altura
    ? parseFloat(req.body.altura) + 0.5
    : req.body.altura;
  const an = req.body.altura
    ? parseFloat(req.body.altura) - 0.5
    : req.body.altura;
  const ep = req.body.exterior
    ? parseInt(req.body.exterior) + 0.5
    : req.body.exterior;
  const en = req.body.exterior
    ? parseInt(req.body.exterior) - 0.5
    : req.body.exterior;
  const ip = req.body.interior
    ? parseInt(req.body.interior) + 0.5
    : req.body.interior;
  const ib = req.body.interior
    ? parseInt(req.body.interior) - 0.5
    : req.body.interior;

  if (req.body.p) {
    if (
      req.body.p &&
      !req.body.altura &&
      !req.body.exterior &&
      !req.body.interior
    ) {
      console.log(req.body);
      const result = await pool
        .request()
       .query(c.concat(" ", `and p.pre_codigo_fabrica = '${req.body.p}' ORDER BY ppa_precio DESC `));
      //////////////////////////////////////////////////////////////////////////////
      if (result.recordset.length <= 0) {
        console.log("hola buscamos todo ahora");

        const productos = await pool.request().query(b);

        return res.json(productos.recordset);
      } else if (result.recordset && result?.recordset[0]?.pre_ids_mostrar) {
        const equivalente = await pool
          .request()
          .query(
            d.concat(
              " ",
              `AND PRODUCTOS.PRE_ID IN (${result.recordset[0].pre_ids_mostrar}) ORDER BY ppa_precio DESC`
            )
          );

          const idsNoPermitidos = result.recordset.map(doc => doc.pre_id);
          const datosFiltrados = equivalente.recordset.filter(doc => !idsNoPermitidos.includes(doc.pre_id))
          var prueba = result.recordset.concat(datosFiltrados);
          prueba.sort(function(a,b){ return a.ppa_precio < b.ppa_precio?1:-1 });          
         return res.json(prueba)

      }
      if (result.recordset && !result?.recordset[0]?.pre_ids_mostrar) {
        return res.json(result.recordset);
      } else {
        return res.status(500).json({ message: "Producto no existe" });
      }
    }
    if (
      req.body.p &&
      !req.body.altura &&
      !req.body.exterior &&
      req.body.interior
    ) {
      const result = await pool
        .request()
        .query(
          c.concat(
            " ",
            `and p.pre_codigo_fabrica ='${req.body.p}' and p.interior BETWEEN '${ib}' and '${ip}'`
          )
        );

      if (result.recordset.length <= 0) {
        // console.log("hola buscamos todo ahora");

        const productos = await pool
          .request()
          .query(b.concat(" ", `and p.interior BETWEEN '${ib}' and '${ip}'`));
        return res.json(productos.recordset);
      }

      //  console.log(result.recordset, "valor");

      if (result.recordset && result?.recordset[0]?.pre_ids_mostrar) {
        const equivalente = await pool
          .request()
          .query(
            d.concat(
              " ",
              `AND PRODUCTOS.PRE_ID IN (${result.recordset[0].pre_ids_mostrar}) ORDER BY MAR_DESCRIPCION`
            )
          );

          const idsNoPermitidos = result.recordset.map(doc => doc.pre_id);
          const datosFiltrados = equivalente.recordset.filter(doc => !idsNoPermitidos.includes(doc.pre_id))
          var prueba = result.recordset.concat(datosFiltrados);
          prueba.sort(function(a,b){ return a.ppa_precio < b.ppa_precio?1:-1 });          
         return res.json(prueba)

       // return res.json([{ m: result.recordset }, equivalente.recordset]);
      }
      if (result.recordset && !result?.recordset[0]?.pre_ids_mostrar) {
        return res.json(result.recordset);
      } else {
        return res.status(500).json({ message: "Producto no existe" });
      }
    }

    if (
      req.body.p &&
      !req.body.altura &&
      req.body.exterior &&
      !req.body.interior
    ) {
      console.log("producto + altura");
      console.log(req.body.p, en, ep);
      const result = await pool
        .request()
        .query(
          c.concat(
            " ",
            `and p.pre_codigo_fabrica ='${req.body.p}' and p.exterior BETWEEN '${en}' and '${ep}'`
          )
        );
      if (result.recordset.length <= 0) {
        // console.log("hola buscamos todo ahora");
        // console.log("todo + altura");
        // console.log(req.body.p, en, ep);

        const productos = await pool
          .request()
          .query(b.concat(" ", `and p.exterior BETWEEN '${en}' and '${ep}'`));
        return res.json(productos.recordset);
      }

      if (result.recordset && result?.recordset[0]?.pre_ids_mostrar) {
        const equivalente = await pool
          .request()
          .query(
            d.concat(
              " ",
              `AND PRODUCTOS.PRE_ID IN (${result.recordset[0].pre_ids_mostrar}) ORDER BY MAR_DESCRIPCION`
            )
          );

          const idsNoPermitidos = result.recordset.map(doc => doc.pre_id);
          const datosFiltrados = equivalente.recordset.filter(doc => !idsNoPermitidos.includes(doc.pre_id))
          var prueba = result.recordset.concat(datosFiltrados);
          prueba.sort(function(a,b){ return a.ppa_precio < b.ppa_precio?1:-1 });          
         return res.json(prueba)
          

       /// return res.json([{ m: result.recordset }, equivalente.recordset]);
      }
      if (result.recordset && !result?.recordset[0]?.pre_ids_mostrar) {
        return res.json(result.recordset);
      } else {
        return res.status(500).json({ message: "Producto no existe" });
      }
    }

    if (
      req.body.p &&
      req.body.altura &&
      !req.body.exterior &&
      !req.body.interior
    ) {
      //   console.log("producto + altura");
      //   console.log(req.body.p, an, ap);
      const result = await pool
        .request()
        .query(
          c.concat(
            " ",
            `and p.pre_codigo_fabrica ='${req.body.p}' and p.altura BETWEEN '${an}' and '${ap}'`
          )
        );
      //   console.log(query);

      if (result.recordset.length <= 0) {
        //   console.log("hola buscamos todo ahora");

        const productos = await pool
          .request()
          .query(b.concat(" ", `and p.altura BETWEEN '${an}' and '${ap}'`));
        return res.json(productos.recordset);
      }

      if (result.recordset && result?.recordset[0]?.pre_ids_mostrar) {
        const equivalente = await pool
          .request()
          .query(
            d.concat(
              " ",
              `AND PRODUCTOS.PRE_ID IN (${result.recordset[0].pre_ids_mostrar}) ORDER BY MAR_DESCRIPCION`
            )
          );

          const idsNoPermitidos = result.recordset.map(doc => doc.pre_id);
          const datosFiltrados = equivalente.recordset.filter(doc => !idsNoPermitidos.includes(doc.pre_id))
          var prueba = result.recordset.concat(datosFiltrados);
          prueba.sort(function(a,b){ return a.ppa_precio < b.ppa_precio?1:-1 });          
         return res.json(prueba)

        //return res.json([{ m: result.recordset }, equivalente.recordset]);
      }
      if (result.recordset && !result?.recordset[0]?.pre_ids_mostrar) {
        return res.json(result.recordset);
      } else {
        return res.status(500).json({ message: "Producto no existe" });
      }
    }

    if (
      req.body.p &&
      req.body.altura &&
      req.body.exterior &&
      req.body.interior
    ) {
      const result = await pool.request().query(
        c.concat(
          " ",
          `and p.pre_codigo_fabrica ='${req.body.p}' 
              and p.interior BETWEEN '${ib}' and '${ip}'
              and p.altura BETWEEN '${an}' and '${ap}'
              and p.exterior BETWEEN '${en}' and '${ep}'
             `
        )
      );

      if (result.recordset.length <= 0) {
        const productos = await pool.request().query(
          b.concat(
            " ",
            `and p.interior BETWEEN '${ib}' and '${ip}'
          and p.altura BETWEEN '${an}' and '${ap}'
          and p.exterior BETWEEN '${en}' and '${ep}'`
          )
        );
        return res.json(productos.recordset);
      }

      if (result.recordset && result?.recordset[0]?.pre_ids_mostrar) {
        const equivalente = await pool
          .request()
          .query(
            d.concat(
              " ",
              `AND PRODUCTOS.PRE_ID IN (${result.recordset[0].pre_ids_mostrar}) ORDER BY MAR_DESCRIPCION`
            )
          );
          const idsNoPermitidos = result.recordset.map(doc => doc.pre_id);
          const datosFiltrados = equivalente.recordset.filter(doc => !idsNoPermitidos.includes(doc.pre_id))
          var prueba = result.recordset.concat(datosFiltrados);
          prueba.sort(function(a,b){ return a.ppa_precio < b.ppa_precio?1:-1 });          
         return res.json(prueba)

        //return res.json([{ m: result.recordset }, equivalente.recordset]);
      }
      if (result.recordset && !result?.recordset[0]?.pre_ids_mostrar) {
        return res.json(result.recordset);
      } else {
        return res.status(500).json({ message: "Producto no existe" });
      }
    }

    if (
      req.body.p &&
      req.body.altura &&
      !req.body.exterior &&
      req.body.interior
    ) {
      const result = await pool.request().query(
        c.concat(
          " ",
          `and p.pre_codigo_fabrica ='${req.body.p}' 
              and p.interior BETWEEN '${ib}' and '${ip}'
              and p.altura BETWEEN '${an}' and '${ap}'
             `
        )
      );

      if (result.recordset.length <= 0) {
        const productos = await pool.request().query(
          b.concat(
            " ",
            `and p.interior BETWEEN '${ib}' and '${ip}'
          and p.altura BETWEEN '${an}' and '${ap}'
          `
          )
        );
        return res.json(productos.recordset);
      }

      if (result.recordset && result?.recordset[0]?.pre_ids_mostrar) {
        const equivalente = await pool
          .request()
          .query(
            d.concat(
              " ",
              `AND PRODUCTOS.PRE_ID IN (${result.recordset[0].pre_ids_mostrar}) ORDER BY MAR_DESCRIPCION`
            )
          );

          const idsNoPermitidos = result.recordset.map(doc => doc.pre_id);
          const datosFiltrados = equivalente.recordset.filter(doc => !idsNoPermitidos.includes(doc.pre_id))
          var prueba = result.recordset.concat(datosFiltrados);
          prueba.sort(function(a,b){ return a.ppa_precio < b.ppa_precio?1:-1 });          
         return res.json(prueba)
        //return res.json([{ m: result.recordset }, equivalente.recordset]);
      }
      if (result.recordset && !result?.recordset[0]?.pre_ids_mostrar) {
        return res.json(result.recordset);
      } else {
        return res.status(500).json({ message: "Producto no existe" });
      }
    }

    if (
      req.body.p &&
      !req.body.altura &&
      req.body.exterior &&
      req.body.interior
    ) {
      const result = await pool.request().query(
        c.concat(
          " ",
          `and p.pre_codigo_fabrica ='${req.body.p}' 
              and p.interior BETWEEN '${ib}' and '${ip}'
              and p.exterior BETWEEN '${en}' and '${ep}'
             `
        )
      );

      if (result.recordset.length <= 0) {
        const productos = await pool.request().query(
          b.concat(
            " ",
            `and p.interior BETWEEN '${ib}' and '${ip}'
          and p.exterior BETWEEN '${en}' and '${ep}'`
          )
        );
        return res.json(productos.recordset);
      }

      if (result.recordset && result?.recordset[0]?.pre_ids_mostrar) {
        const equivalente = await pool
          .request()
          .query(
            d.concat(
              " ",
              `AND PRODUCTOS.PRE_ID IN (${result.recordset[0].pre_ids_mostrar}) ORDER BY MAR_DESCRIPCION`
            )
          );
          const idsNoPermitidos = result.recordset.map(doc => doc.pre_id);
          const datosFiltrados = equivalente.recordset.filter(doc => !idsNoPermitidos.includes(doc.pre_id))
          var prueba = result.recordset.concat(datosFiltrados);
          prueba.sort(function(a,b){ return a.ppa_precio < b.ppa_precio?1:-1 });          
         return res.json(prueba)


       // return res.json([{ m: result.recordset }, equivalente.recordset]);
      }
      if (result.recordset && !result?.recordset[0]?.pre_ids_mostrar) {
        return res.json(result.recordset);
      } else {
        return res.status(500).json({ message: "Producto no existe" });
      }
    }

    if (
      req.body.p &&
      req.body.altura &&
      req.body.exterior &&
      !req.body.interior
    ) {
      const result = await pool.request().query(
        c.concat(
          " ",
          `and p.pre_codigo_fabrica ='${req.body.p}' 
              and p.altura BETWEEN '${an}' and '${ap}'
              and p.exterior BETWEEN '${en}' and '${ep}'
             `
        )
      );

      if (result.recordset.length <= 0) {
        const productos = await pool.request().query(
          b.concat(
            " ",
            `and p.altura BETWEEN '${an}' and '${ap}'
          and p.exterior BETWEEN '${en}' and '${ep}'`
          )
        );
        return res.json(productos.recordset);
      }

      if (result.recordset && result?.recordset[0]?.pre_ids_mostrar) {
        const equivalente = await pool
          .request()
          .query(
            d.concat(
              " ",
              `AND PRODUCTOS.PRE_ID IN (${result.recordset[0].pre_ids_mostrar}) ORDER BY MAR_DESCRIPCION`
            )
          );
          const idsNoPermitidos = result.recordset.map(doc => doc.pre_id);
          const datosFiltrados = equivalente.recordset.filter(doc => !idsNoPermitidos.includes(doc.pre_id))
          var prueba = result.recordset.concat(datosFiltrados);
          prueba.sort(function(a,b){ return a.ppa_precio < b.ppa_precio?1:-1 });          
         return res.json(prueba)

        //return res.json([{ m: result.recordset }, equivalente.recordset]);
      }
      if (result.recordset && !result?.recordset[0]?.pre_ids_mostrar) {
        return res.json(result.recordset);
      } else {
        return res.status(500).json({ message: "Producto no existe" });
      }
    }
  }
  /////////////////////////////////////////////////////////////////////
  if (
    !req.body.p &&
    !req.body.altura &&
    !req.body.exterior &&
    req.body.interior
  ) {
    console.log("estoy buscando aqui solo interior");
    const result = await pool.request().query(
      c.concat(
        " ",
        `and p.interior BETWEEN '${ib}' and '${ip}'
           `
      )
    );

    return res.json(result.recordset);
  }
  if (
    !req.body.p &&
    !req.body.altura &&
    req.body.exterior &&
    !req.body.interior
  ) {
    const result = await pool.request().query(
      c.concat(
        " ",
        `and p.exterior BETWEEN '${en}' and '${ep}'
           `
      )
    );

    return res.json(result.recordset);
  }
  if (
    !req.body.p &&
    req.body.altura &&
    !req.body.exterior &&
    !req.body.interior
  ) {
    const result = await pool.request().query(
      c.concat(
        " ",
        `and p.altura BETWEEN '${an}' and '${ap}'
        `
      )
    );

    return res.json(result.recordset);
  }

  if (
    !req.body.p &&
    req.body.altura &&
    !req.body.exterior &&
    req.body.interior
  ) {
    const result = await pool.request().query(
      c.concat(
        " ",
        `and p.altura BETWEEN '${an}' and '${ap}'
        and p.interior BETWEEN '${ib}' and '${ip}'
        `
      )
    );

    return res.json(result.recordset);
  }

  if (
    !req.body.p &&
    !req.body.altura &&
    req.body.exterior &&
    req.body.interior
  ) {
    const result = await pool.request().query(
      c.concat(
        " ",
        `and p.exterior BETWEEN '${en}' and '${ep}'
        and p.interior BETWEEN '${ib}' and '${ip}'
        `
      )
    );

    return res.json(result.recordset);
  }
  if (
    !req.body.p &&
    req.body.altura &&
    req.body.exterior &&
    !req.body.interior
  ) {
    const result = await pool.request().query(
      c.concat(
        " ",
        `and p.exterior BETWEEN '${en}' and '${ep}'
        and p.altura BETWEEN '${an}' and '${ap}'
        `
      )
    );

    return res.json(result.recordset);
  }

  if (
    !req.body.p &&
    req.body.altura &&
    req.body.exterior &&
    req.body.interior
  ) {
    const result = await pool.request().query(
      c.concat(
        " ",
        `and p.interior BETWEEN '${ib}' and '${ip}'
        and p.exterior BETWEEN '${en}' and '${ep}'
        and p.altura BETWEEN '${an}' and '${ap}'
        `
      )
    );

    return res.json(result.recordset);
  }
};


export const prueba246 = async (req, res) => {
 
  const pool = await getConnection();
  const p = `SELECT DISTINCT p.pre_id, pe.codigo_principal, pe.pre_ids_mostrar FROM productos p
  left join PRODUCTOS_EQUIVALENCIAS pe on p.pre_id = pe.pre_id_principal or p.pre_id = pe.pre_id_equivalente 
  WHERE p.pre_codigo_fabrica = '${req.body.p}'`;

  const result = await pool.request()
    .query(p);

var a = result.recordset?.map(function (o) {
  var p = o.pre_ids_mostrar;
  return p;
});
 var str = a.toString()
 console.log(str)

  return res.json(a);
};
