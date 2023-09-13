// Importa i moduli relativi ai codici di stato HTTP e 'Ajv' per la validazione JSON.
import {
	ReasonPhrases,
	StatusCodes,
	getReasonPhrase,
	getStatusCode,
} from 'http-status-codes';
const Ajv = require("ajv")

// Crea un'istanza di 'Ajv' per la validazione JSON.
const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}

// Schema per la validazione di oggetti 'Store'.
const schemaStore = {
  "type": "object",
  "properties": {
    "food": { "type": "string" },
    "quantity": { "type": "integer" }
  },
  "required": ["food", "quantity"]
}

// Schema per la validazione di oggetti 'Range'.
const schemaRange = {
  "type": "object",
  "properties": {
    "start": { "type": "string" },
    "end": { "type": "string" }
  },
  "required": ["start", "end"]
}

// Schema per la validazione di oggetti 'Token'.
const schemaToken = {
  "type" : "object",
  "properties" : {
    "user" : {"type" : "string"},
    "token" : {"type" : "integer"}
  },
  "required" : ["user" , "token"]
}

// Middleware per la validazione dell'aggiornamento del token.
export function validateTokenUpdate(req:any, res:any, next:any){
  const validate = ajv.compile(schemaToken)
  const valid = validate(req.body)
  if (!valid){
    res
    .status(StatusCodes.UNPROCESSABLE_ENTITY)
    .send({'err' : 'Json del body non valido!!'});
  }
  else{
    next();
  }
}

// Middleware per la validazione dei dati di intervallo.
export function validateRangeData(req:any, res:any, next:any){
  const validate = ajv.compile(schemaRange)
  const valid = validate(req.body)
  if (!valid){
    res
    .status(StatusCodes.UNPROCESSABLE_ENTITY)
    .send({'err' : 'Json del body non valido!!'});
  }
  else{
    next();
  }
}

// Middleware per la validazione della creazione di un oggetto 'Store'.
export function validateCreateStore(req:any, res:any, next:any){
  const validate = ajv.compile(schemaStore)
  const valid = validate(req.body)
  if (!valid){
    res
    .status(StatusCodes.UNPROCESSABLE_ENTITY)
    .send({'err' : 'Json del body non valido!!'});
  }
  else{
    next();
  }
}

// Middleware per la validazione della creazione di un ordine.
export function validateCreateOrder(req:any, res:any, next:any){
  const validate = ajv.compile(schemaStore)
  let item = req.body.requestOrder;
  const numberOfElements = Object.keys(item).length;
  if(numberOfElements == 1){
    item = item[0];
    const valid = validate(item)
    if (!valid){
      res
      .status(StatusCodes.UNPROCESSABLE_ENTITY)
      .send({'err' : 'Json del body non valido!!'});
    }
    else{
      next();
    }
  }
  else{
    item.map(async (items: any) => {
      let valid = validate(items)
      if (!valid){
        res
        .status(StatusCodes.UNPROCESSABLE_ENTITY)
        .send({'err' : 'Json del body non valido!!'});
      }
    })
    next();
  }
}

// Middleware per la validazione del caricamento di un ordine.
export function validateLoadOrder(req:any, res:any, next:any){
  const validate = ajv.compile(schemaStore)
  let item = req.body.loadOrder;
  const numberOfElements = Object.keys(item).length;
  if(numberOfElements == 1){
    item = item[0];
    const valid = validate(item)
    if (!valid){
      res
      .status(StatusCodes.UNPROCESSABLE_ENTITY)
      .send({'err' : 'Json del body non valido!!'});
    }
    else{
      next();
    }
  }
  else{
    item.map(async (items: any) => {
      let valid = validate(items)
      if (!valid){
        res
        .status(StatusCodes.UNPROCESSABLE_ENTITY)
        .send({'err' : 'Json del body non valido!!'});
      }
    })
    next();
  }
}
