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


const express = require("express");
const app = express();
const userApp = new UserDAO();

app.use(express.json());



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

app.get('/test', jwtAuth,(req: any, res:any) => {

  res.send({"ROTTA": "Autenticazione effettuata correttamente","user" : req.user});
}); 



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
  

/*

  USARE PARSEINT senno esce tutto sbagliato

*/
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







//TESTING ROTTE DAO STORE E ORDERS
import { OrderDAO } from "dao/orders.dao";
import { StoreDAO} from "dao/store.dao";
import { Order } from "models/orders.model";
import { Store } from "models/store.model";
import { stringify } from "querystring";
import { request } from "express";

const orderDAO = new OrderDAO();
const storeDAO = new StoreDAO();

app.post('/store/create', async (req: any, res: any) => {
  let storeData = req.body; // Assicurati che il body della richiesta contenga i dati dell'utente
  //let obj = JSON.parse(req.body);
  
  const newStore = new Store({
    food: storeData.food,
    quantity: storeData.quantity
  });


  storeDAO.create(newStore)
  .then(() => {
      res.send('Added in store');
  })
  .catch((error) => {
      console.error('Error:', error);
      res.status(500).send("Failed to add in store");  
  });
});

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
      res.status(500).send("Failed to retrieve food");
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

app.post('/order/create', async (req: any, res: any) => {
  
  let storeData = req.body;
  let itemData = storeData.requestOrder;
  let user = storeData.byUser;


  let flagSingleElement: boolean;
  const numberOfElements = Object.keys(itemData).length;
  if (numberOfElements == 1){
    flagSingleElement = true;
    let item = req.body.requestOrder;
    item = item[0];
    orderDAO.create(item, user, flagSingleElement)
    .then(() => {
      res.send('Order created');
    })
    .catch((error) => {
      console.error('Error:', error);
      res.status(500).send("Failed to create order");
    });
  }
  else{
    flagSingleElement = false;
    orderDAO.create(itemData, user, flagSingleElement)
    .then(() => {
      res.send('Order created');
    })
    .catch((error) => {
      console.error('Error:', error);
      res.status(500).send("Failed to create order");
    });
  }
  
  
  
});



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






















app.listen(8080, () => console.log(`App server listening on port 8080`));