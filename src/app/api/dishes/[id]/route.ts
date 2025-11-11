import { requireSession } from '@/app/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Get dish by id
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  let userId;
  try {
    userId = await requireSession();
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    const dish = await prisma.dish.findUnique({ where: { id: Number(context.params.id) } });
    if (!dish || dish.userId !== Number(userId)) {
      return NextResponse.json({ error: 'Platillo no encontrado o no autorizado' }, { status: 404 });
    }
    return NextResponse.json({ dish });
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT: Edit a dish
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  let userId;
  try {
    userId = await requireSession();
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const data = await request.json();
  const { name, description, quickPrep, prepTime, cookTime, imageUrl, steps, calories } = data;

  // Verificar que el platillo pertenece al usuario
  const dishCheck = await prisma.dish.findUnique({ where: { id: Number(context.params.id) } });
  if (!dishCheck || dishCheck.userId !== Number(userId)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const dish = await prisma.dish.update({
      where: { id: Number(context.params.id) },
      data: {
        name,
        description,
        quickPrep,
        prepTime,
        cookTime,
        imageUrl,
        steps: Array.isArray(steps) ? steps : [],
        calories: calories === undefined || calories === null || calories === '' ? null : Number(calories),
      },
    });
    return NextResponse.json({ dish });
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: Remove a dish
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  let userId;
  try {
    userId = await requireSession();
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  // Verificar que el platillo pertenece al usuario
  const dishCheck = await prisma.dish.findUnique({ where: { id: Number(context.params.id) } });
  if (!dishCheck || dishCheck.userId !== Number(userId)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  try {
    await prisma.dish.delete({ where: { id: Number(context.params.id) } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
