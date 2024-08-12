import { query } from "express";
import sql from "mssql";
import { getConnection } from "../database/connections.js";
/////////////////////////////////////////////////////
export const buscar = async (req, res) => {
  const pool = await getConnection();
  const a = req.body.p.trim();
  const busqv = a.split(" ");
  console.log(busqv);

  const concatenar =
    busqv.length === 1
      ? `CAMPO_BUSQUEDA like '%${busqv[0]}%'  `
      : busqv.length === 2
      ? ` CAMPO_BUSQUEDA like '%${busqv[0]}%' 
      and CAMPO_BUSQUEDA like '%${busqv[1]}%'`
      : busqv.length === 3
      ? `CAMPO_BUSQUEDA like '%${busqv[0]}%' 
      and CAMPO_BUSQUEDA like '%${busqv[1]}%' 
      and CAMPO_BUSQUEDA like '%${busqv[2]}%'`
      : busqv.length === 4
      ? ` CAMPO_BUSQUEDA like '%${busqv[0]}%' 
      and CAMPO_BUSQUEDA like '%${busqv[1]}%' 
      and CAMPO_BUSQUEDA like '%${busqv[2]}%'
      and CAMPO_BUSQUEDA like '%${busqv[3]}%'`
      : ` CAMPO_BUSQUEDA like '%${busqv[0]}%' 
      and CAMPO_BUSQUEDA like '%${busqv[1]}%' 
      and CAMPO_BUSQUEDA like '%${busqv[2]}%' 
      and CAMPO_BUSQUEDA like '%${busqv[3]}%'
      and CAMPO_BUSQUEDA like '%${busqv[4]}%'
      `;

  const pro = `codigo_principal like '%${req.body.p}%'`;
  const p = `select DISTINCT al.pre_id_principal,al.codigo_principal,(select distinct ps.codigo_equivalente, 
  ps.pre_id_equivalente, ps.pre_id_principal  from PRODUCTOS_EQUIVALENCIAS ps where  CODIGO_EQUIVALENTE ='${req.body.p}' 
  and al.PRE_ID_PRINCIPAL = ps.pre_id_principal FOR JSON PATH) as comparar from PRODUCTOS_EQUIVALENCIAS al where`;
  const b = p.concat(" ", concatenar);
  const c = p.concat(" ", pro);
  const h = ` 
    select p.pre_id, r.rup_descripcion as rubro, p.pre_notas as notas,(select distinct p2.pre_codigo_fabrica as codigo, p2.formado_por, p2.es_parte_de,
    p2.intercambiables, pe.pre_id_principal,pe.pre_id_equivalente,mp2.mar_descripcion as marca_articulo, dpv2.ppa_precio, 
    p2.pre_stock_actual from PRODUCTOS_EQUIVALENCIAS pe, PRODUCTOS p2, MARCAS_PRODUCTOS mp2, DETALLE_LISTA_PRECIOS_VENTA dpv2 
    where pe.PRE_ID_EQUIVALENTE = p2.PRE_ID and pe.PRE_ID_PRINCIPAL = p.PRE_ID and p2.mar_id = mp2.mar_id 
     and p2.PRE_ID = dpv2.PRE_ID and dpv2.LPP_ID = 1 and p2.pre_activo = 'SI' order by dpv2.ppa_precio desc FOR JSON PATH ) as todo,
    (select distinct pd.marca_modelo, (select distinct pd4.descripcion_hover as hover
    from productos_descripciones pd4 where pd.marca_modelo = pd4.marca_modelo and pd4.pre_id= p.pre_id FOR JSON PATH) as hover
    from productos_descripciones pd where p.pre_id = pd.pre_id FOR JSON PATH ) as aplicaciones,
    (select a.atr_descripcion, pa.pra_valor from ATRIBUTOS a, PRODUCTOS_ATRIBUTOS pa where pa.atr_id = a.atr_id and pa.pra_valor != '0.000'
    and p.pre_id = pa.pre_id  FOR JSON PATH ) as atributos from productos as p
    join RUBROS as r on p.rup_id = r.rup_id WHERE `;

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

  async function buscamos(result) {
    if (result.recordset.length > 0) {
      const array = result.recordset.map((item) => {
        return item.pre_id_principal;
      });

      const id = array.toString();
      console.log(id, "busqueda");

      const producto = await pool
        .request()
        .query(h.concat(" ", `p.pre_id in (${id})`));

      producto.recordset.forEach((e) =>
        result.recordset.some(
          (t) => t.pre_id_principal === e.pre_id && (e.c = t.comparar)
        )
      );

      producto.recordset.sort(function (a) {
        return a.c ? -1 : 1;
      });

      return res.json(producto.recordset);
    } else {
      res.status(500).json({ message: "Producto no existe" });
    }
  }

  if (
    req.body.p &&
    !req.body.altura &&
    !req.body.exterior &&
    !req.body.interior
  ) {
    const result = await pool.request().query(c);
    if (result.recordset.length > 0) {
      console.log("BUSCAMOS EL CODIGO PRINCIPAL");
      buscamos(result);
    } else {
      console.log("Buscamos campo busqueda");
      const result = await pool.request().query(b);
      console.log(result);
      buscamos(result);
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
      .query(c.concat(" ", `and interior BETWEEN '${ib}' and '${ip}'`));

    if (result.recordset.length > 0) {
      console.log("BUSCAMOS EL CODIGO PRINCIPAL");
      buscamos(result);
    } else {
      const result = await pool
        .request()
        .query(b.concat(" ", `and interior BETWEEN '${ib}' and '${ip}'`));
      console.log("Buscamos campo busqueda");
      buscamos(result);
    }
  }

  if (
    req.body.p &&
    !req.body.altura &&
    req.body.exterior &&
    !req.body.interior
  ) {
    console.log("busqueda producto + exterior");
    const result = await pool
      .request()
      .query(c.concat(" ", `and exterior BETWEEN '${en}' and '${ep}'`));

    if (result.recordset.length > 0) {
      console.log("BUSCAMOS EL CODIGO PRINCIPAL");
      buscamos(result);
    } else {
      const result = await pool
        .request()
        .query(b.concat(" ", `and exterior BETWEEN '${en}' and '${ep}'`));
      console.log("Buscamos campo busqueda");
      buscamos(result);
    }
  }
  if (
    req.body.p &&
    req.body.altura &&
    !req.body.exterior &&
    !req.body.interior
  ) {
    const result = await pool
      .request()
      .query(c.concat(" ", `and altura BETWEEN '${an}' and '${ap}'`));

    if (result.recordset.length > 0) {
      console.log("BUSCAMOS EL CODIGO PRINCIPAL");
      buscamos(result);
    } else {
      const result = await pool
        .request()
        .query(b.concat(" ", `and altura BETWEEN '${an}' and '${ap}'`));
      console.log("Buscamos campo busqueda");
      buscamos(result);
    }
  }
  ///

  if (req.body.p && req.body.altura && req.body.exterior && req.body.interior) {
    console.log("busqueda todos los valores");
    const result = await pool.request().query(
      c.concat(
        " ",
        `and interior BETWEEN '${ib}' and '${ip}'
         and altura BETWEEN '${an}' and '${ap}'
         and exterior BETWEEN '${en}' and '${ep}'`
      )
    );

    if (result.recordset.length > 0) {
      console.log("BUSCAMOS EL CODIGO PRINCIPAL");
      buscamos(result);
    } else {
      const result = await pool.request().query(
        b.concat(
          " ",
          `and interior BETWEEN '${ib}' and '${ip}'
           and altura BETWEEN '${an}' and '${ap}'
           and exterior BETWEEN '${en}' and '${ep}'`
        )
      );
      console.log("Buscamos campo busqueda");
      buscamos(result);
    }
  }

  if (
    req.body.p &&
    req.body.altura &&
    !req.body.exterior &&
    req.body.interior
  ) {
    console.log("busqueda producto + altura + interior");
    const result = await pool.request().query(
      c.concat(
        " ",
        `and interior BETWEEN '${ib}' and '${ip}'
         and altura BETWEEN '${an}' and '${ap}'
         `
      )
    );

    if (result.recordset.length > 0) {
      console.log("BUSCAMOS EL CODIGO PRINCIPAL");
      buscamos(result);
    } else {
      const result = await pool.request().query(
        b.concat(
          " ",
          `and interior BETWEEN '${ib}' and '${ip}'
           and altura BETWEEN '${an}' and '${ap}'
           `
        )
      );
      console.log("Buscamos campo busqueda");
      buscamos(result);
    }
  }
  if (
    req.body.p &&
    !req.body.altura &&
    req.body.exterior &&
    req.body.interior
  ) {
    console.log("busqueda producto + exterior + interior");

    const result = await pool.request().query(
      c.concat(
        " ",
        `and interior BETWEEN '${ib}' and '${ip}'
         and exterior BETWEEN '${en}' and '${ep}'`
      )
    );
    if (result.recordset.length > 0) {
      console.log("BUSCAMOS EL CODIGO PRINCIPAL");
      buscamos(result);
    } else {
      const result = await pool.request().query(
        b.concat(
          " ",
          `and interior BETWEEN '${ib}' and '${ip}'
           and exterior BETWEEN '${en}' and '${ep}'`
        )
      );
      console.log("Buscamos campo busqueda");
      buscamos(result);
    }
  }

  if (
    req.body.p &&
    req.body.altura &&
    req.body.exterior &&
    !req.body.interior
  ) {
    console.log("busqueda producto + exterior + interior");
    const result = await pool.request().query(
      c.concat(
        " ",
        `and altura BETWEEN '${an}' and '${ap}'
         and exterior BETWEEN '${en}' and '${ep}'`
      )
    );

    if (result.recordset.length > 0) {
      console.log("BUSCAMOS EL CODIGO PRINCIPAL");
      buscamos(result);
    } else {
      const result = await pool.request().query(
        b.concat(
          " ",
          `
           and altura BETWEEN '${an}' and '${ap}'
           and exterior BETWEEN '${en}' and '${ep}'`
        )
      );
      console.log("Buscamos campo busqueda");
      buscamos(result);
    }
  }
  if (
    !req.body.p &&
    !req.body.altura &&
    !req.body.exterior &&
    req.body.interior
  ) {
    console.log("existe interior");
    console.log(ib, ip, "interior valor");

    const result = await pool.request().query(
      p.concat(
        " ",
        `
        interior BETWEEN '${ib}' and '${ip}'`
      )
    );

    buscamos(result);

    ///res.status(500).json({ message: "Producto no existe" });
  }

  if (
    !req.body.p &&
    !req.body.altura &&
    req.body.exterior &&
    !req.body.interior
  ) {
    console.log("existe exterior");

    const result = await pool.request().query(
      p.concat(
        " ",
        `
        exterior BETWEEN '${en}' and '${ep}'
        `
      )
    );
    buscamos(result);
  }

  if (
    !req.body.p &&
    req.body.altura &&
    !req.body.exterior &&
    !req.body.interior
  ) {
    console.log("existe altura");
    const result = await pool.request().query(
      p.concat(
        " ",
        `
        altura BETWEEN '${an}' and '${ap}'
        `
      )
    );
    buscamos(result);

    /// res.status(500).json({ message: "Producto no existe" });
  }
  if (
    !req.body.p &&
    req.body.altura &&
    !req.body.exterior &&
    req.body.interior
  ) {
    console.log("existe altura e interior");

    const result = await pool.request().query(
      p.concat(
        " ",
        `
        altura BETWEEN '${an}' and '${ap}'
        and interior BETWEEN '${ib}' and '${ip}'
        `
      )
    );
    buscamos(result);
    // res.status(500).json({ message: "Producto no existe" });
  }
  if (
    !req.body.p &&
    !req.body.altura &&
    req.body.exterior &&
    req.body.interior
  ) {
    console.log("existe exterior e interior");
    const result = await pool.request().query(
      p.concat(
        " ",
        `
        exterior BETWEEN '${en}' and '${ep}'
        and interior BETWEEN '${ib}' and '${ip}'
        `
      )
    );
    buscamos(result);
    // res.status(500).json({ message: "Producto no existe" });
  }
  if (
    !req.body.p &&
    req.body.altura &&
    req.body.exterior &&
    !req.body.interior
  ) {
    console.log("existe exterior e altura");
    const result = await pool.request().query(
      p.concat(
        " ",
        `
        exterior BETWEEN '${en}' and '${ep}'
        and altura BETWEEN '${an}' and '${ap}'
        `
      )
    );
    buscamos(result);
    ///res.status(500).json({ message: "Producto no existe" });
  }
  if (
    !req.body.p &&
    req.body.altura &&
    req.body.exterior &&
    req.body.interior
  ) {
    console.log("existe exterior e altura");
    const result = await pool.request().query(
      p.concat(
        " ",
        `
        interior BETWEEN '${ib}' and '${ip}'
        and exterior BETWEEN '${en}' and '${ep}'
        and altura BETWEEN '${an}' and '${ap}'
        `
      )
    );
    buscamos(result);
  }
};
