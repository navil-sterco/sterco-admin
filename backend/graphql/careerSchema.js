const { makeExecutableSchema } = require('@graphql-tools/schema');
const Career = require('../models/Career');

const typeDefs = `
  type Career {
    _id: ID!
    title: String!
    experience: String
    industry: String
    joining: String
    responsibilities: String
    requirements: String
    slug: String!
    createdAt: String!
    updatedAt: String!
  }

  type CareerPage {
    items: [Career!]!
    totalCount: Int!
    totalPages: Int!
    currentPage: Int!
  }

  input CreateCareerInput {
    title: String!
    experience: String
    industry: String
    joining: String
    responsibilities: String
    requirements: String
  }

  input UpdateCareerInput {
    title: String
    experience: String
    industry: String
    joining: String
    responsibilities: String
    requirements: String
  }

  type Query {
    careers(page: Int, limit: Int): CareerPage!
    career(id: ID!): Career
    careerBySlug(slug: String!): Career
  }

  type Mutation {
    createCareer(input: CreateCareerInput!): Career!
    updateCareer(id: ID!, input: UpdateCareerInput!): Career!
    deleteCareer(id: ID!): Boolean!
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
  Career: {
    createdAt: (parent) => toISOString(parent.createdAt),
    updatedAt: (parent) => toISOString(parent.updatedAt),
  },

  Query: {
    careers: async (_, { page = 1, limit = 12 }) => {
      const safePage = Math.max(1, page);
      const safeLimit = Math.max(1, limit);
      const skip = (safePage - 1) * safeLimit;

      const [items, totalCount] = await Promise.all([
        Career.find({}).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
        Career.countDocuments({}),
      ]);

      return {
        items,
        totalCount,
        totalPages: Math.ceil(totalCount / safeLimit),
        currentPage: safePage,
      };
    },
    career: async (_, { id }) => {
      return Career.findById(id);
    },
    careerBySlug: async (_, { slug }) => {
      return Career.findOne({ slug });
    },
  },

  Mutation: {
    createCareer: async (_, { input }, context) => {
      requireAdmin(context);

      try {
        const career = await Career.create({
          title: input.title,
          experience: input.experience || '',
          industry: input.industry || '',
          joining: input.joining || '',
          responsibilities: input.responsibilities || '',
          requirements: input.requirements || '',
          slug: slugify(input.title),
        });

        return career;
      } catch (err) {
        if (err.code === 11000) {
          throw new Error('A career with this title already exists');
        }
        throw err;
      }
    },

    updateCareer: async (_, { id, input }, context) => {
      requireAdmin(context);

      const existingCareer = await Career.findById(id);
      if (!existingCareer) {
        throw new Error('Career not found');
      }

      const nextTitle = input.title ?? existingCareer.title;

      try {
        const career = await Career.findByIdAndUpdate(
          id,
          {
            title: nextTitle,
            experience: input.experience ?? existingCareer.experience,
            industry: input.industry ?? existingCareer.industry,
            joining: input.joining ?? existingCareer.joining,
            responsibilities: input.responsibilities ?? existingCareer.responsibilities,
            requirements: input.requirements ?? existingCareer.requirements,
            slug: slugify(nextTitle),
          },
          { new: true, runValidators: true }
        );

        return career;
      } catch (err) {
        if (err.code === 11000) {
          throw new Error('A career with this title already exists');
        }
        throw err;
      }
    },

    deleteCareer: async (_, { id }, context) => {
      requireAdmin(context);

      const career = await Career.findById(id);
      if (!career) {
        return false;
      }

      await career.deleteOne();
      return true;
    },
  },
};

const careerSchema = makeExecutableSchema({ typeDefs, resolvers });

module.exports = { careerSchema };