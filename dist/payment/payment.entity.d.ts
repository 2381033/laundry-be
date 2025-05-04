import { Order } from "../order/order.entity";
import { User } from "../user/user.entity";
import { PaymentStatus } from "./enums/payment-status.enum";
export declare class Payment {
    id: number;
    orderId: number;
    userId: number;
    amount: number;
    paymentMethod: string;
    paymentStatus: PaymentStatus;
    paymentDate: Date;
    transactionId: string;
    createdAt: Date;
    updatedAt: Date;
    order: Order;
    user: User;
}
