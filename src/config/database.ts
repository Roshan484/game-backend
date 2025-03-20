import { PrismaClient } from "@prisma/client";
interface QueryEvent {
	query: string;
	params: string;
	duration: number;
}
export const prisma = new PrismaClient({
	log: [
		{
			emit: "event",
			level: "query",
		},
		{
			emit: "stdout",
			level: "error",
		},
		{
			emit: "stdout",
			level: "info",
		},
		{
			emit: "stdout",
			level: "warn",
		},
	],
});

prisma.$on("query", (e: QueryEvent) => {
	console.log("Query: " + e.query);
	console.log("Params: " + e.params);
	console.log("Duration: " + e.duration + "ms");
});
