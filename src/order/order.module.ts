import { Module } from '@nestjs/common'; // Hapus forwardRef jika tidak perlu
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ServiceModule } from '../service/service.module'; // Impor ServiceModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    ServiceModule, // Sediakan ServiceService
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService], // Ekspor jika dibutuhkan PaymentModule
})
export class OrderModule {}