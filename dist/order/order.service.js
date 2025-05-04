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
var OrderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./order.entity");
const service_service_1 = require("../service/service.service");
const order_status_enum_1 = require("./enums/order-status.enum");
const user_role_enum_1 = require("../user/enums/user-role.enum");
let OrderService = OrderService_1 = class OrderService {
    constructor(orderRepository, serviceService) {
        this.orderRepository = orderRepository;
        this.serviceService = serviceService;
        this.logger = new common_1.Logger(OrderService_1.name);
    }
    async create(createOrderDto, user) {
        const { serviceId, quantity, pickupDate, deliveryDate, notes } = createOrderDto;
        this.logger.log(`User ${user.id} (${user.email}) attempting to create order for service ${serviceId} with quantity ${quantity}`);
        let service;
        try {
            service = await this.serviceService.findOne(serviceId);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                this.logger.warn(`Order creation failed: Service with ID ${serviceId} not found.`);
                throw new common_1.NotFoundException(`Service with ID "${serviceId}" not found.`);
            }
            this.logger.error(`Error finding service ${serviceId} during order creation: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException("Could not verify service details.");
        }
        if (isNaN(quantity) || quantity <= 0) {
            throw new common_1.BadRequestException("Quantity must be a positive number.");
        }
        const totalPrice = service.price * quantity;
        const order = this.orderRepository.create({
            userId: user.id,
            serviceId,
            quantity,
            totalPrice,
            status: order_status_enum_1.OrderStatus.PENDING,
            notes,
            pickupDate: pickupDate ? new Date(pickupDate) : null,
            deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        });
        try {
            const savedOrder = await this.orderRepository.save(order);
            this.logger.log(`Order created successfully: ID ${savedOrder.id} by User ID ${user.id}`);
            return this.findOne(savedOrder.id, user);
        }
        catch (error) {
            this.logger.error(`Failed to save order for user ${user.id}: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException("Could not place the order.");
        }
    }
    async findAll(queryDto) {
        this.logger.log(`Fetching all orders (Admin request) with query: ${JSON.stringify(queryDto)}`);
        const { status, userId, serviceId, page = 1, limit = 10 } = queryDto;
        const skip = (page - 1) * limit;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (userId) {
            where.userId = userId;
        }
        if (serviceId) {
            where.serviceId = serviceId;
        }
        const queryOptions = {
            relations: ["user", "service", "payment"],
            where: where,
            order: { createdAt: "DESC" },
            skip: skip,
            take: limit,
        };
        try {
            const [data, total] = await this.orderRepository.findAndCount(queryOptions);
            data.forEach((o) => {
                if (o.user?.password)
                    delete o.user.password;
            });
            this.logger.log(`Found ${total} orders matching admin query.`);
            return { data, total };
        }
        catch (error) {
            this.logger.error(`Failed to fetch all orders: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException("Could not retrieve orders.");
        }
    }
    async findUserOrders(userId, queryDto) {
        this.logger.log(`Fetching orders for user ${userId} with query: ${JSON.stringify(queryDto)}`);
        const { userId: _, ...restQuery } = queryDto;
        return this.findAll({ ...restQuery, userId: userId });
    }
    async findOne(id, user) {
        this.logger.log(`User ${user.id} (${user.email}) attempting to fetch order ID: ${id}`);
        if (isNaN(id) || id <= 0) {
            throw new common_1.BadRequestException("Invalid Order ID format.");
        }
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ["user", "service", "payment"],
        });
        if (!order) {
            this.logger.warn(`Order not found: ${id}`);
            throw new common_1.NotFoundException(`Order with ID "${id}" not found`);
        }
        if (user.role !== user_role_enum_1.UserRole.ADMIN && order.userId !== user.id) {
            this.logger.warn(`Forbidden access attempt: User ${user.id} tried to access order ${id} owned by User ${order.userId}`);
            throw new common_1.ForbiddenException("You do not have permission to view this order.");
        }
        this.logger.log(`Order ${id} fetched successfully by user ${user.id}`);
        if (order.user?.password)
            delete order.user.password;
        return order;
    }
    async update(id, updateOrderDto, adminUser) {
        this.logger.log(`Admin ${adminUser.id} attempting to update order ID: ${id}`);
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order) {
            this.logger.warn(`Update failed: Order not found: ${id}`);
            throw new common_1.NotFoundException(`Order with ID "${id}" not found`);
        }
        let newTotalPrice = order.totalPrice;
        let newQuantity = order.quantity;
        if (updateOrderDto.quantity !== undefined &&
            updateOrderDto.quantity !== order.quantity) {
            newQuantity = updateOrderDto.quantity;
            if (order.serviceId) {
                try {
                    const service = await this.serviceService.findOne(order.serviceId);
                    newTotalPrice = service.price * newQuantity;
                    this.logger.log(`Recalculated total price for order ${id} based on new quantity ${newQuantity}: ${newTotalPrice}`);
                }
                catch (serviceError) {
                    this.logger.warn(`Could not recalculate price for order ${id}: Service ${order.serviceId} not found or error fetching. Price remains ${order.totalPrice}.`);
                    newTotalPrice = order.totalPrice;
                }
            }
            else {
                this.logger.warn(`Cannot recalculate price for order ${id}: Service ID is null. Price remains ${order.totalPrice}.`);
                newTotalPrice = order.totalPrice;
            }
        }
        if (updateOrderDto.totalPrice !== undefined) {
            newTotalPrice = updateOrderDto.totalPrice;
            this.logger.log(`Using explicit total price from DTO for order ${id}: ${newTotalPrice}`);
        }
        Object.assign(order, {
            status: updateOrderDto.status ?? order.status,
            quantity: newQuantity,
            totalPrice: newTotalPrice,
            pickupDate: updateOrderDto.pickupDate
                ? new Date(updateOrderDto.pickupDate)
                : order.pickupDate,
            deliveryDate: updateOrderDto.deliveryDate
                ? new Date(updateOrderDto.deliveryDate)
                : order.deliveryDate,
            notes: updateOrderDto.notes ?? order.notes,
        });
        try {
            const savedOrder = await this.orderRepository.save(order);
            this.logger.log(`Order ${id} updated successfully by admin ${adminUser.id}`);
            return this.findOne(savedOrder.id, adminUser);
        }
        catch (error) {
            this.logger.error(`Failed to update order ${id}: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException("Could not update order.");
        }
    }
    async cancelOrder(id, user) {
        this.logger.log(`User ${user.id} attempting to cancel order ID: ${id}`);
        const order = await this.findOne(id, user);
        if (order.status !== order_status_enum_1.OrderStatus.PENDING) {
            this.logger.warn(`Cancel failed: Order ${id} status is ${order.status}, not cancellable by user ${user.id}.`);
            throw new common_1.BadRequestException(`Order cannot be cancelled when status is "${order.status}".`);
        }
        order.status = order_status_enum_1.OrderStatus.CANCELLED;
        try {
            const savedOrder = await this.orderRepository.save(order);
            this.logger.log(`Order ${id} cancelled successfully by user ${user.id}`);
            return this.findOne(savedOrder.id, user);
        }
        catch (error) {
            this.logger.error(`Failed to cancel order ${id}: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException("Could not cancel order.");
        }
    }
    async remove(id, adminUser) {
        this.logger.log(`Admin ${adminUser.id} attempting to delete order ID: ${id}`);
        await this.findOne(id, adminUser);
        const result = await this.orderRepository.delete(id);
        if (result.affected === 0) {
            this.logger.warn(`Delete failed: Order ${id} not found after existence check.`);
            throw new common_1.NotFoundException(`Order with ID "${id}" could not be deleted.`);
        }
        this.logger.log(`Order ${id} deleted successfully by admin ${adminUser.id}`);
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = OrderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        service_service_1.ServiceService])
], OrderService);
//# sourceMappingURL=order.service.js.map