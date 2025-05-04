import { PaymentService } from "./payment.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { PaymentQueryDto } from "./dto/payment-query.dto";
import { User } from "../user/user.entity";
import { Payment } from "./payment.entity";
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    create(createPaymentDto: CreatePaymentDto, adminUser: User): Promise<Payment>;
    findMyPayments(user: User, queryDto: PaymentQueryDto): Promise<{
        data: Payment[];
        total: number;
    }>;
    findAll(queryDto: PaymentQueryDto): Promise<{
        data: Payment[];
        total: number;
    }>;
    findOne(id: number, user: User): Promise<Payment>;
    update(id: number, updatePaymentDto: UpdatePaymentDto, adminUser: User): Promise<Payment>;
    remove(id: number, adminUser: User): Promise<void>;
}
