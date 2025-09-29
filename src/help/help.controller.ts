import { Body, Controller, Post } from '@nestjs/common';
import { HelpService } from './help.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AskForHelp } from './dto/ask-for-help.dto';

@ApiTags('Solicitud de ayuda rápida')
@Controller('help')
export class HelpController {
  constructor(private helpService: HelpService) {}

  @Post('create-quick-help-request')
  @ApiOperation({ summary: 'Crear una solicitud de ayuda rápida',description: 'Crea una nueva solicitud de ayuda rápida' })
  @ApiResponse({ status: 201, description: 'Solicitud creada exitosamente',})
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  @ApiResponse({ status: 409, description: 'El usuario ya tiene un estudiante asociado' })
  createquickHelpRequest(@Body() dtoquickHelpRequest: AskForHelp) {
    return this.helpService.quickHelpRequest(dtoquickHelpRequest);
  }
}
