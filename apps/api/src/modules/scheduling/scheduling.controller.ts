import { Controller, Get, Query, Param, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SchedulingService } from './scheduling.service';

@ApiTags('Scheduling')
@ApiBearerAuth()
@Controller('scheduling')
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Get('day/:technicianId')
  @ApiOperation({ summary: 'Buscar agenda do dia para um técnico' })
  @ApiQuery({ name: 'date', required: true, example: '2026-03-13' })
  @ApiResponse({ status: 200, description: 'Agenda do dia' })
  getDaySchedule(@Param('technicianId') technicianId: string, @Query('date') dateStr: string) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Data inválida');
    }
    return this.schedulingService.getDaySchedule(technicianId, date);
  }

  @Get('week/:technicianId')
  @ApiOperation({ summary: 'Buscar agenda da semana para um técnico' })
  @ApiQuery({ name: 'startDate', required: true, example: '2026-03-13' })
  @ApiResponse({ status: 200, description: 'Agenda da semana' })
  getWeekSchedule(
    @Param('technicianId') technicianId: string,
    @Query('startDate') startDateStr: string,
  ) {
    const startDate = new Date(startDateStr);
    if (isNaN(startDate.getTime())) {
      throw new BadRequestException('Data inválida');
    }
    return this.schedulingService.getWeekSchedule(technicianId, startDate);
  }

  @Get('availability/:technicianId')
  @ApiOperation({ summary: 'Verificar disponibilidade de um técnico' })
  @ApiQuery({ name: 'datetime', required: true, example: '2026-03-13T14:00:00Z' })
  @ApiQuery({ name: 'duration', required: false, example: 60, description: 'Duração em minutos' })
  @ApiQuery({
    name: 'excludeOrderId',
    required: false,
    description: 'ID da ordem a excluir da verificação',
  })
  @ApiResponse({ status: 200, description: 'Disponibilidade verificada' })
  checkAvailability(
    @Param('technicianId') technicianId: string,
    @Query('datetime') datetimeStr: string,
    @Query('duration') duration?: number,
    @Query('excludeOrderId') excludeOrderId?: string,
  ) {
    const datetime = new Date(datetimeStr);
    if (isNaN(datetime.getTime())) {
      throw new BadRequestException('Data/hora inválida');
    }
    return this.schedulingService.checkAvailability(
      technicianId,
      datetime,
      duration ? parseInt(duration.toString()) : 60,
      excludeOrderId,
    );
  }

  @Get('available-slots/:technicianId')
  @ApiOperation({ summary: 'Sugerir próximos horários disponíveis' })
  @ApiQuery({ name: 'startDate', required: true, example: '2026-03-13' })
  @ApiQuery({ name: 'count', required: false, example: 5, description: 'Número de slots' })
  @ApiResponse({ status: 200, description: 'Horários disponíveis' })
  suggestAvailableSlots(
    @Param('technicianId') technicianId: string,
    @Query('startDate') startDateStr: string,
    @Query('count') count?: number,
  ) {
    const startDate = new Date(startDateStr);
    if (isNaN(startDate.getTime())) {
      throw new BadRequestException('Data inválida');
    }
    return this.schedulingService.suggestAvailableSlots(
      technicianId,
      startDate,
      count ? parseInt(count.toString()) : 5,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas de agendamento' })
  @ApiQuery({ name: 'technicianId', required: false })
  @ApiResponse({ status: 200, description: 'Estatísticas' })
  getStats(@Query('technicianId') technicianId?: string) {
    return this.schedulingService.getSchedulingStats(technicianId);
  }
}
