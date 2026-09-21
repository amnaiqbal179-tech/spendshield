import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// 1. GET: Fetch all savings opportunities for the active organization
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

    // Fetch opportunities linked through renewals and subscriptions
    const opportunities = await prisma.savingsOpportunity.findMany({
      where: {
        renewal: {
          subscription: {
            organizationId: organization.id,
          },
        },
      },
      include: {
        renewal: {
          include: {
            subscription: true,
          },
        },
      },
      orderBy: {
        estimatedSaving: 'desc', // Show highest savings first
      },
    });

    return NextResponse.json({ success: true, data: opportunities });
  } catch (error) {
    console.error('Error fetching savings opportunities:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch savings opportunities' } },
      { status: 500 }
    );
  }
}

// 2. POST: Run Savings Opportunity Detector Rules for a Renewal
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
    const { renewalId } = body;

    if (!renewalId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Renewal ID is required' } },
        { status: 400 }
      );
    }

    // Fetch renewal and subscription details with organization security check
    const renewal = await prisma.renewal.findFirst({
      where: {
        id: renewalId,
        organizationId: organization.id,
      },
      include: {
        subscription: true,
      },
    });

    if (!renewal || !renewal.subscription) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Renewal record or subscription not found' } },
        { status: 404 }
      );
    }

    const sub = renewal.subscription;
    const generatedOpportunities = [];

    // Map fields securely based on schema (licenseCount, activeUsers, annualCost)
    const totalSeats = sub.licenseCount ?? 0;
    const activeSeats = sub.activeUsers ?? 0;
    const annualCost = Number(sub.annualCost ?? 0);

    // Rule 1: Unused Licenses Detector (If active seats < purchased seats)
    if (activeSeats < totalSeats && totalSeats > 0) {
      const unusedCount = totalSeats - activeSeats;
      const unitCost = annualCost / totalSeats;
      const estimatedSavingAmount = unusedCount * unitCost;

      // Check if similar opportunity already exists to prevent duplication
      const existingOpp = await prisma.savingsOpportunity.findFirst({
        where: {
          renewalId: renewal.id,
          signalType: 'UNUSED_LICENSES',
        },
      });

      if (!existingOpp) {
        const opp = await prisma.savingsOpportunity.create({
          data: {
            renewalId: renewal.id,
            signalType: 'UNUSED_LICENSES',
            description: `${unusedCount} out of ${totalSeats} licenses are currently unassigned or unused.`,
            estimatedSaving: estimatedSavingAmount,
            urgency: 'HIGH',
            recommendedAction: 'REDUCE',
          },
        });
        generatedOpportunities.push(opp);
      }
    }

    // Rule 2: High Renewal Cost / General Review Rule
    if (annualCost > 5000) {
      const existingOpp = await prisma.savingsOpportunity.findFirst({
        where: {
          renewalId: renewal.id,
          signalType: 'HIGH_RENEWAL_COST',
        },
      });

      if (!existingOpp) {
        const opp = await prisma.savingsOpportunity.create({
          data: {
            renewalId: renewal.id,
            signalType: 'HIGH_RENEWAL_COST',
            description: `High financial value contract ($${annualCost}) approaching renewal. Requires vendor negotiation.`,
            estimatedSaving: annualCost * 0.15, // Estimated 15% saving via negotiation
            urgency: 'MEDIUM',
            recommendedAction: 'NEGOTIATE',
          },
        });
        generatedOpportunities.push(opp);
      }
    }

    return NextResponse.json({ success: true, data: generatedOpportunities }, { status: 201 });
  } catch (error) {
    console.error('Error generating savings opportunities:', error);
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Failed to run savings opportunity rules' } },
      { status: 422 }
    );
  }
}