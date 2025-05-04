import { Order } from "../order/order.entity";
import { Payment } from "../payment/payment.entity";
import { UserRole } from "./enums/user-role.enum";
export declare class User {
    id: number;
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    address: string;
    phoneNumber: string;
    createdAt: Date;
    updatedAt: Date;
    orders: Order[];
    payments: Payment[];
}
