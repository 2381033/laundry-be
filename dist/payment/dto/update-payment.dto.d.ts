import { PaymentStatus } from '../enums/payment-status.enum';
export declare class UpdatePaymentDto {
    paymentStatus?: PaymentStatus;
    transactionId?: string;
    paymentMethod?: string;
}
