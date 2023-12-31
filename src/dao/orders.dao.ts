import { StatusOrder, Order, loadOrder, JsonRequest} from "models/orders.model";
const { Op } = require('sequelize');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

// Interfaccia per le operazioni CRUD su Order
interface IOrderDAO {
  create(orders: any, user: string, singleElement: boolean): Promise<void>; // Crea un nuovo ordine
  retrieveAll(): Promise<Order[]>; // Recupera tutti gli ordini
  retrieveById(id: string): Promise<Order>; // Recupera un ordine per ID
  retrieveByRange(startDate: string, endDate: string): Promise<Order[]>; // Recupera gli ordini in un determinato intervallo di date
  loadOrder(uuid: string, timestamp: string, food: string, quantity: number, deviation: number): Promise<void>; // Carica un ordine
  retrieveLoadOrder(): Promise<loadOrder[]>; // Recupera tutti gli ordini caricati
  retrieveLoadOrderByUuid(uuid: string): Promise<loadOrder[]>; // Recupera gli ordini caricati per UUID
  changeStatus(status: StatusOrder, uuid: string): Promise<void>; // Cambia lo stato di un ordine
  isExists(uuid: string): Promise<boolean>; // Verifica se esiste un ordine per UUID
}
  
// Classe DAO per gestire le operazioni su User
export class OrderDAO implements IOrderDAO {

  async retrieveLoadOrderByUuid(uuid: string): Promise<loadOrder[]> {
    return loadOrder.findAll({
      where: { uuid: uuid }
    })
        .then((orders) => {
            return orders;
        })
        .catch((error) => {
            console.error('Error:', error);
            throw new Error("Failed to retrieve orders");
        });
  }

  async retrieveByRange(startDate: string, endDate: string): Promise<Order[]> {
    let start = moment(startDate).toDate();
    // Data di fine dell'intervallo
    let end = moment(endDate).toDate();
    return Order.findAll({
      where: { created_at: {
        [Op.between]: [start, end],
      } }
    })
        .then((orders) => {
            return orders;
        })
        .catch((error) => {
            console.error('Error:', error);
            throw new Error("Failed to retrieve orders");
        });
  }
  
  async isExists(uuid: string): Promise<boolean> {
    let order = await this.retrieveById(uuid);
    if (!order){
      return false;
    }
    else{
    
    return true;
  }
  }
  
  async changeStatus(status: StatusOrder, uuid: string): Promise<void> {
    let order = await this.retrieveById(uuid);
    console.log('----------------------------------------order--------------------------------------')
    if (order){
      console.log(status);
      order.status = status;
      await order.save();
    }
    else{
      //console.error('Error:', error);
      throw new Error("Failed to retrieve order");
    }
    console.log(order.status);
  }

  async create(order: any, user: string, singleElement: boolean): Promise<void> {

    const uuid = uuidv4();
    let index = 0 ;

    const jsonArray: JsonRequest[] = [];


    if(singleElement){
      const jsonObject: JsonRequest = {
        foodIndex: index,
        food: order.food,
        quantity: order.quantity,
      };

      jsonArray.push(jsonObject);

    }
    else{
      order.map((item: any) => {
        const jsonObject: JsonRequest = {
          foodIndex: index,
          food: item.food,
          quantity: item.quantity,
        };
  
        jsonArray.push(jsonObject);
        index += 1;
      });
    }
    

    
    let newOrder = new Order({
      uuid: uuid,
      request_order: jsonArray,
      created_at: Date.now(),
      created_by: user,
      status: StatusOrder.Creato
    });

    return newOrder.save()
      .then(() => {
        console.log('Order created');
      })
      .catch((error) => {
        console.error('Error:', error);
        throw new Error("Failed to creat order.");
      });
  }

  async retrieveAll(): Promise<Order[]> {
    return Order.findAll()
        .then((orders) => {
            return orders;
        })
        .catch((error) => {
            console.error('Error:', error);
            throw new Error("Failed to retrieve orders");
        });
  }

  async retrieveById(id: string): Promise<Order> {
    return Order.findOne({
      //attributes: ['uuid'],
      where: { uuid: id },
    })
        .then((order) => {
            if (!order) {
                throw new Error(`Order ${id} not found`);
            }
            return order;
        })
        .catch((error) => {
            console.error('Error:', error);
            throw new Error("Failed to retrieve order");
        });
    
  }

  async loadOrder(uuid: string, timestamp: string, food: string, 
                  quantity: number, deviation: number)
                  : Promise<void> {        

        //let reqQnt = order;
          //reqQnt = reqQnt.quantity;
          let item: loadOrder = new loadOrder({
            uuid: uuid,
            food: food,
            quantity: quantity,
            timestamp: timestamp,
            deviation: deviation,
          });

          console.log('jsonArrey : ' + JSON.stringify(item));
          item.save();

  }
    
  async retrieveLoadOrder(): Promise<loadOrder[]> {
    return loadOrder.findAll()
        .then((orders) => {
            return orders;
        })
        .catch((error) => {
            console.error('Error:', error);
            throw new Error("Failed to retrieve orders");
        });
  }
}
