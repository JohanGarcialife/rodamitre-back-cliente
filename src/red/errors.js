import { succes, error } from "./respuestas.js";

export function errors (err, req, res, next){
    console.log(err, "erros")
    const message = err.message || "Error interno"
    const status = err.statusCode || 500;

    error(req, res, message, status)
}