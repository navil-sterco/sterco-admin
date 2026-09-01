const { makeExecutableSchema } = require("@graphql-tools/schema");
const fs = require("fs");
const path = require("path");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const Portfolio = require("../models/Portfolio");
const Client = require("../models/Client");
const Testimonial = require("../models/Testimonial");

const UPLOAD_DIR = path.join(__dirname, "../uploads/portfolio");

const deleteImageFile = (imageUrl) => {
  if (!imageUrl) return;

  const filename = imageUrl.split("/uploads/portfolio/")[1];
  if (!filename) return;

  const filePath = path.join(UPLOAD_DIR, filename);

  if (!filePath.startsWith(UPLOAD_DIR)) return;

  fs.unlink(filePath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Failed to delete portfolio image:", filePath, err.message);
    }
  });
};

const typeDefs = `
type Testimonial {
    _id: ID!
    name: String!
    designation: String!
    imageUrl: String!
    videoUrl: String
    createdAt: String!
    updatedAt: String!
  }

  type TestimonialPage {
    items: [Testimonial!]!
    totalCount: Int!
    totalPages: Int!
    currentPage: Int!
  }

  input CreateTestimonialInput {
    name: String!
    designation: String!
    imageUrl: String!
    videoUrl: String
  }

  input UpdateTestimonialInput {
    name: String
    designation: String
    imageUrl: String
    videoUrl: String
  }

  type Client {
    _id: ID!
    name: String!
    imageUrl: String!
    createdAt: String!
    updatedAt: String!
  }

  type ClientPage {
    items: [Client!]!
    totalCount: Int!
    totalPages: Int!
    currentPage: Int!
  }

  input CreateClientInput {
    name: String!
    imageUrl: String!
  }

  input UpdateClientInput {
    name: String
    imageUrl: String
  }


  type SubCategory {
    _id: ID!
    name: String!
    isActive: Boolean!
    slug: String
    category: Category
    createdAt: String!
    updatedAt: String!
  }

  type Category {
    _id: ID!
    name: String!
    isActive: Boolean!
     imageUrl: String
     slug:String
    createdAt: String!
    updatedAt: String!
    portfolios: [Portfolio!]!
    subCategories: [SubCategory!]!
  }

  type Portfolio {
    _id: ID!
    imageUrl: String!
    category: Category
    subCategory: SubCategory
    createdBy: ID
    isFeatured: Boolean!
    order: Int!
    createdAt: String!
    updatedAt: String!
  }

  enum SortDirection {
    ASC
    DESC
  }

  type Query {
    testimonials(page: Int, limit: Int): TestimonialPage!
    testimonial(id: ID!): Testimonial
    clients(page: Int, limit: Int): ClientPage!
    client(id: ID!): Client
    categories: [Category!]!
    category(id: ID!): Category
    categoryBySlug(slug: String!): Category
    portfolios(isFeatured: Boolean, orderBy: SortDirection): [Portfolio!]!
    portfolio(id: ID!): Portfolio
    portfoliosByCategory(categoryId: ID!): [Portfolio!]!
    portfoliosByCategorySlug(slug: String!, subCategoryId: ID): [Portfolio!]!
    subCategories: [SubCategory!]!
    subCategory(id: ID!): SubCategory
    subCategoryBySlug(slug: String!): SubCategory
  }

  input CreateSubCategoryInput {
    name: String!
    isActive: Boolean
    categoryId: ID!
  }

  input UpdateSubCategoryInput {
    name: String
    isActive: Boolean
    categoryId: ID
  }

  input CreateCategoryInput {
    name: String!
    isActive: Boolean
    imageUrl: String
  }

  input UpdateCategoryInput {
    name: String
    isActive: Boolean
    imageUrl: String
  }

  input CreatePortfolioInput {
    imageUrl: String
    categoryId: ID!
    subCategoryId: ID
    isFeatured: Boolean
    order: Int
  }

  input UpdatePortfolioInput {
    imageUrl: String
    categoryId: ID
    subCategoryId: ID
    isFeatured: Boolean
    order: Int
  }

  type Mutation {
    createTestimonial(input: CreateTestimonialInput!): Testimonial!
    updateTestimonial(id: ID!, input: UpdateTestimonialInput!): Testimonial!
    deleteTestimonial(id: ID!): Boolean!


    createClient(input: CreateClientInput!): Client!
    updateClient(id: ID!, input: UpdateClientInput!): Client!
    deleteClient(id: ID!): Boolean!

    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!

    createPortfolio(input: CreatePortfolioInput!): Portfolio!
    updatePortfolio(id: ID!, input: UpdatePortfolioInput!): Portfolio!
    deletePortfolio(id: ID!): Boolean!

    createSubCategory(input: CreateSubCategoryInput!): SubCategory!
    updateSubCategory(id: ID!, input: UpdateSubCategoryInput!): SubCategory!
    deleteSubCategory(id: ID!): Boolean!
  }
`;

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const requireAdmin = (context) => {
  if (!context?.user) {
    const err = new Error("Not authenticated. Please log in.");
    err.statusCode = 401;
    throw err;
  }

  if (context.user.role !== "admin") {
    const err = new Error("You do not have permission to perform this action.");
    err.statusCode = 403;
    throw err;
  }
};

const toISOString = (value) => (value ? new Date(value).toISOString() : null);

const resolvers = {
  Testimonial: {
    createdAt: (parent) => toISOString(parent.createdAt),
    updatedAt: (parent) => toISOString(parent.updatedAt),
  },

  Client: {
    createdAt: (parent) => toISOString(parent.createdAt),
    updatedAt: (parent) => toISOString(parent.updatedAt),
  },

  SubCategory: {
    createdAt: (parent) => toISOString(parent.createdAt),
    updatedAt: (parent) => toISOString(parent.updatedAt),
    category: async (parent) => {
      return Category.findById(parent.category);
    },
  },

  Category: {
    createdAt: (parent) => toISOString(parent.createdAt),
    updatedAt: (parent) => toISOString(parent.updatedAt),
    portfolios: async (parent) => {
      return Portfolio.find({ category: parent._id }).sort({ createdAt: -1 });
    },
    subCategories: async (parent) => {
      return SubCategory.find({ category: parent._id }).sort({ createdAt: -1 });
    },
  },

  Portfolio: {
    createdAt: (parent) => toISOString(parent.createdAt),
    updatedAt: (parent) => toISOString(parent.updatedAt),
    category: async (parent) => {
      return Category.findById(parent.category);
    },
    subCategory: async (parent) => {
      if (!parent.subCategory) return null;
      return SubCategory.findById(parent.subCategory);
    },
  },

  Query: {
    testimonials: async (_, { page = 1, limit = 4 }) => {
      const safePage = Math.max(1, page);
      const safeLimit = Math.max(1, limit);
      const skip = (safePage - 1) * safeLimit;

      const [items, totalCount] = await Promise.all([
        Testimonial.find({})
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(safeLimit),
        Testimonial.countDocuments({}),
      ]);

      return {
        items,
        totalCount,
        totalPages: Math.ceil(totalCount / safeLimit),
        currentPage: safePage,
      };
    },
    testimonial: async (_, { id }) => {
      return Testimonial.findById(id);
    },

    clients: async (_, { page = 1, limit = 4 }) => {
      const safePage = Math.max(1, page);
      const safeLimit = Math.max(1, limit);
      const skip = (safePage - 1) * safeLimit;

      const [items, totalCount] = await Promise.all([
        Client.find({}).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
        Client.countDocuments({}),
      ]);

      return {
        items,
        totalCount,
        totalPages: Math.ceil(totalCount / safeLimit),
        currentPage: safePage,
      };
    },
    client: async (_, { id }) => {
      return Client.findById(id);
    },

    subCategories: async () => {
      return SubCategory.find({}).sort({ createdAt: -1 });
    },
    subCategory: async (_, { id }) => {
      return SubCategory.findById(id);
    },
    subCategoryBySlug: async (_, { slug }) => {
      return SubCategory.findOne({ slug });
    },

    categories: async () => {
      return Category.find({}).sort({ createdAt: -1 });
    },
    category: async (_, { id }) => {
      return Category.findById(id);
    },
    categoryBySlug: async (_, { slug }) => {
      return Category.findOne({ slug });
    },
    portfolios: async (_, { isFeatured, orderBy }) => {
      const query = {};
      if (isFeatured !== undefined) {
        query.isFeatured = isFeatured;
      }

      const sort = orderBy
        ? { order: orderBy === 'ASC' ? 1 : -1 }
        : { createdAt: -1 };
        
      return Portfolio.find(query).populate('category').sort(sort);
    },
    portfolio: async (_, { id }) => {
      return Portfolio.findById(id).populate("category");
    },
    portfoliosByCategory: async (_, { categoryId }) => {
      return Portfolio.find({ category: categoryId })
        .populate("category")
        .sort({ createdAt: -1 });
    },
    portfoliosByCategorySlug: async (_, { slug, subCategoryId }) => {
      const category = await Category.findOne({ slug });
      if (!category) {
        throw new Error("Category not found");
      }

      const query = { category: category._id };
      if (subCategoryId) {
        query.subCategory = subCategoryId;
      }

      return Portfolio.find(query).populate("category").sort({ createdAt: -1 });
    },
  },

  Mutation: {
    createTestimonial: async (_, { input }, context) => {
      requireAdmin(context);

      const testimonial = await Testimonial.create({
        name: input.name,
        designation: input.designation,
        imageUrl: input.imageUrl,
        videoUrl: input.videoUrl || "",
      });

      return testimonial;
    },

    updateTestimonial: async (_, { id, input }, context) => {
      requireAdmin(context);

      const existingTestimonial = await Testimonial.findById(id);
      if (!existingTestimonial) {
        throw new Error("Testimonial not found");
      }

      const nextName = input.name ?? existingTestimonial.name;
      const nextDesignation =
        input.designation ?? existingTestimonial.designation;
      const nextImageUrl = input.imageUrl ?? existingTestimonial.imageUrl;
      const nextVideoUrl =
        input.videoUrl !== undefined
          ? input.videoUrl
          : existingTestimonial.videoUrl;

      const testimonial = await Testimonial.findByIdAndUpdate(
        id,
        {
          name: nextName,
          designation: nextDesignation,
          imageUrl: nextImageUrl,
          videoUrl: nextVideoUrl,
        },
        { new: true, runValidators: true },
      );

      if (
        input.imageUrl !== undefined &&
        input.imageUrl !== existingTestimonial.imageUrl &&
        existingTestimonial.imageUrl
      ) {
        deleteImageFile(existingTestimonial.imageUrl);
      }

      return testimonial;
    },

    deleteTestimonial: async (_, { id }, context) => {
      requireAdmin(context);

      const testimonial = await Testimonial.findById(id);
      if (!testimonial) {
        return false;
      }

      await testimonial.deleteOne();
      deleteImageFile(testimonial.imageUrl);

      return true;
    },

    createClient: async (_, { input }, context) => {
      requireAdmin(context);

      const client = await Client.create({
        name: input.name,
        imageUrl: input.imageUrl,
      });

      return client;
    },

    updateClient: async (_, { id, input }, context) => {
      requireAdmin(context);

      const existingClient = await Client.findById(id);
      if (!existingClient) {
        throw new Error("Client not found");
      }

      const nextName = input.name ?? existingClient.name;
      const nextImageUrl = input.imageUrl ?? existingClient.imageUrl;

      const client = await Client.findByIdAndUpdate(
        id,
        { name: nextName, imageUrl: nextImageUrl },
        { new: true, runValidators: true },
      );

      // Clean up old file if the image was replaced
      if (
        input.imageUrl !== undefined &&
        input.imageUrl !== existingClient.imageUrl &&
        existingClient.imageUrl
      ) {
        deleteImageFile(existingClient.imageUrl);
      }

      return client;
    },

    deleteClient: async (_, { id }, context) => {
      requireAdmin(context);

      const client = await Client.findById(id);
      if (!client) {
        return false;
      }

      await client.deleteOne();
      deleteImageFile(client.imageUrl);

      return true;
    },

    createSubCategory: async (_, { input }, context) => {
      requireAdmin(context);

      const categoryExists = await Category.findById(input.categoryId);
      if (!categoryExists) {
        throw new Error("Category not found");
      }

      try {
        const subCategory = await SubCategory.create({
          name: input.name,
          isActive: input.isActive ?? true,
          category: input.categoryId,
          slug: slugify(input.name),
        });

        return subCategory;
      } catch (err) {
        if (err.code === 11000) {
          throw new Error("A sub-category with this name already exists");
        }
        throw err;
      }
    },

    updateSubCategory: async (_, { id, input }, context) => {
      requireAdmin(context);

      const existingSubCategory = await SubCategory.findById(id);
      if (!existingSubCategory) {
        throw new Error("Sub Category not found");
      }

      if (input.categoryId) {
        const categoryExists = await Category.findById(input.categoryId);
        if (!categoryExists) {
          throw new Error("Category not found");
        }
      }

      const nextName = input.name ?? existingSubCategory.name;
      const nextIsActive = input.isActive ?? existingSubCategory.isActive;
      const nextCategoryId = input.categoryId ?? existingSubCategory.category;

      try {
        const subCategory = await SubCategory.findByIdAndUpdate(
          id,
          {
            name: nextName,
            isActive: nextIsActive,
            category: nextCategoryId,
            slug: slugify(nextName),
          },
          { new: true, runValidators: true },
        );

        return subCategory;
      } catch (err) {
        if (err.code === 11000) {
          throw new Error("A sub-category with this name already exists");
        }
        throw err;
      }
    },

    deleteSubCategory: async (_, { id }, context) => {
      requireAdmin(context);

      const subCategory = await SubCategory.findById(id);
      if (!subCategory) {
        return false;
      }

      await subCategory.deleteOne();
      return true;
    },

    createCategory: async (_, { input }, context) => {
      requireAdmin(context);

      const category = await Category.create({
        name: input.name,
        isActive: input.isActive ?? true,
        imageUrl: input.imageUrl || "",
      });

      return category;
    },

    updateCategory: async (_, { id, input }, context) => {
      requireAdmin(context);

      const existingCategory = await Category.findById(id);
      if (!existingCategory) {
        throw new Error("Category not found");
      }

      const nextName = input.name ?? existingCategory.name;
      const nextIsActive = input.isActive ?? existingCategory.isActive;
      const nextImageUrl =
        input.imageUrl !== undefined
          ? input.imageUrl
          : existingCategory.imageUrl;

      const category = await Category.findByIdAndUpdate(
        id,
        {
          name: nextName,
          isActive: nextIsActive,
          imageUrl: nextImageUrl,
          slug: nextName
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, ""),
        },
        { new: true, runValidators: true },
      );

      return category;
    },

    deleteCategory: async (_, { id }, context) => {
      requireAdmin(context);

      const category = await Category.findById(id);
      if (!category) {
        return false;
      }

      const portfoliosToDelete = await Portfolio.find(
        { category: id },
        "imageUrl",
      );
      await Portfolio.deleteMany({ category: id });
      portfoliosToDelete.forEach((p) => deleteImageFile(p.imageUrl));

      await category.deleteOne();
      return true;
    },

    createPortfolio: async (_, { input }, context) => {
      requireAdmin(context);
      const { user } = context;

      const categoryExists = await Category.findById(input.categoryId);
      if (!categoryExists) {
        throw new Error("Category not found");
      }

      if (input.subCategoryId) {
        const subCategoryExists = await SubCategory.findOne({
          _id: input.subCategoryId,
          category: input.categoryId,
        });
        if (!subCategoryExists) {
          throw new Error("Sub Category not found under this category");
        }
      }

      const portfolio = await Portfolio.create({
        imageUrl: input.imageUrl || "",
        category: input.categoryId,
        subCategory: input.subCategoryId || null,
        order: input.order ?? 0,
        createdBy: user?._id || null,
      });

      return Portfolio.findById(portfolio._id).populate("category");
    },

    updatePortfolio: async (_, { id, input }, context) => {
      requireAdmin(context);

      const existingPortfolio = await Portfolio.findById(id);
      if (!existingPortfolio) {
        throw new Error("Portfolio not found");
      }

      const nextCategoryId = input.categoryId || existingPortfolio.category;

      if (input.categoryId) {
        const categoryExists = await Category.findById(input.categoryId);
        if (!categoryExists) {
          throw new Error("Category not found");
        }
      }

      if (input.subCategoryId) {
        const subCategoryExists = await SubCategory.findOne({
          _id: input.subCategoryId,
          category: nextCategoryId,
        });
        if (!subCategoryExists) {
          throw new Error("Sub Category not found under this category");
        }
      }

      const portfolio = await Portfolio.findByIdAndUpdate(
        id,
        {
          ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
          ...(input.categoryId ? { category: input.categoryId } : {}),
          ...(input.subCategoryId !== undefined
            ? { subCategory: input.subCategoryId || null }
            : {}),
          ...(input.isFeatured !== undefined ? { isFeatured: input.isFeatured } : {}),
          ...(input.order !== undefined ? { order: input.order } : {}),
        },
        { new: true, runValidators: true },
      );

      if (!portfolio) {
        throw new Error("Portfolio not found");
      }

      // If the image was replaced with a different one, remove the old file.
      if (
        input.imageUrl !== undefined &&
        input.imageUrl !== existingPortfolio.imageUrl &&
        existingPortfolio.imageUrl
      ) {
        deleteImageFile(existingPortfolio.imageUrl);
      }

      return Portfolio.findById(portfolio._id).populate("category");
    },

    deletePortfolio: async (_, { id }, context) => {
      requireAdmin(context);

      const portfolio = await Portfolio.findById(id);
      if (!portfolio) {
        return false;
      }

      await portfolio.deleteOne();
      deleteImageFile(portfolio.imageUrl);

      return true;
    },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

module.exports = { typeDefs, resolvers, schema };
