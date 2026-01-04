import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Lecture from '@/lib/models/Lecture';
import { auth } from '@/auth';

// GET all lectures
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const bookId = searchParams.get('book');
    const limit = parseInt(searchParams.get('limit') || '50');
    const published = searchParams.get('published');

    let query: any = {};

    if (featured === 'true') {
      query.featured = true;
      query.published = true;
    }

    if (bookId) {
      query.bookId = bookId;
    }

    if (published === 'true') {
      query.published = true;
    } else if (published === 'false') {
      query.published = false;
    }

    const lectures = await Lecture.find(query)
      .sort({ gregorianDate: -1 })
      .limit(limit)
      .populate('bookId', 'titleEnglish titleArabic')
      .populate('sheikhId', 'nameEnglish nameArabic')
      .lean();

    return NextResponse.json({ lectures });
  } catch (error: any) {
    console.error('GET /api/lectures error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create new lecture (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const lecture = await Lecture.create(body);

    return NextResponse.json({ lecture }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/lectures error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
