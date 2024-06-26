import express from "express";
import cors from "cors"
import morgan from "morgan";
import producRoutes from './routes/products.routes.js'
import usuariosRoutes from './routes/usuario.routes.js'
import garantiaRoutes from './routes/garantias.routes.js'
import reclamosRoutes from './routes/reclamos.routes.js'
import { error } from "./red/respuestas.js";


const app = express();

app.use(express.json());

app.use(morgan('dev'));

app.use(cors());

/*rutas*/
app.use(usuariosRoutes)
app.use(producRoutes);
app.use(garantiaRoutes);
app.use(reclamosRoutes);

app.use(error)
/*cors */

/* app.use(cors({
    origin : lista
})) */

export default app;