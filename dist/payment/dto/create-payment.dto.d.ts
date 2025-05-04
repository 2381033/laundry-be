import { PaymentStatus } from "../enums/payment-status.enum";
export declare class CreatePaymentDto {
    orderId: number;
    amount: number;
    paymentMethod: string;
    paymentStatus?: PaymentStatus;
    transactionId?: string;
}
