"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("./payment.entity");
const order_service_1 = require("../order/order.service");
const user_role_enum_1 = require("../user/enums/user-role.enum");
const payment_status_enum_1 = require("./enums/payment-status.enum");
let PaymentService = PaymentService_1 = class PaymentService {
    constructor(paymentRepository, orderService) {
        this.paymentRepository = paymentRepository;
        this.orderService = orderService;
        this.logger = new common_1.Logger(PaymentService_1.name);
    }
    async create(createPaymentDto, creator) {
        const { orderId, amount, paymentMethod, paymentStatus, transactionId } = createPaymentDto;
        this.logger.log(`Admin ${creator.id} attempting to create payment for order ${orderId}`);
        let order;
        try {
            order = await this.orderService.findOne(orderId, creator);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                this.logger.warn(`Payment creation failed: Order ${orderId} not found.`);
                throw new common_1.NotFoundException(`Order with ID "${orderId}" not found.`);
            }
            this.logger.error(`Error fetching order ${orderId} during payment creation: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException("Could not retrieve order details.");
        }
        if (Number(amount) !== Number(order.totalPrice)) {
            this.logger.warn(`Payment amount (${amount}) mismatch for order ${orderId} (total: ${order.totalPrice}). Proceeding anyway.`);
        }
        const existingPayment = await this.paymentRepository.findOne({
            where: { orderId },
        });
        if (existingPayment) {
            this.logger.warn(`Payment creation failed: Payment already exists for order ${orderId} (Payment ID: ${existingPayment.id})`);
            throw new common_1.ConflictException(`Payment already exists for order ID "${orderId}".`);
        }
        const payment = this.paymentRepository.create({
            orderId,
            userId: order.userId,
            amount,
            paymentMethod,
            paymentStatus: paymentStatus || payment_status_enum_1.PaymentStatus.PENDING,
            transactionId,
            paymentDate: paymentStatus === payment_status_enum_1.PaymentStatus.COMPLETED ? new Date() : undefined,
        });
        try {
            const savedPayment = await this.paymentRepository.save(payment);
            this.logger.log(`Payment ${savedPayment.id} created successfully for order ${orderId}`);
            return this.paymentRepository.findOneOrFail({
                where: { id: savedPayment.id },
                relations: ["order", "user"],
            });
        }
        catch (error) {
            this.logger.error(`Failed to create payment for order ${orderId}: ${error.message}`, error.stack);
            if (error.code === "23505") {
                if (error.detail?.includes("(orderId)")) {
                    throw new common_1.ConflictException(`Payment already exists for order ID "${orderId}".`);
                }
                if (error.detail?.includes("(transactionId)")) {
                    throw new common_1.ConflictException(`Transaction ID "${transactionId}" already exists.`);
                }
            }
            throw new common_1.InternalServerErrorException("Could not create payment record.");
        }
    }
    async findAll(queryDto) {
        this.logger.log(`Fetching all payments with query: ${JSON.stringify(queryDto)}`);
        const { paymentStatus, userId, orderId, page = 1, limit = 10 } = queryDto;
        const skip = (page - 1) * limit;
        const where = {};
        if (paymentStatus) {
            where.paymentStatus = paymentStatus;
        }
        if (userId) {
            where.userId = userId;
        }
        if (orderId) {
            where.orderId = orderId;
        }
        const queryOptions = {
            relations: ["user", "order", "order.service"],
            where: where,
            order: { createdAt: "DESC" },
            skip: skip,
            take: limit,
        };
        try {
            const [data, total] = await this.paymentRepository.findAndCount(queryOptions);
            data.forEach((p) => {
                if (p.user?.password)
                    delete p.user.password;
            });
            this.logger.log(`Found ${total} payments matching query.`);
            return { data, total };
        }
        catch (error) {
            this.logger.error(`Failed to fetch payments: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException("Could not retrieve payments.");
        }
    }
    async findUserPayments(userId, queryDto) {
        this.logger.log(`Fetching payments for user ${userId} with query: ${JSON.stringify(queryDto)}`);
        return this.findAll({ ...queryDto, userId: userId });
    }
    async findOne(id, user) {
        this.logger.log(`User ${user.id} attempting to fetch payment ${id}`);
        if (isNaN(id) || id <= 0) {
            throw new common_1.BadRequestException("Invalid Payment ID format.");
        }
        const payment = await this.paymentRepository.findOne({
            where: { id },
            relations: ["user", "order", "order.service"],
        });
        if (!payment) {
            this.logger.warn(`Payment not found: ${id}`);
            throw new common_1.NotFoundException(`Payment with ID "${id}" not found`);
        }
        if (user.role !== user_role_enum_1.UserRole.ADMIN && payment.userId !== user.id) {
            this.logger.warn(`Forbidden access attempt: User ${user.id} tried to access payment ${id} owned by ${payment.userId}`);
            throw new common_1.ForbiddenException("You do not have permission to view this payment.");
        }
        this.logger.log(`Payment ${id} fetched successfully by user ${user.id}`);
        if (payment.user?.password)
            delete payment.user.password;
        return payment;
    }
    async update(id, updatePaymentDto, adminUser) {
        this.logger.log(`Admin ${adminUser.id} attempting to update payment ${id}`);
        const payment = await this.findOne(id, adminUser);
        const originalStatus = payment.paymentStatus;
        Object.assign(payment, updatePaymentDto);
        if (payment.paymentStatus === payment_status_enum_1.PaymentStatus.COMPLETED &&
            originalStatus !== payment_status_enum_1.PaymentStatus.COMPLETED) {
            payment.paymentDate = new Date();
            this.logger.log(`Setting paymentDate for payment ${id} as status changed to COMPLETED.`);
        }
        try {
            const savedPayment = await this.paymentRepository.save(payment);
            this.logger.log(`Payment ${id} updated successfully by admin ${adminUser.id}`);
            return this.findOne(savedPayment.id, adminUser);
        }
        catch (error) {
            this.logger.error(`Failed to update payment ${id}: ${error.message}`, error.stack);
            if (error.code === "23505" && error.detail?.includes("(transactionId)")) {
                throw new common_1.ConflictException(`Transaction ID "${updatePaymentDto.transactionId}" already exists.`);
            }
            throw new common_1.InternalServerErrorException("Could not update payment.");
        }
    }
    async remove(id, adminUser) {
        this.logger.log(`Admin ${adminUser.id} attempting to delete payment ${id}`);
        await this.findOne(id, adminUser);
        const result = await this.paymentRepository.delete(id);
        if (result.affected === 0) {
            this.logger.warn(`Delete failed: Payment not found (should have been caught by findOne): ${id}`);
            throw new common_1.NotFoundException(`Payment with ID "${id}" not found`);
        }
        this.logger.log(`Payment ${id} deleted successfully by admin ${adminUser.id}`);
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        order_service_1.OrderService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map