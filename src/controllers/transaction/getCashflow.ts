import Transaction from "@/models/transaction.model";
import { UserDocument } from "@/models/user.model";
import { CustomError } from "@/types";
import { NextFunction, Request, Response } from "express";

type Duration = "week" | "year";

export const getCashflow = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as UserDocument;

    const duration = (req.query.duration || "week") as Duration;

    const allowedDurations = ["week", "year"];

    if (!allowedDurations.includes(duration)) {
      const error = new Error("Invalid duration") as CustomError;
      error.statusCode = 400;
      throw error;
    }

    const now = new Date();

    let startDate = new Date();

    let labels: string[] = [];

    // =========================================
    // WEEK
    // =========================================

    if (duration === "week") {
      const currentDay = now.getDay();

      const diff = currentDay === 0 ? -6 : 1 - currentDay;

      startDate.setDate(now.getDate() + diff);

      startDate.setHours(0, 0, 0, 0);

      labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    }

    // =========================================
    // YEAR
    // =========================================

    if (duration === "year") {
      startDate = new Date(now.getFullYear(), 0, 1);

      labels = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
    }

    const transactions = await Transaction.aggregate([
      {
        $match: {
          user: user._id,
          date: {
            $gte: startDate,
            $lte: now,
          },
        },
      },

      {
        $group: {
          _id: {
            type: "$type",

            bucket:
              duration === "week"
                ? {
                    $isoDayOfWeek: "$date",
                  }
                : {
                    $month: "$date",
                  },
          },

          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    // =========================================
    // EMPTY BUCKETS
    // =========================================

    const income = Array(labels.length).fill(0);

    const expense = Array(labels.length).fill(0);

    // =========================================
    // FILL BUCKETS
    // =========================================

    for (const transaction of transactions) {
      const type = transaction._id.type;

      let index = 0;

      if (duration === "week") {
        index = transaction._id.bucket - 1;
      }

      if (duration === "year") {
        index = transaction._id.bucket - 1;
      }

      if (type === "Income") {
        income[index] = transaction.total;
      }

      if (type === "Expense") {
        expense[index] = transaction.total;
      }
    }

    res.status(200).json({
      success: true,
      message: "Cashflow retrieved successfully",
      data: {
        duration,
        labels,
        income,
        expense,
      },
    });
  } catch (error) {
    next(error);
  }
};
