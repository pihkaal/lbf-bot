import { readFile, writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";

const ACCOUNTS_FILE = "./.cache/accounts.json";

export const initAccounts = async (): Promise<void> => {
  try {
    await access(ACCOUNTS_FILE, constants.F_OK);
  } catch {
    await writeFile(ACCOUNTS_FILE, "{}");
  }
};

export const getAccountBalance = async (playerId: string): Promise<number> => {
  const content = await readFile(ACCOUNTS_FILE, "utf-8");
  const accounts: Record<string, number> = JSON.parse(content);
  if (accounts[playerId]) return accounts[playerId];

  accounts[playerId] = 0;
  await writeFile(ACCOUNTS_FILE, JSON.stringify(accounts));

  return 0;
};

export const setAccountBalance = async (
  playerId: string,
  balance: number,
): Promise<void> => {
  const content = await readFile(ACCOUNTS_FILE, "utf-8");
  const accounts: Record<string, number> = JSON.parse(content);
  accounts[playerId] = balance;

  await writeFile(ACCOUNTS_FILE, JSON.stringify(accounts));
};
