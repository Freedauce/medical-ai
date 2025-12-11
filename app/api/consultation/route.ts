import { NextRequest, NextResponse } from 'next/server';
import { getMedicalResponse } from '@/lib/gemini';
import { getServerSession } from 'next-auth';
import { db } from '@/config/db';
import { consultationsTable } from '@/config/schema';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { transcript } = await request.json();

        if (!transcript || transcript.trim() === '') {
            return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
        }

        // Get AI response
        const aiResponse = await getMedicalResponse(transcript);

        // Save consultation to database (using email as identifier since we don't have clerkId)
        await db.insert(consultationsTable).values({
            clerkId: session.user.email, // Using email as user identifier
            transcript: transcript,
            aiResponse: aiResponse,
        });

        return NextResponse.json({
            success: true,
            aiResponse
        });

    } catch (error) {
        console.error('Error in consultation API:', error);
        return NextResponse.json(
            { error: 'Failed to process consultation' },
            { status: 500 }
        );
    }
}
