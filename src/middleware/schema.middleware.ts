import {
	ReasonPhrases,
	StatusCodes,
	getReasonPhrase,
	getStatusCode,
} from 'http-status-codes';
const Ajv = require("ajv")

const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}

const schemaStore = {
  
    "type": "object",
    "properties": {
      "food": { "type": "string" },
      "quantity": { "type": "integer" }
    },
    "required": ["food", "quantity"]
  }


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