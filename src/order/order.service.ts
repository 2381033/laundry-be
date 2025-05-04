// src/order/order.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindManyOptions, FindOptionsWhere } from "typeorm"; // Import FindOptionsWhere
import { Order } from "./order.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { User } from "../user/user.entity";
import { ServiceService } from "../service/service.service"; // Pastikan ini diimpor dan disediakan di OrderModule
import { OrderStatus } from "./enums/order-status.enum";
import { UserRole } from "../user/enums/user-role.enum";
import { OrderQueryDto } from "./dto/order-query.dto";

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    // Inject ServiceService untuk mendapatkan detail layanan dan harga
    private serviceService: ServiceService
  ) {}

  /**
   * Membuat pesanan baru untuk pengguna yang sedang login.
   * @param createOrderDto Data untuk membuat pesanan (serviceId, quantity, notes, etc.)
   * @param user Objek pengguna yang melakukan pemesanan (dari token JWT)
   * @returns Promise<Order> Entitas pesanan yang baru dibuat beserta relasinya.
   */
  async create(createOrderDto: CreateOrderDto, user: User): Promise<Order> {
    const { serviceId, quantity, pickupDate, deliveryDate, notes } =
      createOrderDto;
    this.logger.log(
      `User ${user.id} (${user.email}) attempting to create order for service ${serviceId} with quantity ${quantity}`
    );

    // 1. Validasi Service ID menggunakan ServiceService
    let service;
    try {
      service = await this.serviceService.findOne(serviceId); // findOne sudah handle not found & validasi ID
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(
          `Order creation failed: Service with ID ${serviceId} not found.`
        );
        // Lempar kembali error NotFoundException agar Controller bisa menangani
        throw new NotFoundException(
          `Service with ID "${serviceId}" not found.`
        );
      }
      // Jika error lain saat mencari service
      this.logger.error(
        `Error finding service ${serviceId} during order creation: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException(
        "Could not verify service details."
      );
    }

    // 2. Hitung Total Harga
    // Pastikan quantity adalah angka positif
    if (isNaN(quantity) || quantity <= 0) {
      throw new BadRequestException("Quantity must be a positive number.");
    }
    const totalPrice = service.price * quantity;

    // 3. Buat instance entitas Order
    const order = this.orderRepository.create({
      userId: user.id, // ID dari user yang login
      serviceId,
      quantity,
      totalPrice,
      status: OrderStatus.PENDING, // Status awal
      notes,
      pickupDate: pickupDate ? new Date(pickupDate) : null, // Konversi ke Date atau biarkan null
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null, // Konversi ke Date atau biarkan null
      // user dan service akan di-link oleh TypeORM berdasarkan userId dan serviceId saat save,
      // atau bisa juga di-assign manual: user: user, service: service
    });

    // 4. Simpan ke Database
    try {
      const savedOrder = await this.orderRepository.save(order);
      this.logger.log(
        `Order created successfully: ID ${savedOrder.id} by User ID ${user.id}`
      );
      // Kembalikan data lengkap dengan relasi (findOne akan memuat relasi)
      // Menggunakan findOne juga memastikan data terbaru dikembalikan
      return this.findOne(savedOrder.id, user); // findOne sudah handle otorisasi & relasi
    } catch (error) {
      this.logger.error(
        `Failed to save order for user ${user.id}: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException("Could not place the order.");
    }
  }

  /**
   * Mengambil semua pesanan dengan filter dan paginasi (Hanya untuk Admin).
   * @param queryDto DTO yang berisi filter (status, userId, serviceId) dan paginasi (page, limit)
   * @returns Promise<{ data: Order[], total: number }> Daftar pesanan dan jumlah total.
   */
  async findAll(
    queryDto: OrderQueryDto
  ): Promise<{ data: Order[]; total: number }> {
    this.logger.log(
      `Fetching all orders (Admin request) with query: ${JSON.stringify(queryDto)}`
    );
    const { status, userId, serviceId, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    // Bangun kondisi 'where' secara dinamis
    const where: FindOptionsWhere<Order> = {};
    if (status) {
      where.status = status;
    }
    if (userId) {
      where.userId = userId;
    }
    if (serviceId) {
      where.serviceId = serviceId;
    }

    const queryOptions: FindManyOptions<Order> = {
      relations: ["user", "service", "payment"], // Muat relasi yang relevan
      where: where,
      order: { createdAt: "DESC" }, // Urutkan dari yang terbaru
      skip: skip,
      take: limit,
    };

    try {
      const [data, total] =
        await this.orderRepository.findAndCount(queryOptions);
      // Pastikan password tidak terkirim
      data.forEach((o) => {
        if (o.user?.password) delete o.user.password;
      });
      this.logger.log(`Found ${total} orders matching admin query.`);
      return { data, total };
    } catch (error) {
      this.logger.error(
        `Failed to fetch all orders: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException("Could not retrieve orders.");
    }
  }

  /**
   * Mengambil pesanan milik pengguna yang sedang login dengan filter dan paginasi.
   * @param userId ID pengguna yang sedang login
   * @param queryDto DTO yang berisi filter (status, serviceId) dan paginasi (page, limit)
   * @returns Promise<{ data: Order[], total: number }> Daftar pesanan pengguna dan jumlah total.
   */
  async findUserOrders(
    userId: number, // <-- Tipe ID number
    queryDto: OrderQueryDto
  ): Promise<{ data: Order[]; total: number }> {
    this.logger.log(
      `Fetching orders for user ${userId} with query: ${JSON.stringify(queryDto)}`
    );
    // Panggil findAll tetapi paksa filter userId dan hapus userId dari DTO agar tidak duplikat
    const { userId: _, ...restQuery } = queryDto;
    return this.findAll({ ...restQuery, userId: userId });
  }

  /**
   * Mengambil detail satu pesanan berdasarkan ID.
   * Memastikan hanya pemilik pesanan atau Admin yang bisa mengakses.
   * @param id ID pesanan yang akan diambil
   * @param user Objek pengguna yang melakukan permintaan (untuk cek otorisasi)
   * @returns Promise<Order> Entitas pesanan lengkap dengan relasi.
   */
  async findOne(id: number, user: User): Promise<Order> {
    // <-- Tipe ID number
    this.logger.log(
      `User ${user.id} (${user.email}) attempting to fetch order ID: ${id}`
    );
    // Validasi ID
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException("Invalid Order ID format.");
    }

    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ["user", "service", "payment"], // Muat relasi yang dibutuhkan
    });

    if (!order) {
      this.logger.warn(`Order not found: ${id}`);
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }

    // Otorisasi: Admin bisa lihat semua, Customer hanya miliknya
    if (user.role !== UserRole.ADMIN && order.userId !== user.id) {
      this.logger.warn(
        `Forbidden access attempt: User ${user.id} tried to access order ${id} owned by User ${order.userId}`
      );
      throw new ForbiddenException(
        "You do not have permission to view this order."
      );
    }

    this.logger.log(`Order ${id} fetched successfully by user ${user.id}`);
    // Pastikan password user tidak terkirim
    if (order.user?.password) delete order.user.password;
    return order;
  }

  /**
   * Memperbarui detail pesanan (hanya bisa dilakukan oleh Admin).
   * @param id ID pesanan yang akan diperbarui
   * @param updateOrderDto Data pembaruan (status, tanggal, notes, quantity, totalPrice)
   * @param adminUser Objek pengguna Admin yang melakukan pembaruan
   * @returns Promise<Order> Entitas pesanan yang sudah diperbarui.
   */
  async update(
    id: number, // <-- Tipe ID number
    updateOrderDto: UpdateOrderDto,
    adminUser: User // Memastikan ini admin (walaupun sudah dicek di controller)
  ): Promise<Order> {
    this.logger.log(
      `Admin ${adminUser.id} attempting to update order ID: ${id}`
    );
    // findOne akan memvalidasi ID dan memastikan order ada
    // Kita perlu findOne tanpa cek user spesifik karena admin boleh update semua
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      this.logger.warn(`Update failed: Order not found: ${id}`);
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }

    // Logika update: Gabungkan data lama dengan data baru dari DTO
    // Pertimbangkan jika perubahan quantity/service perlu hitung ulang totalPrice
    let newTotalPrice = order.totalPrice;
    let newQuantity = order.quantity;

    if (
      updateOrderDto.quantity !== undefined &&
      updateOrderDto.quantity !== order.quantity
    ) {
      newQuantity = updateOrderDto.quantity;
      // Hitung ulang totalPrice jika quantity berubah (membutuhkan data service)
      if (order.serviceId) {
        // Pastikan service masih terhubung
        try {
          const service = await this.serviceService.findOne(order.serviceId);
          newTotalPrice = service.price * newQuantity;
          this.logger.log(
            `Recalculated total price for order ${id} based on new quantity ${newQuantity}: ${newTotalPrice}`
          );
        } catch (serviceError) {
          this.logger.warn(
            `Could not recalculate price for order ${id}: Service ${order.serviceId} not found or error fetching. Price remains ${order.totalPrice}.`
          );
          // Tetapkan harga lama jika service tidak ditemukan saat update quantity
          newTotalPrice = order.totalPrice;
        }
      } else {
        this.logger.warn(
          `Cannot recalculate price for order ${id}: Service ID is null. Price remains ${order.totalPrice}.`
        );
        newTotalPrice = order.totalPrice; // Atau set 0? Tergantung aturan bisnis
      }
    }

    // Jika admin secara eksplisit mengupdate totalPrice di DTO, gunakan itu
    if (updateOrderDto.totalPrice !== undefined) {
      newTotalPrice = updateOrderDto.totalPrice;
      this.logger.log(
        `Using explicit total price from DTO for order ${id}: ${newTotalPrice}`
      );
    }

    // Gunakan Object.assign untuk merge DTO ke entity yang ada
    Object.assign(order, {
      status: updateOrderDto.status ?? order.status, // Gunakan ?? untuk handle undefined/null
      quantity: newQuantity, // Gunakan quantity baru
      totalPrice: newTotalPrice, // Gunakan total price baru
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
      this.logger.log(
        `Order ${id} updated successfully by admin ${adminUser.id}`
      );
      // Kembalikan data terbaru dengan relasi
      return this.findOne(savedOrder.id, adminUser); // Gunakan adminUser untuk akses findOne
    } catch (error) {
      this.logger.error(
        `Failed to update order ${id}: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException("Could not update order.");
    }
  }

  /**
   * Membatalkan pesanan (hanya bisa oleh Customer pemilik pesanan dan jika status memungkinkan).
   * @param id ID pesanan yang akan dibatalkan
   * @param user Objek pengguna yang mencoba membatalkan
   * @returns Promise<Order> Entitas pesanan yang sudah dibatalkan.
   */
  async cancelOrder(id: number, user: User): Promise<Order> {
    // <-- Tipe ID number
    this.logger.log(`User ${user.id} attempting to cancel order ID: ${id}`);
    // findOne akan validasi ID dan kepemilikan (karena user bukan admin)
    const order = await this.findOne(id, user);

    // Aturan pembatalan: hanya jika status PENDING
    if (order.status !== OrderStatus.PENDING) {
      this.logger.warn(
        `Cancel failed: Order ${id} status is ${order.status}, not cancellable by user ${user.id}.`
      );
      throw new BadRequestException(
        `Order cannot be cancelled when status is "${order.status}".`
      );
    }

    // Ubah status menjadi CANCELLED
    order.status = OrderStatus.CANCELLED;

    try {
      const savedOrder = await this.orderRepository.save(order);
      this.logger.log(`Order ${id} cancelled successfully by user ${user.id}`);
      // Kembalikan data terbaru dengan relasi
      return this.findOne(savedOrder.id, user); // Tetap gunakan user asli untuk akses
    } catch (error) {
      this.logger.error(
        `Failed to cancel order ${id}: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException("Could not cancel order.");
    }
  }

  /**
   * Menghapus pesanan (hanya bisa oleh Admin).
   * @param id ID pesanan yang akan dihapus
   * @param adminUser Objek pengguna Admin yang melakukan penghapusan
   * @returns Promise<void>
   */
  async remove(id: number, adminUser: User): Promise<void> {
    // <-- Tipe ID number
    this.logger.log(
      `Admin ${adminUser.id} attempting to delete order ID: ${id}`
    );
    // findOne akan validasi ID dan memastikan admin bisa akses (sudah dicek di controller juga)
    await this.findOne(id, adminUser);

    const result = await this.orderRepository.delete(id);

    if (result.affected === 0) {
      // Ini seharusnya tidak terjadi jika findOne berhasil
      this.logger.warn(
        `Delete failed: Order ${id} not found after existence check.`
      );
      throw new NotFoundException(
        `Order with ID "${id}" could not be deleted.`
      );
    }
    this.logger.log(
      `Order ${id} deleted successfully by admin ${adminUser.id}`
    );
  }
}
