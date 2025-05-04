import { OrderStatus } from "../enums/order-status.enum";
export declare class UpdateOrderDto {
    status?: OrderStatus;
    totalPrice?: number;
    quantity?: number;
    pickupDate?: string;
    deliveryDate?: string;
    notes?: string;
}
