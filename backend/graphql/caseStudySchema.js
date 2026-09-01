const { makeExecutableSchema } = require('@graphql-tools/schema');
const path = require('path');
const fs = require('fs');
const CaseStudy = require('../models/CaseStudy');

const UPLOAD_DIR = path.join(__dirname, '../uploads/portfolio');

const deleteImageFile = (imageUrl) => {
  if (!imageUrl) return;

  const filename = imageUrl.split('/uploads/portfolio/')[1];
  if (!filename) return;

  const filePath = path.join(UPLOAD_DIR, filename);

  if (!filePath.startsWith(UPLOAD_DIR)) return;

  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Failed to delete case study image:', filePath, err.message);
    }
  });
};

const typeDefs = `
  type CaseStudy {
    _id: ID!
    title: String!
    thumbnailImage: String!
    logoImage: String!
    date: String!
    htmlContent: String!
    slug: String!
    createdAt: String!
    updatedAt: String!
  }

  type CaseStudyPage {
    items: [CaseStudy!]!
    totalCount: Int!
    totalPages: Int!
    currentPage: Int!
  }

  input CreateCaseStudyInput {
    title: String!
    thumbnailImage: String!
    logoImage: String!
    date: String!
    htmlContent: String!
  }

  input UpdateCaseStudyInput {
    title: String
    thumbnailImage: String
    logoImage: String
    date: String
    htmlContent: String
  }

  type Query {
    caseStudies(page: Int, limit: Int): CaseStudyPage!
    caseStudy(id: ID!): CaseStudy
    caseStudyBySlug(slug: String!): CaseStudy
  }

  type Mutation {
    createCaseStudy(input: CreateCaseStudyInput!): CaseStudy!
    updateCaseStudy(id: ID!, input: UpdateCaseStudyInput!): CaseStudy!
    deleteCaseStudy(id: ID!): Boolean!
  }
`;

const slugify = (value) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

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
  CaseStudy: {
    createdAt: (parent) => toISOString(parent.createdAt),
    updatedAt: (parent) => toISOString(parent.updatedAt),
    date: (parent) => toISOString(parent.date),
  },

  Query: {
    caseStudies: async (_, { page = 1, limit = 12 }) => {
      const safePage = Math.max(1, page);
      const safeLimit = Math.max(1, limit);
      const skip = (safePage - 1) * safeLimit;

      const [items, totalCount] = await Promise.all([
        CaseStudy.find({}).sort({ date: -1 }).skip(skip).limit(safeLimit),
        CaseStudy.countDocuments({}),
      ]);

      return {
        items,
        totalCount,
        totalPages: Math.ceil(totalCount / safeLimit),
        currentPage: safePage,
      };
    },
    caseStudy: async (_, { id }) => {
      return CaseStudy.findById(id);
    },
    caseStudyBySlug: async (_, { slug }) => {
      return CaseStudy.findOne({ slug });
    },
  },

  Mutation: {
    createCaseStudy: async (_, { input }, context) => {
      requireAdmin(context);

      const caseStudy = await CaseStudy.create({
        title: input.title,
        thumbnailImage: input.thumbnailImage,
        logoImage: input.logoImage,
        date: input.date,
        htmlContent: input.htmlContent,
        slug: slugify(input.title),
      });

      return caseStudy;
    },

    updateCaseStudy: async (_, { id, input }, context) => {
      requireAdmin(context);

      const existingCaseStudy = await CaseStudy.findById(id);
      if (!existingCaseStudy) {
        throw new Error('Case study not found');
      }

      const nextTitle = input.title ?? existingCaseStudy.title;
      const nextThumbnail = input.thumbnailImage ?? existingCaseStudy.thumbnailImage;
      const nextLogo = input.logoImage ?? existingCaseStudy.logoImage;
      const nextDate = input.date ?? existingCaseStudy.date;
      const nextHtml = input.htmlContent ?? existingCaseStudy.htmlContent;

      const caseStudy = await CaseStudy.findByIdAndUpdate(
        id,
        {
          title: nextTitle,
          thumbnailImage: nextThumbnail,
          logoImage: nextLogo,
          date: nextDate,
          htmlContent: nextHtml,
          slug: slugify(nextTitle),
        },
        { new: true, runValidators: true }
      );

      if (
        input.thumbnailImage !== undefined &&
        input.thumbnailImage !== existingCaseStudy.thumbnailImage &&
        existingCaseStudy.thumbnailImage
      ) {
        deleteImageFile(existingCaseStudy.thumbnailImage);
      }
      if (
        input.logoImage !== undefined &&
        input.logoImage !== existingCaseStudy.logoImage &&
        existingCaseStudy.logoImage
      ) {
        deleteImageFile(existingCaseStudy.logoImage);
      }

      return caseStudy;
    },

    deleteCaseStudy: async (_, { id }, context) => {
      requireAdmin(context);

      const caseStudy = await CaseStudy.findById(id);
      if (!caseStudy) {
        return false;
      }

      await caseStudy.deleteOne();
      deleteImageFile(caseStudy.thumbnailImage);
      deleteImageFile(caseStudy.logoImage);

      return true;
    },
  },
};

const caseStudySchema = makeExecutableSchema({ typeDefs, resolvers });

module.exports = { caseStudySchema };