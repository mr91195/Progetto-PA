import { UserDAO } from 'dao/users.dao';
import { UserRole} from '../models/users.model'
import {
	ReasonPhrases,
	StatusCodes,
	getReasonPhrase,
	getStatusCode,
} from 'http-status-codes';

const userApp = new UserDAO();

/**
 * Middleware per il controllo del ruolo dell'utente come utente semplice .
 */
export async function checkUserRole(req:any, res:any, next:any){
    if(req.user.role==UserRole.User){
        next();
    }else{
        res
        .status(StatusCodes.UNAUTHORIZED)
	    .send({'err' : 'ruolo utenza non valido come admin'});
    }
}

/**
 * Middleware per il controllo del ruolo dell'utente come amministratore (ruolo ADMIN).
 */
export async function checkAdminRole(req:any, res:any, next:any){
    if(req.user.role==UserRole.Admin){
        next();
    }else{
        res
        .status(StatusCodes.UNAUTHORIZED)
	    .send({'err' : 'ruolo utenza non valido come user'});
    }
}



/**
 * Middleware per il controllo della quantità di token associata all'utente.
 */
export async function checkUserTokenAmount(req:any, res:any, next:any){
    try{
        const result= await userApp.retrieveByEmail(req.user.email)
        if(result.token > 0){
            next();
        }else{
            res
            .status(StatusCodes.UNAUTHORIZED)
            .send({'err' : "Token insufficienti"});
        }
    }catch(e){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e);
    }
}

