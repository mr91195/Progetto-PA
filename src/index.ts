"use strict";

import { createModuleResolutionCache } from "typescript";
import * as user from "./models/users.model";
const express = require("express");
const app = express();

app.get('/rotta', (req: any, res: any) => {
    res.send({'rotta' : '/rotta'});
})



app.get('/users-all', (req: any, res:any) => {
    new user.UserDAO().retrieveAll()
        .then((userDaoAll) => {
            console.log('------------------- usr ------------------------');
            console.log('usr_index.ts : ' + JSON.stringify(userDaoAll));
            console.log('------------------- usr ------------------------');
            res.send(userDaoAll);
        })
        .catch((error) => {
            console.error('Error:', error);
            res.status(500).send("Failed to retrieve users");
        });
});


app.get('/users/:email', async (req: any, res: any) => {
    //  "user1@genericmail.com"
    let email: string = req.params.email;
    let userDao = await new user.UserDAO().retrieveByEmail(email);

    console.log('------------------- usr ------------------------');
    console.log('usr_index.ts : ' + JSON.stringify(userDao));
    console.log('------------------- usr ------------------------');
    
    res.send(JSON.stringify(userDao));
})


app.listen(8080, () => console.log(`App server listening on port 8080`));