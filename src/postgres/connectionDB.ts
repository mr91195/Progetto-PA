require('dotenv').config
import { Sequelize } from 'sequelize-typescript';

/**
 * Classe per la gestione della connessione al database mediante SINGLETON.
 */
export class ConnectionDB {

    private static instance: ConnectionDB;
    private connection: Sequelize;

    /**
     * Costruttore privato per la classe ConnectionDB.
     * Inizializza la connessione al database utilizzando le variabili d'ambiente.
     */
    private constructor() {
        
        // Estrai le variabili d'ambiente per la configurazione del database.
        const database: string = process.env.PGDATABASE as string;
        const username: string = process.env.PGUSER as string;
        const password: string = process.env.PGPASSWORD as string;
        const host: string = process.env.PGHOST as string;
        const port: number = Number(process.env.PGPORT);
        
        // Inizializza la connessione Sequelize al database.
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
            logging: false
        });

        // Testa la connessione al database.
        this.testConnection();
    }

    /**
     * Ottieni un'istanza di ConnectionDB (implementazione del pattern Singleton).
     * @returns Un'istanza di ConnectionDB.
     */
    public static getDB() {
        if (!ConnectionDB.instance) {
            this.instance = new ConnectionDB();
        }

        return ConnectionDB.instance;
    }

    /**
     * Ottieni la connessione al database.
     * @returns L'oggetto Sequelize rappresentante la connessione al database.
     */
    public getConnection() {
        return this.connection;
    }

    /**
     * Verifica la connessione al database.
     * Effettua un test di autenticazione con il database e gestisce eventuali errori.
     */
    public async testConnection() {
        try {
            // Testa la connessione al database.
            await this.connection.authenticate();
            console.log("Connection has been established successfully.");
        } catch (err) {
            console.error("Unable to connect to the Database:", err);
        }
    }
}
