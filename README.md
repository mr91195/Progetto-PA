# Progetto del corso di Programmazione avanzata 2022/2023
## Sviluppo di un back end mediante l'utilizzo di nodeJs, typescript e docker.



[![N|Solid](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

[![N|Solid](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)


[![N|Solid](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)

[![N|Solid](https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)



## Obiettivo del progetto:


Si chiede di realizzare un back-end utilizzando i seguenti framework / librerie:

•	Node.JS

•	Express

•	Sequelize

•	RDBMS a scelta dello studente (es. Postgres, MySQL, sqlite,…)

Descrizione del progetto:

Realizzare un sistema che consenta di gestire un workflow relativo al processo di prelievo di alcuni alimenti. In particolare si vuole gestire un workflow secondo il quale l'operatore effettui delle operazioni nella giusta sequenza caricando le quantità desiderate di alcuni alimenti. 
Il sistema deve prevedere:
* Creazione, modifica e aggiornamento di un alimento con relativa quantità disponibile.
* Creare un ordine di prelievo, fornendo gli alimenti, la quantità e far si che venga rispettata la sequenza dell'ordine. In caso contrario l'ordine fallisce.
* Un ordine puo avere diversi stati: CREATO, FALLITO, IN ESECUZIONE, COMPLETATO

- Implementare delle rotte specifiche per la gestione delle sequenti operazioni:
  'Preso in carico ordine x'
  'Caricato x kg di alimento y' con relativo timestamp e aggiornare le quantità disponibili.

* Creare una rotta per ottenere lo stato di un ordine mettendo in evidenza le operazioni di carico che sono state effettuate;


* Creare una rotta per ottenere lo stato di tutti gli ordini dando la possibilità di filtrare per data (da un periodo ad un altro periodo


Il servizio deve annullare l'ordine se:
- Non è stata rispettata la sequenza di carico
- Se le quantità caricate deviano rispetto al valore richiesto di un valore % pari a N specificato in un file .env
- L’ordine è COMPLETATO se e solo se sono state caricate tutti gli alimenti nel giusto ordine

Se l’ordine è completato:

- fornire per ogni alimento lo scostamento tra il caricato e quanto doveva essere caricato; 
-	fornire anche il tempo richiesto per effettuare le operazioni di carico complessive



## Dettagli delle richieste
La seguente tabella mostra le richieste possibili:


|    TIPO        | ROTTA                         | TOKEN JWT |
| --------------- | ------------------------------ | --------- |
| POST            | /store/create                  | SI        |
| POST            | /order/create                  | SI        |
| PUT             | /order/start/:uuid             | SI        |
| POST            | /order/:uuid/load              | SI        |
| GET             | /order/status/:uuid            | SI        |
| POST            | /order/search/range            | NO        |
| PUT             | /tokenUpdate                   | SI        |


Tabella di implementazioni di rotte non richieste, comode per la generazione del token jwt e il relativo test del token:

|    TIPO        | ROTTA                         | TOKEN JWT |
| --------------- | ------------------------------ | --------- |
| GET             | /login/:user                   | NO        |
| GET             | /test                          | SI        |

### Creare ed inserire un nuovo alimento nello store
Tramite questa richiesta è possibile inserire un nuovo alimento nel magazino, se l'alimento è gia presente viene incrementato il quantitativo.
~~~
http://localhost:8080/store/create
~~~
Esempio del body, da effettura tramite JWT:
~~~

{
    "food" : "pomodori",
    "quantity" : 12
}
~~~

### Creare un nuovo ordine
Tramite questa richiesta è possibile creare un nuovo ordine con relativa sequenza di alimenti e quantità.
~~~
http://localhost:8080/order/create
~~~
Esempio del body, da effettuare tramite JWT:
~~~

{
  "requestOrder": [
    { 
        "food": "pomodori", 
        "quantity": 2 },
    { 
        "food": "cipolle", 
        "quantity": 5 
        }
  ]
}


~~~

### Processare un ordine
Tramite questa richiesta è possibile 'prendere in carico' l'ordine, nello specifico lo stato dell'ordine passa da CREATO a IN ESECUZIONE

Questa rotta non richiede nessun body, va passato tramite Query params l'id dell'ordine
Esempio della rotta, da effettuare tramite JWT:
~~~
http://localhost:8080/order/start/f739d800-bc7e-473f-87bc-f89d33d47712
~~~


### Caricare gli alimenti per il relativo ordine
Tramite questa richiesta è possibile inserire gli alimenti nell'ordine, questo è possibile se gli alimenti sono presenti, se hanno la quantità richiesta a disposizione e se la sequenza di carico è consona. In tal caso lo stato dell'ordine diventa COMPLETATO, altrimenti passa a FALLITO

~~~
http://localhost:8080/order/f739d800-bc7e-473f-87bc-f89d33d47712/load
~~~
Esempio del body, da effettuare tramite JWT
~~~
{
    "loadOrder" : [{
        "food": "pomodori", 
        "quantity": 2 }
    ,{ 
        "food" : "cipolle",
        "quantity" : 5
        }
    ]
    
}
~~~

### Mostrare stato dell'ordine
Questa richiesta consente di visualizzare lo stato completo dell'ordine. Se lo stato dell'ordine è COMPLETATO viene restituita anche la sequenza di carico, il relativo scostamento tra quanto richiesto e quanto caricato e il tempo impiegato tra la creazione dell'ordine e il completamento.

Da effettuare tramite JWT.
~~~
http://localhost:8080/order/status/f739d800-bc7e-473f-87bc-f89d33d47712
~~~

### Ricerca tramite range temporale
Questa richiesta consente di visualizzare gli ordini presenti nel range temporale.

Esempio di body, non è richiesto il JWT.
~~~
{
  "start": "2023-09-01",
  "end": "2023-09-15"
}
~~~

### Incremento dei token utente
Questa rotta permette di aumentare il numero di token dell'utente, che consentono di effettuare le varie richieste, questo è possibile farlo solo tramite JWT e ruolo utente 'admin'.

Esempio di body:
~~~
{
    "user" : "op2@mailnator.com",
    "token" : 5
}
~~~

## ROTTE DEV TEST
Nella cartella di collection_postman sono presenti due sotto cartelle:
* Collection_dev, è una collection di rotte usate come test di sviluppo, hanno accesso diretto alle CRUD di tutti i modelli presenti. Nel file index.ts queste rotte sono commentate.
* Progetto_PA, è una collection di rotte esplicitamente richieste per il progetto.

## PROGETTAZIONE - UML

## Casi d'uso 
    Le funzionalità implementate si dividono in 3 Gruppi
    • Funzioni utente
        • Inserisci alimento nello store.
        • Crea e inserisci nuovo ordine.
        • Avviare l'ordine, modificando lo stato in 'esecuzione'.
        • Caricare gli alimenti per l'ordine specifico.
        • Visualizzare lo stato di un ordine.
    • Funzioni admin
        • Ricaricare i token dell'utente 
    • Funzioni senza JWT
        • Ricerca ordini in un range temporale
       
<img src = "/Images/UseCase.png">


### Sequence Diagram
* **Chiamata POST /store/create**
<img src = "/Images/diagram_store_create.png">

* **Chiamata POST /order/create**
<img src = "/Images/diagram_order_create.png">


* **Chiamata PUT /order/start/:uuid**
<img src = "/Images/diagram_order_start.png">


* **Chiamata POST /order/:uuid/load**
<img src = "/Images/diagram_order_ uuid_load.png">


* **Chiamata GET /order/status/:uuid**
<img src = "/Images/diagram_order_status_uuid.png">


* **Chiamata POST /order/search/range**
<img src = "/Images/diagram_order_search_range.png">



## RDBMS
Per quanto riguarda la classe che realizza la connessione con la base dati dove sono memorizzati gli utenti,
essa è stata realizzata utilizzando il pattern singleton.
In questo modo l'oggetto connessione è unico per tutta la sessione, evitando cosi potenziali conflitti.



## DOCKER
    • Creare file .env creando le variabili:
    
    PGUSER=postgres
    PGDATABASE=prga
    PGHOST=dbpg
    PGPASSWORD=postgres
    PGPORT=5432
    JWT_KEY=superSecretKeyJwt
    PORT=8080
    HOST = 0.0.0.0
    PERCENTAGE=10
    
    • Posizionarsi nella cartella contenente il dockerfile e utilizzare il comando docker-compose up
    • Il database sarà inizializzato con 3 utenti livello 0 (User) e uno di livello 1 (Admin)
        • op1@mailnator.com (con 15 token) (ruolo: user)
        • op2@mailnator.com (con 5 token) (ruolo: user)
        • admin@genericmail.com (con 0 token) (ruolo: admin)

## Design Patterns Utilizzati
Nel progetto sono stati implementati diversi design pattern per garantire una struttura chiara e modulare del codice. Di seguito sono elencati alcuni dei principali design pattern utilizzati:

# Singleton
Il Singleton è stato utilizzato per garantire che una sola istanza di una classe venga creata e fornita all'applicazione. In particolare, è stato utilizzato per la gestione della connessione al database, garantendo che vi sia una sola connessione attiva in tutto il ciclo di vita dell'applicazione.

# Chain of Responsibility
Il Chain of Responsibility è stato utilizzato per creare una catena di gestori delle richieste, ognuno dei quali può decidere se gestire la richiesta o passarla al successivo nella catena. Questo design pattern è stato utilizzato per gestire le richieste HTTP in arrivo e applicare diversi middleware in base alle esigenze, come l'autenticazione JWT, la validazione dei dati in ingresso e altri controlli.

# Data Access Object (DAO)
Il Data Access Object (DAO) è stato utilizzato per separare la logica di accesso ai dati dal resto dell'applicazione. Sono stati creati DAO per le entità del database, consentendo così un'astrazione completa dell'accesso ai dati. Questo design pattern facilita la manutenzione e la gestione del codice relativo al database.




