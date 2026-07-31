import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"

@Injectable()
export class AccountingService {
  constructor(private readonly prisma: PrismaService) {}

  async createAccount(input: {
    businessId: string
    code: string
    name: string
    type: string
  }) {
    return this.prisma.chartOfAccount.create({
      data: {
        businessId: input.businessId,
        code: input.code,
        name: input.name,
        type: input.type,
      },
    })
  }

  async getChartOfAccounts(businessId: string) {
    return this.prisma.chartOfAccount.findMany({
      where: { businessId },
      orderBy: { code: "asc" },
    })
  }

  async createJournalEntry(input: {
    businessId: string
    entryDate: Date
    description: string
    referenceType?: string
    referenceId?: string
    createdBy?: string
    lines: Array<{ accountCode: string; debit?: number; credit?: number }>
  }) {
    if (!input.lines || input.lines.length === 0) {
      throw new BadRequestException("Journal entry must have at least one line")
    }

    const totalDebit = input.lines.reduce((sum, l) => sum + (l.debit ?? 0), 0)
    const totalCredit = input.lines.reduce((sum, l) => sum + (l.credit ?? 0), 0)

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new BadRequestException(
        `Debits (${totalDebit}) must equal credits (${totalCredit})`,
      )
    }

    for (const line of input.lines) {
      if ((line.debit ?? 0) === 0 && (line.credit ?? 0) === 0) {
        throw new BadRequestException(
          `Line for account ${line.accountCode} must have a non-zero debit or credit`,
        )
      }
    }

    const accountCodes = [...new Set(input.lines.map((l) => l.accountCode))]
    const accounts = await this.prisma.chartOfAccount.findMany({
      where: {
        businessId: input.businessId,
        code: { in: accountCodes },
        isActive: true,
      },
    })

    const accountMap = new Map(accounts.map((a) => [a.code, a.id]))

    const missing = accountCodes.filter((code) => !accountMap.has(code))
    if (missing.length > 0) {
      throw new NotFoundException(
        `Accounts not found or inactive: ${missing.join(", ")}`,
      )
    }

    return this.prisma.$transaction(async (tx) => {
      const entry = await tx.journalEntry.create({
        data: {
          businessId: input.businessId,
          entryDate: input.entryDate,
          description: input.description,
          referenceType: input.referenceType ?? null,
          referenceId: input.referenceId ?? null,
          createdBy: input.createdBy ?? null,
        },
      })

      await tx.journalLine.createMany({
        data: input.lines.map((line) => ({
          journalEntryId: entry.id,
          accountId: accountMap.get(line.accountCode)!,
          debit: line.debit ?? 0,
          credit: line.credit ?? 0,
        })),
      })

      return tx.journalEntry.findUnique({
        where: { id: entry.id },
        include: { lines: { include: { account: true } } },
      })
    })
  }

  async getJournalEntries(
    businessId: string,
    options?: { from?: Date; to?: Date },
  ) {
    const where: Record<string, unknown> = { businessId }

    if (options?.from || options?.to) {
      where.entryDate = {}
      if (options.from) {
        ;(where.entryDate as Record<string, Date>).gte = options.from
      }
      if (options.to) {
        ;(where.entryDate as Record<string, Date>).lte = options.to
      }
    }

    return this.prisma.journalEntry.findMany({
      where,
      include: { lines: { include: { account: true } } },
      orderBy: { entryDate: "desc" },
    })
  }

  async getTrialBalance(businessId: string) {
    const accounts = await this.prisma.chartOfAccount.findMany({
      where: { businessId, isActive: true },
      orderBy: { code: "asc" },
    })

    const lines = await this.prisma.journalLine.findMany({
      where: {
        journalEntry: { businessId },
      },
      select: {
        accountId: true,
        debit: true,
        credit: true,
      },
    })

    const balanceMap = new Map<
      string,
      { totalDebit: number; totalCredit: number }
    >()

    for (const line of lines) {
      const current = balanceMap.get(line.accountId) ?? {
        totalDebit: 0,
        totalCredit: 0,
      }
      current.totalDebit += Number(line.debit)
      current.totalCredit += Number(line.credit)
      balanceMap.set(line.accountId, current)
    }

    return accounts.map((account) => {
      const balances = balanceMap.get(account.id) ?? {
        totalDebit: 0,
        totalCredit: 0,
      }
      return {
        accountId: account.id,
        code: account.code,
        name: account.name,
        type: account.type,
        totalDebit: balances.totalDebit,
        totalCredit: balances.totalCredit,
        balance: balances.totalDebit - balances.totalCredit,
      }
    })
  }
}
