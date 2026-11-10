import "dotenv/config";
import { prisma } from "../lib/prisma";
const courts = await prisma.court.groupBy({ by: ["area", "source"], _count: true, orderBy: { _count: { area: "desc" } }, take: 30 });
console.log(courts.map(c => `${c.source} ${c._count} ${JSON.stringify(c.area)}`).join("\n"));
console.log("total courts", await prisma.court.count());
console.log(await prisma.courtSport.groupBy({ by: ["sportId"], _count: true }));
console.log(await prisma.sport.findMany({ select: { id: true, name: true, icon: true } }));
console.log((await prisma.availability.findMany({ take: 5 })));
await prisma.$disconnect();
