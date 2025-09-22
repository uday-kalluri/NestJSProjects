// loyalties/loyalties.controller.ts
import { Controller, Get, Patch, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { LoyaltiesService } from './loyalities.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decoraters/roles.decorator';
import { Role } from '../common/interfaces/role.enum';
import { UpdatePointsDto } from './dto/update-points.dto';

@Controller('loyalties')
@UseGuards(JwtAuthGuard)
export class LoyaltiesController {
  constructor(private service: LoyaltiesService) {}

  // User: view own
  @Get('me')
  mine(@Req() req) { return this.service.getMine(req.user.sub); }

  // Admin: list all
  @Get()
  @UseGuards(RolesGuard) @Roles(Role.ADMIN)
  list(@Query('skip') skip=0, @Query('limit') limit=50) {
    return this.service.listAll(Number(skip), Number(limit));
  }

  // Admin: adjust points for a user
  @Patch(':userId/points')
  @UseGuards(RolesGuard) @Roles(Role.ADMIN)
  adjust(@Param('userId') userId: string, @Body() dto: UpdatePointsDto) {
    return this.service.adjust(userId, dto.delta, dto.reason);
  }
}
