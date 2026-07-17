import { MONGO_URL } from "@/config/env";
import Category from "@/models/category.model";
import mongoose from "mongoose";

async function categoryMigration() {
  console.log("Starting category migration...");
  await mongoose.connect(MONGO_URL);
  console.log("Connected to MongoDB");

  console.log("Getting transactions...");
  const transactionsCollection = mongoose.connection.collection("transactions");
  const transactions = await transactionsCollection.find().toArray();
  console.log(`Found ${transactions.length} transactions`);

  console.log("Migrating transactions...");
  for (const tx of transactions) {
    if (typeof tx.category !== "string") continue;

    const category = await Category.findOne({
      value: tx.category,
      isIncome: tx.type === "Income",
    });

    if (!category) {
      console.log(
        `Category not found: ${tx.category} for transaction ${tx._id}`,
      );
      continue;
    }

    await transactionsCollection.updateOne(
      {
        _id: tx._id,
      },
      {
        $set: {
          category: {
            id: category._id,
            name: category.name,
            value: category.value,
          },
        },
      },
    );

    console.log(`Migrated transaction ${tx._id}`);
  }

  await mongoose.disconnect();
  console.log("Migration complete");
  process.exit(0);
}

categoryMigration();
