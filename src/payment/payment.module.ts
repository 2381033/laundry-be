import { Module } from '@nestjs/common'; // Hapus forwardRef jika tidak perlu
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { OrderModule } from '../order/order.module'; // Impor OrderModule

@Module({
  imports: [
      TypeOrmModule.forFeature([Payment]),
      OrderModule, // Sediakan OrderService
    ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}