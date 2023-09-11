import { UserDAO } from 'dao/users.dao';
import { UserRole} from '../models/users.model'
import {
	ReasonPhrases,
	StatusCodes,
	getReasonPhrase,
	getStatusCode,
} from 'http-status-codes';

const userApp = new UserDAO();

//CONTROLLO SE UTENTE DI RUOLO 0 (UTENTE SEMPLICE)
export async function checkUserRole(req:any, res:any, next:any){
    if(req.user.role==UserRole.User){
        next();
    }else{
        res
        .status(StatusCodes.FORBIDDEN)
	    .send(ReasonPhrases.FORBIDDEN);
    }
}

//CONTROLLO SE UTENTE È DI RUOLO 1 (ADMIN)
export async function checkAdminRole(req:any, res:any, next:any){
    if(req.user.role==UserRole.Admin){
        next();
    }else{
        res
        .status(StatusCodes.FORBIDDEN)
	    .send(ReasonPhrases.FORBIDDEN);
    }
}




//CONTROLLE QUANTITÀ TOKEN ASSOCIATI ALL'UTENTE
export async function checkUserTokenAmount(req:any, res:any, next:any){
    try{
        const result= await userApp.retrieveByEmail(req.user.email)
        if(result.token > 0){
            next();
        }else{
            res
            .status(StatusCodes.FORBIDDEN)
            .send({'err' : "Token insufficienti"});
        }
    }catch(e){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e);
    }
}

