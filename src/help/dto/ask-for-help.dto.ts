import { Dto } from "src/lib/dto/dto";
import { IsEnum, IsString, MinLength } from "class-validator";
import { TipoSolicitante, MotivoSolicitud } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class AskForHelp extends Dto<AskForHelp> {
  @ApiProperty({ example: "ESTUDIANTE", description: "Tipo de solicitante que pide la ayuda (ej: ESTUDIANTE, DOCENTE, PADRE_FAMILIA)"})
  @IsEnum(TipoSolicitante)
  tipoSolicitante: TipoSolicitante;

  @ApiProperty({ example: "María Fernanda López", description: "Nombre completo del solicitante" })
  @IsString()
  @MinLength(6)
  nombre: string;

  @ApiProperty({ example: "+57 3114567890", description: "Número de teléfono de contacto" })
  @IsString()
  telefono: string;

  @ApiProperty({ example: "maria.lopez@estudiantes.uib.edu.co", description: "Correo electrónico del solicitante" })
  @IsString()
  email: string;

  @ApiProperty({ example: "cmfxihkqr0000uh7gx9zv9yg3", description: "ID de la institución asociada (cuid generado por Prisma)" })
  @IsString()
  institucionId: string;

  @ApiProperty({ example: "clm9v8h9d0001abc456xyz", description: "ID del estudiante asociado (cuid generado por Prisma)" })
  @IsString()
  estudianteId: string;

  @ApiProperty({ example: "PROBLEMAS_ECONOMICOS", description: "Motivo de la solicitud (ej: BAJO_RENDIMIENTO, INASISTENCIA, PROBLEMAS_FAMILIARES, PROBLEMAS_ECONOMICOS, ACOSO_ESCOLAR, OTROS)" })
  @IsEnum(MotivoSolicitud)
  motivoSolicitud: MotivoSolicitud;

  @ApiProperty({ example: "Estoy teniendo dificultades para cubrir mis gastos de transporte y materiales académicos, lo que afecta mi asistencia a clases.", description: "Descripción detallada de la situación" })
  @IsString()
  descripcion: string;
}
