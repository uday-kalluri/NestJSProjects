// loyalties/loyalties.controller.ts
import { Controller, Get, Patch, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { LoyaltiesService } from './loyalities.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decoraters/roles.decorator';
import { Role } from '../common/interfaces/role.enum';
import { UpdatePointsDto } from './dto/update-points.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

@Controller('loyalties')
@UseGuards(JwtAuthGuard)
@ApiTags('loyalties')
@ApiBearerAuth()
export class LoyaltiesController {
  constructor(private service: LoyaltiesService) {}

  // User: view own
  @Get('me')
  @ApiOperation({ summary: 'Get my loyalty points' })
  @ApiResponse({ status: 200, description: 'Loyalty points data' })
  mine(@Req() req) { return this.service.getMine(req.user.sub); }

  // Admin: list all
  @Get()
  @UseGuards(RolesGuard) @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all loyalty records (Admin only)' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of loyalty records' })
  list(@Query('skip') skip=0, @Query('limit') limit=50) {
    return this.service.listAll(Number(skip), Number(limit));
  }

  // Admin: adjust points for a user
  @Patch(':userId/points')
  @UseGuards(RolesGuard) @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Adjust points for a user (Admin only)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Points adjusted' })
  adjust(@Param('userId') userId: string, @Body() dto: UpdatePointsDto) {
    return this.service.adjust(userId, dto.delta, dto.reason);
  }
}
