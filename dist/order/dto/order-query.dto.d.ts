import { OrderStatus } from "../enums/order-status.enum";
export declare class OrderQueryDto {
    status?: OrderStatus;
    userId?: number;
    serviceId?: number;
    page?: number;
    limit?: number;
}
