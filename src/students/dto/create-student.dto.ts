import { Dto } from "src/lib/dto/dto";
import { IsString, IsNotEmpty, IsEnum, IsInt, IsNumber, Min, Max, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Etnia } from "@prisma/client";

export class CreateStudentDto extends Dto<CreateStudentDto> {
  @ApiProperty({
    description: "ID del usuario relacionado con el estudiante",
    example: "clz9k3t2h0000abc123xyz789",
  })
  @IsString()
  @IsNotEmpty()
  usuarioId: string;
  
  @ApiProperty({
    description: "Edad del estudiante",
    example: 16,
  })
  @IsInt()
  edad: number;

  @ApiProperty({
    description: "Género del estudiante",
    example: "Masculino",
  })
  @IsString()
  @IsNotEmpty()
  genero: string;

  @ApiProperty({
    description: "Etnia del estudiante",
    enum: Etnia,
    example: Etnia.AFRODESCENDIENTE,
  })
  @IsEnum(Etnia, { message: "La etnia debe ser un valor válido del enum Etnia" })
  etnia: Etnia;

  @ApiProperty({
    description: "Grado escolar del estudiante",
    example: "10°",
  })
  @IsString()
  @IsNotEmpty()
  grado: string;

  @ApiProperty({
    description: "Probabilidad de deserción (valor entre 0 y 1)",
    example: 0.35,
    required: false
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  riesgoDesercion?: number;

  @ApiProperty({
    description: "ID de la institución a la que pertenece el estudiante",
    example: "clz9k5m4n0001def456uvw123",
  })
  @IsString()
  @IsNotEmpty()
  institucionId: string;
}
