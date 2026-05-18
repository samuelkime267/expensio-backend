import {
  getCategories,
  addCategory,
  addDefaultCategories,
  deleteCategory,
  updateCategory,
  getCategory,
} from "@/controllers/category";
import { isAuthenticated } from "@/middleware";
import { categoryValidator } from "@/validators/category.validator";

import { Router } from "express";

const categoryRouter = Router();

categoryRouter.get("/", isAuthenticated, getCategories);
categoryRouter.get("/:id", isAuthenticated, getCategory);
categoryRouter.post("/", isAuthenticated, categoryValidator, addCategory);
categoryRouter.post("/default", isAuthenticated, addDefaultCategories);
categoryRouter.delete("/:id", isAuthenticated, deleteCategory);
categoryRouter.put("/:id", isAuthenticated, categoryValidator, updateCategory);

export default categoryRouter;
