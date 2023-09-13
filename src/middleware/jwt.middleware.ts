var express = require('express');
// Importa il modulo 'jsonwebtoken' per la gestione dei token JWT.
const jwt = require('jsonwebtoken');
// Importa il modulo 'dotenv' per la gestione delle variabili d'ambiente.
require('dotenv').config;

// Importa le costanti e le funzioni relative ai codici di stato HTTP da 'http-status-codes'.
import {
	ReasonPhrases,
	StatusCodes,
	getReasonPhrase,
	getStatusCode,
} from 'http-status-codes';


// Middleware che registra un messaggio di log.

var myLogger = function (req: any, res: any, next: any) {
  console.log('LOGGED');
  next();
};


// Middleware che aggiunge un timestamp alla richiesta.
let requestTime = function (req: any, res: any, next: any) {
    req.requestTime = Date.now();
    next();
  };

// Middleware che verifica la presenza dell'intestazione di autorizzazione.
let checkHeader = function(req: any, res: any, next: any){
    let authHeader = req.headers.authorization;
    if (authHeader) {
        next();
    }else{
        res.status(StatusCodes.BAD_REQUEST).send({'err' : 'No auth header'})
    }
};


// Middleware che verifica la presenza e l'estrazione del token JWT dall'intestazione di autorizzazione.

function checkToken(req: any, res: any, next: any){
  let bearerHeader = req.headers.authorization;
  if(typeof bearerHeader!=='undefined'){
      const bearerToken = bearerHeader.split(' ')[1];
      req.token=bearerToken;
      next();
  }else{
      res
      .status(StatusCodes.UNAUTHORIZED)
      .send({'err' : 'Errore nella verifica del token!!'});
  }
}


// Middleware che verifica e autentica il token JWT.

function verifyAndAuthenticate(req: any, res: any, next: any){
  let decoded = jwt.verify(req.token, process.env.JWT_KEY);
  if(decoded !== null){
    req.user = decoded;
    next();
  }else{
    res
      .status(StatusCodes.UNAUTHORIZED)
      .send({'err' : 'Errore nella verifica del token!!'});
    }
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
  
export const jwtAuth = [requestTime, checkHeader, checkToken, verifyAndAuthenticate, myLogger];

