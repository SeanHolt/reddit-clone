import { db } from "@/lib/db";

interface ModifyWalletParams {
  userId: string;
  amount: number;
  transactionType: string;
}

/**
 * Transactionally adjusts a user's wallet token balance and logs an 
 * immutable coin transaction row entry. Enforces a zero floor balance limit.
 */
export async function modifyUserWallet({ userId, amount, transactionType }: ModifyWalletParams): Promise<{ success: boolean; newBalance: number }> {
  return await db.$transaction(async (tx) => {
    // 1. Ensure a wallet row exists for the target user profile
    let wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await tx.wallet.create({ data: { userId, balance: 0 } });
    }

    // 2. Prevent balance debits from dropping below absolute zero boundary limits
    if (amount < 0 && wallet.balance + amount < 0) {
      throw new Error("INSUFFICIENT_FUNDS");
    }

    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amount } },
    });

    await tx.coinTransaction.create({
      data: {
        walletId: wallet.id,
        amount,
        type: transactionType,
      },
    });

    return { success: true, newBalance: updatedWallet.balance };
  });
}
