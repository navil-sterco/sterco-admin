const { makeExecutableSchema } = require('@graphql-tools/schema');
const path = require('path');
const fs = require('fs');
const News = require('../models/News');

const UPLOAD_DIR = path.join(__dirname, '../uploads/portfolio');

const deleteImageFile = (imageUrl) => {
  if (!imageUrl) return;

  const filename = imageUrl.split('/uploads/portfolio/')[1];
  if (!filename) return;

  const filePath = path.join(UPLOAD_DIR, filename);

  if (!filePath.startsWith(UPLOAD_DIR)) return;

  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Failed to delete news image:', filePath, err.message);
    }
  });
};

const typeDefs = `
  type News {
    _id: ID!
    title: String!
    description: String!
    imageUrl: String!
    date: String!
    createdAt: String!
    updatedAt: String!
  }

  type NewsPage {
    items: [News!]!
    totalCount: Int!
    totalPages: Int!
    currentPage: Int!
  }

  input CreateNewsInput {
    title: String!
    description: String!
    imageUrl: String!
    date: String!
  }

  input UpdateNewsInput {
    title: String
    description: String
    imageUrl: String
    date: String
  }

  type Query {
    newsList(page: Int, limit: Int): NewsPage!
    news(id: ID!): News
  }

  type Mutation {
    createNews(input: CreateNewsInput!): News!
    updateNews(id: ID!, input: UpdateNewsInput!): News!
    deleteNews(id: ID!): Boolean!
  }
`;

const requireAdmin = (context) => {
  if (!context?.user) {
    const err = new Error('Not authenticated. Please log in.');
    err.statusCode = 401;
    throw err;
  }

  if (context.user.role !== 'admin') {
    const err = new Error('You do not have permission to perform this action.');
    err.statusCode = 403;
    throw err;
  }
};

const toISOString = (value) => (value ? new Date(value).toISOString() : null);

const resolvers = {
  News: {
    createdAt: (parent) => toISOString(parent.createdAt),
    updatedAt: (parent) => toISOString(parent.updatedAt),
    date: (parent) => toISOString(parent.date),
  },

  Query: {
    newsList: async (_, { page = 1, limit = 12 }) => {
      const safePage = Math.max(1, page);
      const safeLimit = Math.max(1, limit);
      const skip = (safePage - 1) * safeLimit;

      const [items, totalCount] = await Promise.all([
        News.find({}).sort({ date: -1 }).skip(skip).limit(safeLimit),
        News.countDocuments({}),
      ]);

      return {
        items,
        totalCount,
        totalPages: Math.ceil(totalCount / safeLimit),
        currentPage: safePage,
      };
    },
    news: async (_, { id }) => {
      return News.findById(id);
    },
  },

  Mutation: {
    createNews: async (_, { input }, context) => {
      requireAdmin(context);

      const news = await News.create({
        title: input.title,
        description: input.description,
        imageUrl: input.imageUrl,
        date: input.date,
      });

      return news;
    },

    updateNews: async (_, { id, input }, context) => {
      requireAdmin(context);

      const existingNews = await News.findById(id);
      if (!existingNews) {
        throw new Error('News not found');
      }

      const nextTitle = input.title ?? existingNews.title;
      const nextDescription = input.description ?? existingNews.description;
      const nextImageUrl = input.imageUrl ?? existingNews.imageUrl;
      const nextDate = input.date ?? existingNews.date;

      const news = await News.findByIdAndUpdate(
        id,
        {
          title: nextTitle,
          description: nextDescription,
          imageUrl: nextImageUrl,
          date: nextDate,
        },
        { new: true, runValidators: true }
      );

      if (
        input.imageUrl !== undefined &&
        input.imageUrl !== existingNews.imageUrl &&
        existingNews.imageUrl
      ) {
        deleteImageFile(existingNews.imageUrl);
      }

      return news;
    },

    deleteNews: async (_, { id }, context) => {
      requireAdmin(context);

      const news = await News.findById(id);
      if (!news) {
        return false;
      }

      await news.deleteOne();
      deleteImageFile(news.imageUrl);

      return true;
    },
  },
};

const newsSchema = makeExecutableSchema({ typeDefs, resolvers });

module.exports = { newsSchema };