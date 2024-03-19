export function succes (req, res, mensaje, status) {
   const statusCode = status || 200;
   const mensajeOK = mensaje || "";
   
    res.status(status).send({
        error:false,
        status:statusCode,
        body:mensajeOK
    });
}

export function error (req, res, mensaje, status) {

    const statusCodeError = status || 500;
    const mensajeError = mensaje || "Error Interno";

    res.status(status).send({
        error:true,
        status: statusCodeError,
        body: mensajeError
    });
}