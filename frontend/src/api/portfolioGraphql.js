import { urlFromBase } from '../config';

const GRAPHQL_URL = urlFromBase('/portfolio');

export async function graphqlRequest(query, variables = {}) {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();

  if (!response.ok || json.errors) {
    const message = json.errors?.[0]?.message || 'GraphQL request failed';

    if (message.toLowerCase().includes('not authenticated')) {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    throw new Error(message);
  }

  return json.data;
}


export const GET_TESTIMONIALS = `
  query GetTestimonials($page: Int, $limit: Int) {
    testimonials(page: $page, limit: $limit) {
      items {
        _id
        name
        designation
        imageUrl
        videoUrl
        createdAt
        updatedAt
      }
      totalCount
      totalPages
      currentPage
    }
  }
`;

export const CREATE_TESTIMONIAL = `
  mutation CreateTestimonial($input: CreateTestimonialInput!) {
    createTestimonial(input: $input) {
      _id
      name
      designation
      imageUrl
      videoUrl
    }
  }
`;

export const UPDATE_TESTIMONIAL = `
  mutation UpdateTestimonial($id: ID!, $input: UpdateTestimonialInput!) {
    updateTestimonial(id: $id, input: $input) {
      _id
      name
      designation
      imageUrl
      videoUrl
    }
  }
`;

export const DELETE_TESTIMONIAL = `
  mutation DeleteTestimonial($id: ID!) {
    deleteTestimonial(id: $id)
  }
`;


export const GET_CLIENTS = `
  query GetClients($page: Int, $limit: Int) {
    clients(page: $page, limit: $limit) {
      items {
        _id
        name
        imageUrl
        createdAt
        updatedAt
      }
      totalCount
      totalPages
      currentPage
    }
  }
`;

export const CREATE_CLIENT = `
  mutation CreateClient($input: CreateClientInput!) {
    createClient(input: $input) {
      _id
      name
      imageUrl
    }
  }
`;

export const UPDATE_CLIENT = `
  mutation UpdateClient($id: ID!, $input: UpdateClientInput!) {
    updateClient(id: $id, input: $input) {
      _id
      name
      imageUrl
    }
  }
`;

export const DELETE_CLIENT = `
  mutation DeleteClient($id: ID!) {
    deleteClient(id: $id)
  }
`;

export const GET_SUB_CATEGORIES = `
  query GetSubCategories {
    subCategories {
      _id
      name
      isActive
      slug
      category {
        _id
        name
        slug
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_SUB_CATEGORY = `
  query GetSubCategory($id: ID!) {
    subCategory(id: $id) {
      _id
      name
      isActive
      slug
      category {
        _id
        name
        slug
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_SUB_CATEGORY_BY_SLUG = `
  query GetSubCategoryBySlug($slug: String!) {
    subCategoryBySlug(slug: $slug) {
      _id
      name
      isActive
      slug
      category {
        _id
        name
        slug
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_SUB_CATEGORY = `
  mutation CreateSubCategory($input: CreateSubCategoryInput!) {
    createSubCategory(input: $input) {
      _id
      name
      isActive
      slug
      category {
        _id
        name
      }
    }
  }
`;

export const UPDATE_SUB_CATEGORY = `
  mutation UpdateSubCategory($id: ID!, $input: UpdateSubCategoryInput!) {
    updateSubCategory(id: $id, input: $input) {
      _id
      name
      isActive
      slug
      category {
        _id
        name
      }
    }
  }
`;

export const DELETE_SUB_CATEGORY = `
  mutation DeleteSubCategory($id: ID!) {
    deleteSubCategory(id: $id)
  }
`;

export const GET_CATEGORIES = `
  query GetCategories {
    categories {
      _id
      name
      imageUrl
      isActive
      createdAt
      subCategories {
        _id
        name
        isActive
        slug
      }
    }
  }
`;

export const CREATE_CATEGORY = `
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      _id
      name
      isActive
    }
  }
`;

export const UPDATE_CATEGORY = `
  mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      _id
      name
      isActive
    }
  }
`;

export const DELETE_CATEGORY = `
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

export const GET_PORTFOLIOS = `
  query GetPortfolios {
    portfolios {
      _id
      imageUrl
      createdAt
      category {
        _id
        name
        
      }
      subCategory {
          _id
          name
          isActive
          slug
        }
    }
  }
`;

export const GET_PORTFOLIO_BY_ID = `
  query GetPortfolioById($id: ID!) {
    portfolio(id: $id) {
      _id
      imageUrl
      category {
        _id
        name
      }
    }
  }
`;

export const CREATE_PORTFOLIO = `
  mutation CreatePortfolio($input: CreatePortfolioInput!) {
    createPortfolio(input: $input) {
      _id
      imageUrl
      category {
        _id
        name
      }
    }
  }
`;

export const UPDATE_PORTFOLIO = `
  mutation UpdatePortfolio($id: ID!, $input: UpdatePortfolioInput!) {
    updatePortfolio(id: $id, input: $input) {
      _id
      imageUrl
      category {
        _id
        name
      }
    }
  }
`;

export const DELETE_PORTFOLIO = `
  mutation DeletePortfolio($id: ID!) {
    deletePortfolio(id: $id)
  }
`;
