import { Repository } from "typeorm";
import { Payment } from "./payment.entity";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { User } from "../user/user.entity";
import { OrderService } from "../order/order.service";
import { PaymentQueryDto } from "./dto/payment-query.dto";
export declare class PaymentService {
    private paymentRepository;
    private orderService;
    private readonly logger;
    constructor(paymentRepository: Repository<Payment>, orderService: OrderService);
    create(createPaymentDto: CreatePaymentDto, creator: User): Promise<Payment>;
    findAll(queryDto: PaymentQueryDto): Promise<{
        data: Payment[];
        total: number;
    }>;
    findUserPayments(userId: number, queryDto: PaymentQueryDto): Promise<{
        data: Payment[];
        total: number;
    }>;
    findOne(id: number, user: User): Promise<Payment>;
    update(id: number, updatePaymentDto: UpdatePaymentDto, adminUser: User): Promise<Payment>;
    remove(id: number, adminUser: User): Promise<void>;
}
