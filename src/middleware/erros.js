export function error (message, code){
let e = new(message)
if(code){
    e.statusCode = code
}
return e;
}