"use strict";

import { createModuleResolutionCache } from "typescript";
import {User, UserRole } from "./models/users.model";
import { UserDAO } from "dao/users.dao";


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

app.get('/test', (req: any, res:any) => {
    res.send({'rotta': 'test'});
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



app.listen(8080, () => console.log(`App server listening on port 8080`));