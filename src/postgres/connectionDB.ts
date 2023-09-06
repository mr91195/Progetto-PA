require('dotenv').config
import { Sequelize } from 'sequelize-typescript';


export class ConnectionDB{

    private static instance: ConnectionDB;
    private connection: Sequelize;

    private constructor(){
        
        const database: string =   process.env.PGDATABASE as string;
        const username: string = process.env.PGUSER as string;
        const password: string = process.env.PGPASSWORD as string;
        const host: string = process.env.PGHOST as string;
        const port: number = Number(process.env.PGPORT);
        
        this.connection = new Sequelize(database, username, password, {
        host: host,
        port: port,
        dialect: 'postgres',
        define: {
            timestamps: false, 
            freezeTableName: true
        },
        dialectOptions: {

        },
        //models: [Food], 
        logging:false});
        this.testConnection();
    }


    public static getDB(){
        if(!ConnectionDB.instance){
            this.instance = new ConnectionDB();
        }

        return ConnectionDB.instance;
    }

    public getConnection(){
        return this.connection;
    }

    public async testConnection(){
        //testo la connession
        await this.connection
        .authenticate()
        .then(() => {
        console.log("Connection has been established successfully.");
        })
        .catch((err) => {
        console.error("Unable to connect to the Database:", err);
        });
    }
}



