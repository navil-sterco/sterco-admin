import { urlFromBase } from '../config';

const BLOGS_GRAPHQL_URL = urlFromBase('/blogs');

export async function blogsGraphqlRequest(query, variables = {}) {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  const response = await fetch(BLOGS_GRAPHQL_URL, {
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

export const GET_BLOGS = `
  query GetBlogs($page: Int, $limit: Int) {
    blogList(page: $page, limit: $limit) {
      items {
        _id
        title
        slug
        excerpt
        content
        category
        imageUrl
        date
        status
        createdAt
      }
      totalCount
      totalPages
      currentPage
    }
  }
`;

export const CREATE_BLOG = `
  mutation CreateBlog($input: CreateBlogInput!) {
    createBlog(input: $input) {
      _id
      title
      slug
      excerpt
      content
      category
      imageUrl
      date
      status
    }
  }
`;

export const UPDATE_BLOG = `
  mutation UpdateBlog($id: ID!, $input: UpdateBlogInput!) {
    updateBlog(id: $id, input: $input) {
      _id
      title
      slug
      excerpt
      content
      category
      imageUrl
      date
      status
    }
  }
`;

export const DELETE_BLOG = `
  mutation DeleteBlog($id: ID!) {
    deleteBlog(id: $id)
  }
`;
