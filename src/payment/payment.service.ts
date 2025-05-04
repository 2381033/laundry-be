// src/payment/payment.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
  ConflictException,
  Logger,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindManyOptions, FindOptionsWhere } from "typeorm"; // Import FindOptionsWhere
import { Payment } from "./payment.entity";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { User } from "../user/user.entity";
import { OrderService } from "../order/order.service";
import { PaymentQueryDto } from "./dto/payment-query.dto";
import { UserRole } from "../user/enums/user-role.enum";
import { PaymentStatus } from "./enums/payment-status.enum";
import { Order } from "../order/order.entity";

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    // Inject OrderService untuk mengambil data order
    private orderService: OrderService
  ) {}

  // Create oleh Admin
  async create(
    createPaymentDto: CreatePaymentDto,
    creator: User
  ): Promise<Payment> {
    const { orderId, amount, paymentMethod, paymentStatus, transactionId } =
      createPaymentDto;
    this.logger.log(
      `Admin ${creator.id} attempting to create payment for order ${orderId}`
    );

    // Ambil data order menggunakan OrderService (membutuhkan user admin untuk akses)
    let order: Order;
    try {
      order = await this.orderService.findOne(orderId, creator);
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(
          `Payment creation failed: Order ${orderId} not found.`
        );
        throw new NotFoundException(`Order with ID "${orderId}" not found.`);
      }
      this.logger.error(
        `Error fetching order ${orderId} during payment creation: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException(
        "Could not retrieve order details."
      );
    }

    // Opsional: Validasi amount pembayaran vs total harga order
    if (Number(amount) !== Number(order.totalPrice)) {
      this.logger.warn(
        `Payment amount (${amount}) mismatch for order ${orderId} (total: ${order.totalPrice}). Proceeding anyway.`
      );
      // Bisa lempar BadRequestException jika perlu validasi ketat
      // throw new BadRequestException(`Payment amount (${amount}) must match order total price (${order.totalPrice}).`);
    }

    // Cek apakah sudah ada payment untuk order ini
    const existingPayment = await this.paymentRepository.findOne({
      where: { orderId },
    });
    if (existingPayment) {
      this.logger.warn(
        `Payment creation failed: Payment already exists for order ${orderId} (Payment ID: ${existingPayment.id})`
      );
      throw new ConflictException(
        `Payment already exists for order ID "${orderId}".`
      );
    }

    // Buat entitas Payment baru
    const payment = this.paymentRepository.create({
      orderId,
      userId: order.userId, // Ambil userId dari order
      amount,
      paymentMethod,
      paymentStatus: paymentStatus || PaymentStatus.PENDING, // Default PENDING
      transactionId,
      paymentDate:
        paymentStatus === PaymentStatus.COMPLETED ? new Date() : undefined, // Set tgl jika langsung completed
    });

    try {
      const savedPayment = await this.paymentRepository.save(payment);
      this.logger.log(
        `Payment ${savedPayment.id} created successfully for order ${orderId}`
      );
      // Reload untuk dapat relasi
      return this.paymentRepository.findOneOrFail({
        where: { id: savedPayment.id },
        relations: ["order", "user"],
      });
    } catch (error) {
      this.logger.error(
        `Failed to create payment for order ${orderId}: ${error.message}`,
        error.stack
      );
      if (error.code === "23505") {
        // Cek unique constraint violation
        if (error.detail?.includes("(orderId)")) {
          throw new ConflictException(
            `Payment already exists for order ID "${orderId}".`
          );
        }
        if (error.detail?.includes("(transactionId)")) {
          throw new ConflictException(
            `Transaction ID "${transactionId}" already exists.`
          );
        }
      }
      throw new InternalServerErrorException(
        "Could not create payment record."
      );
    }
  }

  async findAll(
    queryDto: PaymentQueryDto
  ): Promise<{ data: Payment[]; total: number }> {
    this.logger.log(
      `Fetching all payments with query: ${JSON.stringify(queryDto)}`
    );
    const { paymentStatus, userId, orderId, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Payment> = {};
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }
    if (userId) {
      where.userId = userId;
    }
    if (orderId) {
      where.orderId = orderId;
    }

    const queryOptions: FindManyOptions<Payment> = {
      relations: ["user", "order", "order.service"], // Sertakan relasi yg mungkin berguna
      where: where,
      order: { createdAt: "DESC" },
      skip: skip,
      take: limit,
    };

    try {
      const [data, total] =
        await this.paymentRepository.findAndCount(queryOptions);
      data.forEach((p) => {
        if (p.user?.password) delete p.user.password;
      }); // Hapus password
      this.logger.log(`Found ${total} payments matching query.`);
      return { data, total };
    } catch (error) {
      this.logger.error(
        `Failed to fetch payments: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException("Could not retrieve payments.");
    }
  }

  async findUserPayments(
    userId: number,
    queryDto: PaymentQueryDto
  ): Promise<{ data: Payment[]; total: number }> {
    // <-- UBAH Tipe ID
    this.logger.log(
      `Fetching payments for user ${userId} with query: ${JSON.stringify(queryDto)}`
    );
    // Panggil findAll dan paksa filter userId
    return this.findAll({ ...queryDto, userId: userId });
  }

  async findOne(id: number, user: User): Promise<Payment> {
    // <-- UBAH Tipe ID
    this.logger.log(`User ${user.id} attempting to fetch payment ${id}`);
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException("Invalid Payment ID format.");
    }
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ["user", "order", "order.service"],
    });

    if (!payment) {
      this.logger.warn(`Payment not found: ${id}`);
      throw new NotFoundException(`Payment with ID "${id}" not found`);
    }

    // Otorisasi: Admin atau pemilik payment (via userId)
    if (user.role !== UserRole.ADMIN && payment.userId !== user.id) {
      this.logger.warn(
        `Forbidden access attempt: User ${user.id} tried to access payment ${id} owned by ${payment.userId}`
      );
      throw new ForbiddenException(
        "You do not have permission to view this payment."
      );
    }

    this.logger.log(`Payment ${id} fetched successfully by user ${user.id}`);
    if (payment.user?.password) delete payment.user.password;
    return payment;
  }

  // Update oleh Admin
  async update(
    id: number,
    updatePaymentDto: UpdatePaymentDto,
    adminUser: User
  ): Promise<Payment> {
    // <-- UBAH Tipe ID
    this.logger.log(`Admin ${adminUser.id} attempting to update payment ${id}`);
    // findOne akan cek ID valid dan not found
    const payment = await this.findOne(id, adminUser); // Gunakan admin untuk otorisasi findOne

    const originalStatus = payment.paymentStatus;
    // Gabungkan data lama dengan data baru dari DTO
    Object.assign(payment, updatePaymentDto);

    // Atur tanggal pembayaran jika status baru adalah COMPLETED dan sebelumnya bukan
    if (
      payment.paymentStatus === PaymentStatus.COMPLETED &&
      originalStatus !== PaymentStatus.COMPLETED
    ) {
      payment.paymentDate = new Date();
      this.logger.log(
        `Setting paymentDate for payment ${id} as status changed to COMPLETED.`
      );
    }

    try {
      const savedPayment = await this.paymentRepository.save(payment);
      this.logger.log(
        `Payment ${id} updated successfully by admin ${adminUser.id}`
      );
      // Kembalikan data terbaru dengan relasi
      return this.findOne(savedPayment.id, adminUser);
    } catch (error) {
      this.logger.error(
        `Failed to update payment ${id}: ${error.message}`,
        error.stack
      );
      if (error.code === "23505" && error.detail?.includes("(transactionId)")) {
        throw new ConflictException(
          `Transaction ID "${updatePaymentDto.transactionId}" already exists.`
        );
      }
      throw new InternalServerErrorException("Could not update payment.");
    }
  }

  // Delete oleh Admin
  async remove(id: number, adminUser: User): Promise<void> {
    // <-- UBAH Tipe ID
    this.logger.log(`Admin ${adminUser.id} attempting to delete payment ${id}`);
    // findOne akan cek ID valid, not found, dan otorisasi admin
    await this.findOne(id, adminUser);

    const result = await this.paymentRepository.delete(id);
    if (result.affected === 0) {
      this.logger.warn(
        `Delete failed: Payment not found (should have been caught by findOne): ${id}`
      );
      throw new NotFoundException(`Payment with ID "${id}" not found`);
    }
    this.logger.log(
      `Payment ${id} deleted successfully by admin ${adminUser.id}`
    );
  }
}
