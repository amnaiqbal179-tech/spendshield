import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// 1. GET: Fetch Savings Ledger history and verified outcomes for the organization
export async function GET(request: Request) {
  try {
    const { orgId } = await auth();

    if (!orgId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Organization context missing' } },
        { status: 401 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { clerkOrgId: orgId },
    });

    if (!organization) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Organization not found' } },
        { status: 404 }
      );
    }

    // Fetch savings records linked through organizationId directly or via decision -> renewal -> subscription
    const savingsRecords = await prisma.savingsRecord.findMany({
      where: {
        organizationId: organization.id,
      },
      include: {
        decision: {
          include: {
            Renewal: {
              include: {
                subscription: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: savingsRecords });
  } catch (error) {
    console.error('Error fetching savings ledger:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch savings ledger records' } },
      { status: 500 }
    );
  }
}

// 2. POST: Verify & Lock Savings into Realized Stage (Savings Truth Layer)
export async function POST(request: Request) {
  try {
    const { orgId } = await auth();

    if (!orgId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Organization context missing' } },
        { status: 401 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { clerkOrgId: orgId },
    });

    if (!organization) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Organization not found' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { decisionId, originalCost, finalCost, savingType = 'NEGOTIATION' } = body;

    if (!decisionId || originalCost === undefined || finalCost === undefined) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } },
        { status: 422 }
      );
    }

    // Verify decision belongs to the organization using correct 'Decision' model
    const decision = await prisma.decision.findFirst({
      where: {
        id: decisionId,
        organizationId: organization.id,
      },
      include: {
        Renewal: true,
      },
    });

    if (!decision) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Decision record not found or unauthorized' } },
        { status: 404 }
      );
    }

    const orig = Number(originalCost);
    const final = Number(finalCost);
    const realizedVal = orig - final;
    const potentialVal = realizedVal > 0 ? realizedVal : 0;

    // Create Savings Record matching exact schema column names
    const savingsRecord = await prisma.savingsRecord.create({
      data: {
        organizationId: organization.id,
        decisionId: decision.id,
        renewalId: decision.renewalId,
        stage: 'REALIZED',
        baselineCost: orig,
        finalCost: final,
        potentialSaving: potentialVal,
        realizedSaving: potentialVal,
        savingType: savingType,
      },
    });

    // Update decision status (using valid status from DecisionStatus enum if applicable, e.g., 'APPROVED' or 'COMPLETED')
    await prisma.decision.update({
      where: { id: decision.id },
      data: {
        status: 'COMPLETED',
      },
    });

    return NextResponse.json({ success: true, data: savingsRecord }, { status: 201 });
  } catch (error) {
    console.error('Error verifying savings:', error);
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Failed to verify and record savings' } },
      { status: 422 }
    );
  }
}

// 3. PATCH: Update Opportunity / Decision Stage dynamically from UI Modal
export async function PATCH(request: Request) {
  try {
    const { orgId } = await auth();

    if (!orgId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Organization context missing' } },
        { status: 401 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { clerkOrgId: orgId },
    });

    if (!organization) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Organization not found' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { id, stage } = body;

    if (!id || !stage) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing record ID or stage name' } },
        { status: 422 }
      );
    }

    // Yahan aap apne model (misal ke tour par Renewal ya SavingsRecord) ko update kar sakte hain
    // Misal ke tour par agar aap SavingsRecord ki stage update kar rahe hain:
    const updatedRecord = await prisma.savingsRecord.updateMany({
      where: {
        id: id,
        organizationId: organization.id,
      },
      data: {
        stage: stage,
      },
    });

    return NextResponse.json({ success: true, data: updatedRecord }, { status: 200 });
  } catch (error) {
    console.error('Error updating stage:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update stage' } },
      { status: 500 }
    );
  }
}