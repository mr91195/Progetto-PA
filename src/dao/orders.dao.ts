import { Order, FoodItemLoad } from "models/orders.model";


// Interfaccia per le operazioni CRUD su User
interface IOrderDAO {
    create(store: Order): Promise<void>;
    retrieveAll(): Promise<Order[]>;
    retrieveById(id: number): Promise<Order>;
    loadOrder(id:number, loadOrder: FoodItemLoad): Promise<void>;
  }
  
// Classe DAO per gestire le operazioni su User
export class OrderDAO implements IOrderDAO {

  async create(order: Order): Promise<void> {
    return order.save()
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

  async retrieveById(id: number): Promise<Order> {
    return Order.findOne({
      attributes: ['id'],
      where: { orderId: id },
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

  async loadOrder(id:number, load: FoodItemLoad): Promise<void> {
    return this.retrieveById(id)
      .then((order) => {
        if(!order){
          throw new Error('Order not found');
        }
        if (!order.load) {
          order.load = [];
        }
        order.load.push(load);
        return order.save();
      })
      .then(() => {
        console.log('Order modified');
      })
      .catch((error) => {
        console.error('Error:', error);
        throw new Error("Failed to add a load order.");
      });

  }
    
}
