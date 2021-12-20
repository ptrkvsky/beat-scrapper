import { PrismaClient } from "@prisma/client";
import { getCover } from "./getCover";
import { setTimeout } from "timers/promises";

const prisma = new PrismaClient();

export async function updateGame(game) {
  await setTimeout(5000);
  const cover = await getCover(game);

  if (cover) {
    const gameUpdated = await prisma.game.update({
      where: {
        id: game.id,
      },
      data: {
        cover,
      },
    });
    return gameUpdated;
  }
  return false;
}
