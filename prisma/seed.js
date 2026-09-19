const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const institutions = [
  {
    "nombre": "C.E. Indígena Emberá Alfonso Dumasa de Caimanero Jampapa",
    "codigoDANE": "227001018137",
    "direccion": "Quibdó, Chocó",
    "ciudad": "QUIBDO",
    "departamento": "CHOCÓ",
    "tipo": "OTRO"
  },
  {
    "nombre": "Centro Educativo Indígena José Melanio Tunay del 21",
    "codigoDANE": "127001017560",
    "direccion": "Quibdó, Chocó",
    "ciudad": "QUIBDO",
    "departamento": "CHOCÓ",
    "tipo": "OTRO"
  },
  {
    "nombre": "Centro Educativo El Barranco",
    "codigoDANE": "227001000009",
    "direccion": "Quibdó, Chocó",
    "ciudad": "QUIBDO",
    "departamento": "CHOCÓ",
    "tipo": "OTRO"
  },
  {
    "nombre": "Centro Educativo Munguidó",
    "codigoDANE": "227001001293",
    "direccion": "Quibdó, Chocó",
    "ciudad": "QUIBDO",
    "departamento": "CHOCÓ",
    "tipo": "OTRO"
  },
  {
    "nombre": "Centro Educativo Diego Luis Córdoba",
    "codigoDANE": "227001001072",
    "direccion": "Quibdó, Chocó",
    "ciudad": "QUIBDO",
    "departamento": "CHOCÓ",
    "tipo": "OTRO"
  },
  {
    "nombre": "IE Agropecuaria de Tagachí",
    "codigoDANE": "227001003547",
    "direccion": "Quibdó, Chocó",
    "ciudad": "QUIBDO",
    "departamento": "CHOCÓ",
    "tipo": "OTRO"
  },
  {
    "nombre": "IE Normal Superior de Quibdó",
    "codigoDANE": "127001000446",
    "direccion": "Quibdó, Chocó",
    "ciudad": "QUIBDO",
    "departamento": "CHOCÓ",
    "tipo": "OTRO"
  },
  {
    "nombre": "IE Técnica Integrado Carrasquilla Industrial",
    "codigoDANE": "127001000233",
    "direccion": "Quibdó, Chocó",
    "ciudad": "QUIBDO",
    "departamento": "CHOCÓ",
    "tipo": "OTRO"
  },
  {
    "nombre": "IE Antonio María Claret",
    "codigoDANE": "127001000268",
    "direccion": "Quibdó, Chocó",
    "ciudad": "QUIBDO",
    "departamento": "CHOCÓ",
    "tipo": "OTRO"
  },
  {
    "nombre": "IE MIA Jorge Valencia Lozano",
    "codigoDANE": "227001001145",
    "direccion": "Quibdó, Chocó",
    "ciudad": "QUIBDO",
    "departamento": "CHOCÓ",
    "tipo": "OTRO"
  },
  {
    "nombre": "IE Femenina de Enseñanza Media",
    "codigoDANE": "127001000225",
    "direccion": "Quibdó, Chocó",
    "ciudad": "QUIBDO",
    "departamento": "CHOCÓ",
    "tipo": "OTRO"
  },
  {
    "nombre": "IE Isaac Rodríguez Martínez",
    "codigoDANE": "127001004158",
    "direccion": "Quibdó, Chocó",
    "ciudad": "QUIBDO",
    "departamento": "CHOCÓ",
    "tipo": "OTRO"
  },
  {
    "nombre": "IE José del Carmen Cuesta Rentería",
    "codigoDANE": "127001003534",
    "direccion": "Quibdó, Chocó",
    "ciudad": "QUIBDO",
    "departamento": "CHOCÓ",
    "tipo": "OTRO"
  },
  {
    "nombre": "IE Miguel Antonio Caicedo Mena - Obapo",
    "codigoDANE": "227001001684",
    "direccion": "Quibdó, Chocó",
    "ciudad": "QUIBDO",
    "departamento": "CHOCÓ",
    "tipo": "OTRO"
  },
  {
    "nombre": "IE MIA Rogerio Velásquez Murillo",
    "codigoDANE": "127001004107",
    "direccion": "Quibdó, Chocó",
    "ciudad": "QUIBDO",
    "departamento": "CHOCÓ",
    "tipo": "OTRO"
  },
  {
    "nombre": "IE Agropecuaria Cristo Rey de Tutunendo",
    "codigoDANE": "227001001871",
    "direccion": "Quibdó, Chocó",
    "ciudad": "QUIBDO",
    "departamento": "CHOCÓ",
    "tipo": "OTRO"
  },
  {
    "nombre": "IE Armando Luna Roa",
    "codigoDANE": "127001000411",
    "direccion": "Quibdó, Chocó",
    "ciudad": "QUIBDO",
    "departamento": "CHOCÓ",
    "tipo": "OTRO"
  },
  {
    "nombre": "IE Normal Superior Manuel Cañizalez",
    "codigoDANE": "327001000241",
    "direccion": "Quibdó, Chocó",
    "ciudad": "QUIBDO",
    "departamento": "CHOCÓ",
    "tipo": "OTRO"
  },
  {
    "nombre": "IE Gimnasio de Quibdó",
    "codigoDANE": "127001000853",
    "direccion": "Quibdó, Chocó",
    "ciudad": "QUIBDO",
    "departamento": "CHOCÓ",
    "tipo": "OTRO"
  },
  {
    "nombre": "IE Manuel Agustín Santacoloma Villa",
    "codigoDANE": "127001001621",
    "direccion": "Quibdó, Chocó",
    "ciudad": "QUIBDO",
    "departamento": "CHOCÓ",
    "tipo": "OTRO"
  },
  {
    "nombre": "IE Santo Domingo de Guzmán",
    "codigoDANE": "127001001256",
    "direccion": "Quibdó, Chocó",
    "ciudad": "QUIBDO",
    "departamento": "CHOCÓ",
    "tipo": "OTRO"
  },
  {
    "nombre": "IE Santo Domingo Savio",
    "codigoDANE": "327001001000",
    "direccion": "Quibdó, Chocó",
    "ciudad": "QUIBDO",
    "departamento": "CHOCÓ",
    "tipo": "OTRO"
  },
  {
    "nombre": "IE Diocesano Pedro Grau y Arola",
    "codigoDANE": "127001018001",
    "direccion": "Quibdó, Chocó",
    "ciudad": "QUIBDO",
    "departamento": "CHOCÓ",
    "tipo": "OTRO"
  },
  {
    "nombre": "IE Antonio Ricaurte",
    "codigoDANE": "227001018200",
    "direccion": "Quibdó, Chocó",
    "ciudad": "QUIBDO",
    "departamento": "CHOCÓ",
    "tipo": "OTRO"
  }
];

async function main() {
  for (const item of institutions) {
    const existing = await prisma.institucion.findFirst({
      where: { codigoDANE: item.codigoDANE, deletedAt: null },
    });
    if (!existing) {
      await prisma.institucion.create({ data: item });
    }
  }
  console.log(`Seed SIEDES: ${institutions.length} instituciones verificadas.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
