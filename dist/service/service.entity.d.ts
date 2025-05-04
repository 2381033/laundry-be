import { Order } from "../order/order.entity";
export declare class Service {
    id: number;
    name: string;
    description: string;
    price: number;
    estimatedDuration: string;
    createdAt: Date;
    updatedAt: Date;
    orders: Order[];
}
