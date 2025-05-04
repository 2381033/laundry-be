import { User } from "../user/user.entity";
import { Service } from "../service/service.entity";
import { Payment } from "../payment/payment.entity";
import { OrderStatus } from "./enums/order-status.enum";
export declare class Order {
    id: number;
    userId: number;
    serviceId: number | null;
    quantity: number;
    orderDate: Date;
    pickupDate: Date;
    deliveryDate: Date;
    status: OrderStatus;
    totalPrice: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    service: Service | null;
    payment: Payment;
}
