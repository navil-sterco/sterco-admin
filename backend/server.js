require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { graphqlHTTP } = require('express-graphql');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const errorHandler = require('./middleware/errorHandler');
const { schema } = require('./graphql/schema');
const { buildGraphQLContext } = require('./graphql/context');
const { newsSchema } = require('./graphql/newsSchema');
const { blogSchema } = require('./graphql/blogSchema');
const {caseStudySchema} = require('./graphql/caseStudySchema');

connectDB();

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS origin not allowed'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

app.use(
  '/api/portfolio',
  graphqlHTTP(async (req, res, params) => {
    const context = await buildGraphQLContext({ req, res, params });

    return {
      schema,
      graphiql: process.env.NODE_ENV !== 'production',
      context,
      customFormatErrorFn: (error) => ({
        message: error.message,
        locations: error.locations,
        path: error.path,
      }),
    };
  })
);

app.use(
  '/api/news',
  graphqlHTTP(async (req, res, params) => {
    const context = await buildGraphQLContext({ req, res, params });

    return {
      schema: newsSchema,
      graphiql: process.env.NODE_ENV !== 'production',
      context,
      customFormatErrorFn: (error) => ({
        message: error.message,
        locations: error.locations,
        path: error.path,
      }),
    };
  })
);

app.use(
  '/api/blogs',
  graphqlHTTP(async (req, res, params) => {
    const context = await buildGraphQLContext({ req, res, params });

    return {
      schema: blogSchema,
      graphiql: process.env.NODE_ENV !== 'production',
      context,
      customFormatErrorFn: (error) => ({
        message: error.message,
        locations: error.locations,
        path: error.path,
      }),
    };
  })
);

app.use(
  '/api/case-studies',
  graphqlHTTP(async (req, res, params) => {
    const context = await buildGraphQLContext({ req, res, params });

    return {
      schema: caseStudySchema,
      graphiql: process.env.NODE_ENV !== 'production',
      context,
      customFormatErrorFn: (error) => ({
        message: error.message,
        locations: error.locations,
        path: error.path,
      }),
    };
  })
);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
