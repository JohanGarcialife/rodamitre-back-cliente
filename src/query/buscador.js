
 
`
select distinct p.pre_codigo_fabrica as codigo, p.pre_notas as notas, p.pre_stock_actual, p.intercambiables, p.formado_por, 
      p.es_parte_de, p.ventas_ult6meses, p.altura, p.exterior, p.interior,
      (select a.atr_descripcion, pa.pra_valor from ATRIBUTOS a, PRODUCTOS_ATRIBUTOS pa where pa.atr_id = a.atr_id and p.pre_id = pa.pre_id  FOR JSON PATH ) as atributos,
      (select distinct pd.marca_modelo, (select distinct pd4.descripcion_hover as hover 
      from productos_descripciones pd4 where pd.marca_modelo = pd4.marca_modelo and pd4.pre_id= p.pre_id FOR JSON PATH) as hover 
      from productos_descripciones pd where p.pre_id = pd.pre_id FOR JSON PATH ) as aplicaciones,
      mp.mar_descripcion as marca_articulo, sr.spr_descripcion as super_rubro, r.rup_descripcion as rubro, cdp.cdm_descuento as descuento_marca, 
      cdp2.cdp_descuento as descuento_producto, cdr.cdr_descuento as descuento_rubro, dlpv.ppa_precio, dlpv.lpp_id
      from PRODUCTOS p 
      join MARCAS_PRODUCTOS mp on p.mar_id = mp.mar_id
      Join SUPER_RUBROS sr on p.spr_id = sr.spr_id
      join RUBROS r on p.rup_id = r.rup_id
      join DETALLE_LISTA_PRECIOS_VENTA dlpv on p.pre_id = dlpv.pre_id and p.pre_activo  = 'SI'
      left join CLIENTES_DESC_PROCEDENCIAS cdp on cdp.cli_id = 1 and p.mar_id = cdp.mar_id and cdp.cdm_activo = 'SI' 
      left join CLIENTES_DESC_PRODUCTOS cdp2 on cdp2.cli_id = 1 and p.pre_id = cdp2.pre_id and cdp2.cdp_activo = 'SI'  
      left join CLIENTES_DESC_RUBROS cdr on cdr.cli_id = 1 and p.rup_id = cdr.rup_id  and cdr.cdr_activo = 'SI' 
      WHERE dlpv.lpp_id = 1 and p.pre_codigo_fabrica = '6204 2RSH/C3
`