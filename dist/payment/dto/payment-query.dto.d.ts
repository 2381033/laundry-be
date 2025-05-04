import { PaymentStatus } from "../enums/payment-status.enum";
export declare class PaymentQueryDto {
    paymentStatus?: PaymentStatus;
    userId?: number;
    orderId?: number;
    page?: number;
    limit?: number;
}
