import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './service.entity';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';

@Module({
  imports: [
      TypeOrmModule.forFeature([Service]),
    ],
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [ServiceService], // Ekspor service jika dibutuhkan OrderModule
})
export class ServiceModule {}