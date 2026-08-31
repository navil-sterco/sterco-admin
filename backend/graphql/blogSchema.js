const { makeExecutableSchema } = require('@graphql-tools/schema');
const path = require('path');
const fs = require('fs');
const Blog = require('../models/Blog');

const UPLOAD_DIR = path.join(__dirname, '../uploads/blog');

const deleteImageFile = (imageUrl) => {
  if (!imageUrl) return;

  const filename = imageUrl.split('/uploads/blog/')[1];
  if (!filename) return;

  const filePath = path.join(UPLOAD_DIR, filename);

  if (!filePath.startsWith(UPLOAD_DIR)) return;

  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Failed to delete blog image:', filePath, err.message);
    }
  });
};

const typeDefs = `
  type Blog {
    _id: ID!
    title: String!
    slug: String!
    imageUrl: String!
    excerpt: String
    content: String!
    author: String
    category: String
    status: Boolean!
    date: String!
    createdAt: String!
    updatedAt: String!
  }

  type BlogPage {
    items: [Blog!]!
    totalCount: Int!
    totalPages: Int!
    currentPage: Int!
  }

  input CreateBlogInput {
    title: String!
    slug: String!
    imageUrl: String!
    excerpt: String
    content: String!
    author: String
    category: String
    status: Boolean
    date: String!
  }

  input UpdateBlogInput {
    title: String
    slug: String
    imageUrl: String
    excerpt: String
    content: String
    author: String
    category: String
    status: Boolean
    date: String
  }

  type Query {
    blogList(page: Int, limit: Int): BlogPage!
    blog(id: ID!): Blog
    blogBySlug(slug: String!): Blog
  }

  type Mutation {
    createBlog(input: CreateBlogInput!): Blog!
    updateBlog(id: ID!, input: UpdateBlogInput!): Blog!
    deleteBlog(id: ID!): Boolean!
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
  Blog: {
    createdAt: (parent) => toISOString(parent.createdAt),
    updatedAt: (parent) => toISOString(parent.updatedAt),
    date: (parent) => toISOString(parent.date),
  },

  Query: {
    blogList: async (_, { page = 1, limit = 12 }) => {
      const safePage = Math.max(1, page);
      const safeLimit = Math.max(1, limit);
      const skip = (safePage - 1) * safeLimit;

      const [items, totalCount] = await Promise.all([
        Blog.find({}).sort({ date: -1 }).skip(skip).limit(safeLimit),
        Blog.countDocuments({}),
      ]);

      return {
        items,
        totalCount,
        totalPages: Math.ceil(totalCount / safeLimit),
        currentPage: safePage,
      };
    },
    blog: async (_, { id }) => {
      return Blog.findById(id);
    },
    blogBySlug: async (_, { slug }) => {
      return Blog.findOne({ slug });
    },
  },

  Mutation: {
    createBlog: async (_, { input }, context) => {
      requireAdmin(context);

      const blog = await Blog.create({
        title: input.title,
        slug: input.slug,
        imageUrl: input.imageUrl,
        excerpt: input.excerpt,
        content: input.content,
        author: input.author,
        category: input.category,
        status: input.status ?? true,
        date: input.date,
      });

      return blog;
    },

    updateBlog: async (_, { id, input }, context) => {
      requireAdmin(context);

      const existingBlog = await Blog.findById(id);
      if (!existingBlog) {
        throw new Error('Blog not found');
      }

      const nextTitle = input.title ?? existingBlog.title;
      const nextSlug = input.slug ?? existingBlog.slug;
      const nextImageUrl = input.imageUrl ?? existingBlog.imageUrl;
      const nextExcerpt = input.excerpt ?? existingBlog.excerpt;
      const nextContent = input.content ?? existingBlog.content;
      const nextAuthor = input.author ?? existingBlog.author;
      const nextCategory = input.category ?? existingBlog.category;
      const nextStatus = input.status ?? existingBlog.status;
      const nextDate = input.date ?? existingBlog.date;

      const blog = await Blog.findByIdAndUpdate(
        id,
        {
          title: nextTitle,
          slug: nextSlug,
          imageUrl: nextImageUrl,
          excerpt: nextExcerpt,
          content: nextContent,
          author: nextAuthor,
          category: nextCategory,
          status: nextStatus,
          date: nextDate,
        },
        { new: true, runValidators: true }
      );

      if (
        input.imageUrl !== undefined &&
        input.imageUrl !== existingBlog.imageUrl &&
        existingBlog.imageUrl
      ) {
        deleteImageFile(existingBlog.imageUrl);
      }

      return blog;
    },

    deleteBlog: async (_, { id }, context) => {
      requireAdmin(context);

      const blog = await Blog.findById(id);
      if (!blog) {
        return false;
      }

      await blog.deleteOne();
      deleteImageFile(blog.imageUrl);

      return true;
    },
  },
};

const blogSchema = makeExecutableSchema({ typeDefs, resolvers });

module.exports = { blogSchema };