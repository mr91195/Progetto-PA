import { StatusOrder, Order, loadOrder, JsonRequest} from "models/orders.model";
import { Json } from "sequelize/types/utils";
const { v4: uuidv4 } = require('uuid');


// Interfaccia per le operazioni CRUD su User
interface IOrderDAO {
    create(orders: any, user: string, singleElement: boolean): Promise<void>;
    retrieveAll(): Promise<Order[]>;
    retrieveById(id: string): Promise<Order>;
    loadOrder(id: string, loadOrder: any, singleElement: boolean): Promise<void>;
    retrieveLoadOrder(): Promise<loadOrder[]>;
  }
  
// Classe DAO per gestire le operazioni su User
export class OrderDAO implements IOrderDAO {

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

      console.log('jsonArrey : ' + JSON.stringify(jsonArray))
      console.log('jsonOBj : ' + JSON.stringify(jsonObject))
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

  async loadOrder(id: string, load: any, singleElement: boolean): Promise<void> {
    return this.retrieveById(id)
      .then((order) => {
        if(!order){
          throw new Error('Order not found');
        }
        

        if(singleElement){
          
          let item: loadOrder = new loadOrder({
            uuid: order.uuid,
            food: load.food,
            quantity: load.quantity,
            timestamp: Date.now()
          });

          console.log('jsonArrey : ' + JSON.stringify(item));
          item.save();
        }

        else{
          load.map((items: any) => {
            let item: loadOrder = new loadOrder({
              uuid: order.uuid, 
              food: items.food,
              quantity: items.quantity,
              timestamp: Date.now(),
            });
      
            console.log('jsonArrey : ' + JSON.stringify(item));
            item.save();
          });
        }

      })
      .then(() => {
        console.log('Loaded');
      })
      .catch((error) => {
        console.error('Error:', error);
        throw new Error("Failed to add a load order.");
      });

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
