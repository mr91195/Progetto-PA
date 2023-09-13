"use strict";

import { createModuleResolutionCache } from "typescript";
import {User, UserRole } from "./models/users.model";
import { UserDAO } from "dao/users.dao";
import { jwtAuth } from "middleware/jwt.middleware";
const jwt = require('jsonwebtoken');
import {
	ReasonPhrases,
	StatusCodes,
	getReasonPhrase,
	getStatusCode,
} from 'http-status-codes';
import { OrderDAO } from "dao/orders.dao";
import { StoreDAO} from "dao/store.dao";
import { Order, StatusOrder } from "models/orders.model";
import { Store } from "models/store.model";
import { stringify } from "querystring";
import { request } from "express";
import * as mdlSchema from "./middleware/schema.middleware";
import * as mdlStore from "./middleware/store-order.middleware";
import * as controlStore from './service/store.controller';
import * as controlOrder from './service/order.controller';
import * as mdlUser from './middleware/user.middleware';
import * as mdlOrder from './middleware/store-order.middleware';
require('dotenv').config

const orderDAO = new OrderDAO();
const storeDAO = new StoreDAO();
const userApp = new UserDAO();


const express = require("express");
const app = express();

app.use(express.json());



/**
 * Crea un nuovo alimento nello store.
 * 
 * @function
 * @name POST /store/create
 * @middleware jwtAuth - Verifica l'autenticazione JWT dell'utente.
 * @middleware mdlUser.checkUserTokenAmount - Controlla il quantitativo di token dell'utente.
 * @middleware mdlSchema.validateCreateStore - Valida lo schema json per la creazione dell'oggetto .
 */
app.post('/store/create', 
  [
    jwtAuth, 
    mdlUser.checkUserTokenAmount, 
    mdlSchema.validateCreateStore], 
  async (req: any, res: any) => {

    await controlStore.createFood(req, res);
    await userApp.decrementToken(req.user.email);

});

/**
 * Crea un nuovo ordine.
 * 
 * @function
 * @name POST /order/create
 * @middleware jwtAuth - Verifica l'autenticazione JWT dell'utente. 
 * @middleware mdlUser.checkUserTokenAmount - Controlla il quantitativo di token dell'utente.
 * @middleware mdlSchema.validateCreateOrder - Valida lo schema json per la creazione dell'ordine.
 * @middleware mdlOrder.checkFood - Controlla se gli alimenti sono presenti nello store.
 * @middleware mdlOrder.checkQuantity - Controlla se la quantità degli alimenti è presente nello store.
 */
app.post('/order/create', 
  [
    jwtAuth, 
    mdlUser.checkUserTokenAmount,
    mdlSchema.validateCreateOrder, 
    mdlOrder.checkFood, 
    mdlOrder.checkQuantity
  ],
  async (req: any, res: any) => {
    await controlOrder.createOrder(req, res);
    await userApp.decrementToken(req.user.email);

});

/**
 * Inizia l'esecuzione di un ordine.
 * 
 * @function
 * @name PUT /order/start/:uuid
 * @middleware jwtAuth - Verifica l'autenticazione JWT dell'utente.
 * @middleware mdlUser.checkUserTokenAmount - Controlla la quantità di token dell'utente.
 * @middleware mdlOrder.checkOrder - Controlla se l'ordine esiste.
 */
app.put('/order/start/:uuid',
  [
    jwtAuth, 
    mdlUser.checkUserTokenAmount, 
    mdlOrder.checkOrder
  ], 
  async (req: any, res: any, next: any) => {
  await controlOrder.orderStart(req, res, next);
  await userApp.decrementToken(req.user.email);
});


/**
 * Route per il caricamento di un ordine.
 * 
 * @route POST /order/:uuid/load
 * @group Order - Gestione degli ordini
 * @param {string} uuid - L'UUID dell'ordine da caricare.
 * @security JWT
 */
app.post('/order/:uuid/load',
  [
    jwtAuth, // Middleware per l'autenticazione JWT
    mdlUser.checkUserTokenAmount, // Middleware per verificare i token dell'utente
    mdlOrder.checkOrder, // Middleware per verificare l'esistenza dell'ordine
    mdlOrder.checkState, // Middleware per verificare lo stato dell'ordine
    mdlSchema.validateLoadOrder, // Middleware per validare il json di caricamento
    mdlOrder.checkLoad, // Middleware per verificare se l'alimento è presente.
    mdlOrder.checkQuantityLoad, // Middleware per verificare se la quantità è presente.
    mdlOrder.checkSequence // Middleware per verificare la sequenza di caricamento
  ],
  async (req: any, res: any) => {
    // Esegue la funzione per il caricamento dell'ordine
    await controlOrder.consumeStore(req, res);
    
    // Cambia lo stato dell'ordine in "Completato"
    orderDAO.changeStatus(StatusOrder.Completato, req.params.uuid);
    
    // Decrementa i token dell'utente che ha effettuato l'ordine
    await userApp.decrementToken(req.user.email);
  }
);


/**
 * Mostra lo stato dell'ordine corrispondente all'UUID specificato.
 * @param {string} uuid - UUID dell'ordine
 */
app.get('/order/status/:uuid', 
  jwtAuth, // Middleware per l'autenticazione JWT
  async (req: any, res: any) => {
  controlOrder.getOrder(req, res);
});



/**
 * Rotta libera, senza autenticazione mediante JWT per la ricerca dell'ordine in base a un intervallo di date.
 */
app.post('/order/search/range', 
  mdlSchema.validateRangeData, // middleware per la convalida del json schema
  async (req: any, res: any) => {
  await controlOrder.searchRange(req, res);
});


/**
 * Rotta per l'aggiornamento del token utente.
 */

app.put('/tokenUpdate', 
  [
    jwtAuth, //middleware per il JWT
    mdlUser.checkAdminRole, //middleware per il ruolo di admin
    mdlSchema.validateTokenUpdate   //middleware per la validazione del json schema
  ],
  async (req:any, res:any) => {

  let user: string = req.body.user;
  let token: number = parseInt(req.body.token);
  
  await userApp.updateToken(user, token)
  .then(()=>{
    res.send({'msg' : 'token auementati correttamente',
              'token' : token,
            'user' : user});
  } )
  .catch(()=>{
    res.status(StatusCodes.NOT_FOUND)
    .send({'err' : 'user non presente'});
  })
})



/**
 * Rotta per generare il token JWT per l'utente specificato.
 */
app.get('/login/:user', (req: any, res:any) => {
  let user = req.params.user;
  userApp.retrieveByEmail(user)
  .then((userFind) => {
    const key = "superSecretKeyJwt";
    const token = jwt.sign({"email" : userFind.email,
    "role" : userFind.role}, key);
    res.send({"token" : token})
      
    })
  
});




// ROTTA PER VERIFICA DEL TOKENJWT

app.get('/test', jwtAuth ,(req: any, res:any) => {

  res.send({"ROTTA": "Autenticazione effettuata correttamente","user" : req.user});
}); 








/*

  ROTTE PER DEV TESTING
  SONO TUTTE ROTTE LIBERE DA JWT E MIDDLEWARE VARI
  UTILIZZATE PER TESTARE LE CRUD SUI VARI MODELLI



*/

/*

app.get('/usersAll', (req: any, res:any) => {
  userApp.retrieveAll()
  .then((userDaoAll) => {
      res.send(userDaoAll);
      console.log('Users finded');
  })
  .catch((error) => {
      console.error('Error:', error);
      res.status(500).send("Failed to retrieve users");  
  });
});





// ROTTE PER DAO USER


app.get('/userFind/:email', async (req: any, res: any) => {
    //  "user1@genericmail.com"

    let email: string = req.params.email;
    userApp.retrieveByEmail(email)
    .then((userFind) => {
        res.send(userFind);
    })
    .catch((error) => {
        console.error('Error:', error);
        res.status(500).send("Failed to retrieve users");  
    });
});


// Rotta per creare un utente
app.post('/userNew', (req: any, res: any) => {
    let userData = req.body; // Assicurati che il body della richiesta contenga i dati dell'utente
    console.log({
        "username": req.body.username,
        "email": req.body.email ,
        "token": req.body.token ,
        "role": req.body.role
      })
    const newUser = new User({
      username: userData.username,
      email: userData.email,
      token: userData.token,
      role: userData.role,
    });
  
    userApp.create(newUser)
      .then(() => {
        res.status(201).send('User created successfully');
      })
      .catch((error) => {
        console.error('Error:', error);
        res.status(500).send('Failed to create user');
      });
  });
  


  */





/*

  USARE PARSEINT senno esce tutto sbagliato

*/




/*
// Rotta per aggiornare il token di un utente
app.put('/upToken', (req: any, res: any) => {
    let email = req.body.email;
    let token = req.body.token; // Assicurati di avere il token nella richiesta
    userApp.updateToken(email, token)
      .then(() => {
        res.status(200).send('Token updated successfully');
      })
      .catch((error) => {
        console.error('Error:', error);
        res.status(500).send('Failed to update user token');
      });
  });

// Rotta per decrementare il token di un utente
app.put('/dcrToken', (req: any, res: any) => {
    let email = req.body.email;
    userApp.decrementToken(email)
        .then(() => {
        res.status(200).send('Token decremented successfully');
        })
        .catch((error) => {
        console.error('Error:', error);
        res.status(500).send('Failed to decrement user token');
        });
});

// Rotta per eliminare un utente
app.delete('/delUser', (req: any, res: any) => {
    const email = req.body.email;
    userApp.delete(email)
        .then(() => {
        res.status(200).send('User deleted successfully');
        })
        .catch((error) => {
        console.error('Error:', error);
        res.status(500).send('Failed to delete user');
        });
});







//ROTTE DAO STORE


app.get('/store/retrieveAll', async (req: any, res: any) => {
  storeDAO.retrieveAll()
    .then((store) => {
      res.json(store);
    })
    .catch((error) => {
      console.error('Error:', error);
      res.status(500).send("Failed to retrieve store");
    });
});


app.get('/store/retrieveByName/:food', async (req: any, res: any) => {
  
  let food = req.params.food;
  storeDAO.retrieveByName(food)
    .then((store) => {
      res.send(store);
    })
    .catch((error) => {
      console.error('Error:', error);
      res.status(500).send("Elemento non trovato");
    });
});

app.put('/store/update', async (req: any, res: any) => {
  const { food, quantity } = req.body;

  storeDAO.update(food, quantity)
    .then(() => {
      res.send('Food modified');
    })
    .catch((error) => {
      console.error('Error:', error);
      res.status(500).send("Failed to modify food");
    });
});


// ROTTE DAO ORDER


app.get('/order/retrieveAll', async (req: any, res: any) => {
  orderDAO.retrieveAll()
    .then((orders) => {
      res.json(orders);
    })
    .catch((error) => {
      console.error('Error:', error);
      res.status(500).send("Failed to retrieve orders");
    });
});

app.get('/order/retrieveID/:uuid', async (req: any, res: any)=> {
  let uuid: string = req.params.uuid;
  console.log(uuid);
  orderDAO.retrieveById(uuid)
  .then((order)=>{
    res.json(order);
  })
  .catch((error=>{
    console.log('Error :', error);
    res.status(500).send('Failed to retrieve order number ');
  }))
} );

/*
app.post('/order/:uuid/load', async (req: any, res: any)=> {
  let storeData = req.body.loadOrder;
  let uuid = req.params.uuid;
  let flagSingleElement: boolean;
  const numberOfElements = Object.keys(storeData).length;
  if (numberOfElements == 1){
    flagSingleElement = true;
    let item = storeData[0];
    orderDAO.loadOrder(uuid, item, flagSingleElement)
    .then(() => {
      res.send('Loaded');
    })
    .catch((error) => {
      console.error('Error:', error);
      res.status(500).send("Failed to create order");
    });
  }
  else{
    flagSingleElement = false;
    orderDAO.loadOrder(uuid, storeData, flagSingleElement)
    .then(() => {
      res.send('Loaded');
    })
    .catch((error) => {
      console.error('Error:', error);
      res.status(500).send("Failed to create order");
    });
} 
});
app.get('/order/load/retrieve', async (req: any, res: any) => {
  orderDAO.retrieveLoadOrder()
  .then((loadOrder) => {
      res.json(loadOrder);
      console.log('Load order retrieveall');
  })
  .catch((error) => {
      console.error('Error:', error);
      res.status(500).send("Failed to retrieve order loaded");  
  });
})

*/



// Gestore di rotte catch-all per tutte le richieste
app.all("*", (req: any, res: any) => {
  res.status(StatusCodes.NOT_IMPLEMENTED).send({'err' : 'rotta non presente!!'});
});


// Constants
const PORT = process.env.PORT;
const HOST = process.env.HOST;


app.listen(PORT, HOST);
console.log(`App server running on http://${HOST}:${PORT}`);
//app.listen(8080, () => console.log(`App server listening on port 8080`));