import type { Trade } from "./types";
import type { ITrade } from "@/models/trade.model";

export function mapTradeToClient(trade: ITrade | Record<string, unknown>): Trade {
  const doc = trade as ITrade & { _id: { toString(): string } };
  return {
    id: doc._id.toString(),
    pair: doc.pair,
    type: doc.type,
    entryPrice: doc.entryPrice,
    exitPrice: doc.exitPrice,
    stopLoss: doc.stopLoss,
    takeProfit: doc.takeProfit,
    lotSize: doc.lotSize,
    riskPercent: doc.riskPercent,
    result: doc.result,
    profitLoss: doc.profitLoss,
    dateTime: new Date(doc.dateTime).toISOString(),
    session: doc.session,
    notes: doc.notes ?? "",
    strategy: doc.strategy ?? "",
    mistakes: doc.mistakes ?? [],
    tags: doc.tags ?? [],
    chartScreenshot: doc.chartScreenshot,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}
