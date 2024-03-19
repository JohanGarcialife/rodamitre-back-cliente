import { Router } from "express";
import {
  getvehiculos,
  getvehiculosmarcaId,
  getrubrosId,
  getviewConsultAuto,
  geproductosId,
  getviewConsult,
  getviewConsultmodelo,
  getmarcaArticulo,
  getrubroArticulo,
  getrubrosMod,
  getmotorRu,
  busquedaCodigo

} from "../controllers/products.controllers.js";

const router = Router();

/*lista productos*/
  /*productos todos los productos segun su cliente*/
router.get("/productos/:id/:lpp", geproductosId);
/*lista productos prueba comparacion*/
router.get("/viewconsul", getviewConsult);
/*buscador segun la marca del vehiculo*/
router.post("/productomarcauto/:id/:lpp", getviewConsultAuto); 
/*buscador segun el mododelo del vehiculo*/
router.post("/productomodeloautos/:id/:lpp", getviewConsultmodelo);
/*marca de autos*/
router.get("/marcautos", getvehiculos);
/*modelos segun la marca*/
router.get("/modelos/:id", getvehiculosmarcaId);
/*rubros todos y con id de marcaAuto */
router.post("/superubrosAuto", getrubrosId);
/////// marca articulo, todas las marcas o 
router.post("/marcarticulo", getmarcaArticulo )
/*rubro segun su suṕer rubro o marca de articulo */
router.post("/rubro", getrubroArticulo )
/**rubro segun su modelo de vehiculo */
router.post("/rubromod", getrubrosMod )
////////atributos//////
router.post("/motorud", getmotorRu )
//////////////////////////////////////////
router.get("/atributos", busquedaCodigo);
/*buscador familias*/
/* view consulta todos los vehiculos */ 
/*view consulta todas las marcas*/
/*consulta todos los modelos*/
/*view consulta todos super rubros*/
/*consulta todos los rubros*/

export default router;  
