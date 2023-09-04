require('dotenv').config
import { Sequelize } from 'sequelize-typescript';


 export class SingConnectionDB{
    private static instance: SingConnectionDB;
    private connection: Sequelize;
//COME FAR PARTIRE PG?!
    private constructor(){
        /*  PGUSER=postgres
            PGDATABASE=prga
            PGHOST=dbpg
            PGPASSWORD=postgres
            PGPORT=5432
            SECRET_KEY=secret
        */
        /*
        const database: string =   process.env.PGDATABASE as string;
        const username: string = process.env.PGUSER as string;
        const password: string = process.env.PGPASSWORD as string;
        const host: string = process.env.PGHOST as string;
        const port: number = Number(process.env.PGPORT);
        */
        const database: string = 'prga';
        const username: string = 'postgres';
        const password: string = 'postgres'
        const host: string = 'dbpg';
        const port: number = 5432;
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
            logging:false});
        //this.connection.addModels([User])
    }

    public static getDB(){
        if(!SingConnectionDB.instance){
            this.instance = new SingConnectionDB();
        }
        return SingConnectionDB.instance;
    }

    public getConnection(){
        return this.connection;
    }
 }
//sudo docker run --rm --name prga -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres
//sudo docker exec -it progx_dbpg_1 psql -U postgres prga

/*const sequelize = new Sequelize({

    PGUSER=postgres
PGDATABASE=prga
PGHOST=dbpg
PGPASSWORD=postgres
PGPORT=5432
SECRET_KEY=secret
    database: 'some_db',
    dialect: 'sqlite',
    username: 'root',
    password: '',
    storage: ':memory:',
    models: [__dirname + '/models'], // or [Player, Team],
  });*/