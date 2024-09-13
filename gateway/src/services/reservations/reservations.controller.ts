import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ApiTags } from '@nestjs/swagger';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';

@ApiTags('reservations')
@Controller()
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post('reservations')
  create(@Payload() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }
  @Get('reservations/:id')
  @CacheKey(process.env.RESERVATION_CACHE_KEY) // Clave en el caché
  @CacheTTL(60)
  findReservation(@Param('id') id: number) {
    return this.reservationsService.findReservation(id);
  }
  @Delete('cancel/reservations/:id')
  delete(@Param('id') id: number) {
    return this.reservationsService.cancelReservation(id);
  }
}
