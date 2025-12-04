import { db, tables, eq } from "@lbf-bot/database";

export const getAccountBalance = async (playerId: string): Promise<number> => {
  const account = await db.query.accounts.findFirst({
    where: eq(tables.accounts.playerId, playerId),
  });

  if (account) return account.balance;

  await db.insert(tables.accounts).values({
    playerId,
    balance: 0,
  });

  return 0;
};

export const setAccountBalance = async (
  playerId: string,
  balance: number,
): Promise<void> => {
  await db
    .insert(tables.accounts)
    .values({
      playerId,
      balance,
    })
    .onConflictDoUpdate({
      target: tables.accounts.playerId,
      set: { balance, updatedAt: new Date() },
    });
};
