import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/config/db";
import { consultationsTable } from "@/config/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const consultations = await db
            .select()
            .from(consultationsTable)
            .where(eq(consultationsTable.clerkId, session.user.email))
            .orderBy(desc(consultationsTable.createdAt));

        return NextResponse.json({ consultations });
    } catch (error) {
        console.error("Error fetching consultations:", error);
        return NextResponse.json(
            { error: "Failed to fetch consultations" },
            { status: 500 }
        );
    }
}
