var express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config

//const { isNewExpression } = require('typescript');
var app = express();

/*
var myLogger = function (req, res, next) {
  console.log('LOGGED');
  next();
};
*/


let requestTime = function (req: any, res: any, next: any) {
    req.requestTime = Date.now();
    next();
  };


let checkHeader = function(req: any, res: any, next: any){
    let authHeader = req.headers.authorization;
    if (authHeader) {
        next();
    }else{
        next();
        res.status(400).send({'err' : 'No auth header'})
    }
};

function checkToken(req: any, res: any, next: any){
  let bearerHeader = req.headers.authorization;
  if(typeof bearerHeader!=='undefined'){
      const bearerToken = bearerHeader.split(' ')[1];
      req.token=bearerToken;
      next();
  }else{
      res.sendStatus(403);
  }
}

function verifyAndAuthenticate(req: any, res: any, next: any){
  let decoded = jwt.verify(req.token, process.env.JWT_KEY);
  if(decoded !== null)
    req.user = decoded;
    next();
}
/*
function logErrors(req: any, res: any, next: any) {
    console.error(err.stack);
    next(err);
  }

function errorHandler(req: any, res: any, next: any) {   
    res.status(500).send({"error": err.message});
}
*/
  
export const jwtAuth = [requestTime, checkToken, verifyAndAuthenticate];

/*
app.use(myLogger);
app.use(requestTime);
app.use(checkToken);
app.use(verifyAndAuthenticate);
app.use(logErrors);
app.use(errorHandler);
*/