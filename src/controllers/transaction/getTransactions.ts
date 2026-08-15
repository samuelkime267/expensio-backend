import Transaction from "@/models/transaction.model";
import { UserDocument } from "@/models/user.model";
import { paginate } from "@/utils";
import { NextFunction, Request, Response } from "express";

export const getTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as UserDocument;

    const type = req.query.type;
    const startDate = Number(req.query.startDate) || 0;
    const endDate = Number(req.query.endDate) || Date.now();
    const count = Number(req.query.count) || 20;
    const page = Number(req.query.page) || 1;
    const search = req.query.search;
    const category = req.query.category;
    const minAmount = Number(req.query.minAmount);
    const maxAmount = Number(req.query.maxAmount);
    const sort: Record<string, 1 | -1> =
      req.query.sort === "asc" ? { date: 1 } : { date: -1 };

    const filter = {
      user: user._id,
      ...(type && { type }),
      ...(search && { name: { $regex: search, $options: "i" } }),
      ...(category && { "category.value": category }),
      ...(minAmount && { "amount.$gte": minAmount }),
      ...(maxAmount && { "amount.$lte": maxAmount }),
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    const { data: transactions, pagination } = await paginate({
      model: Transaction,
      filter,
      page,
      count,
      sort,
    });

    res.status(200).json({
      success: true,
      message: "Transactions retrieved successfully",
      data: {
        transactions,
        pagination,
      },
    });
  } catch (error) {
    next(error);
  }
};
