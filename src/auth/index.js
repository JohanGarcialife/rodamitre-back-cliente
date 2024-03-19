import jwt from "jsonwebtoken"

const secret = "clavesecreta"

export function asignarToken(data){
    return jwt.sign(data, secret)
}