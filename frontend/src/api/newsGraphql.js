import { urlFromBase } from '../config';

const NEWS_GRAPHQL_URL = urlFromBase('/news');

export async function newsGraphqlRequest(query, variables = {}) {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  const response = await fetch(NEWS_GRAPHQL_URL, {
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

export const GET_NEWS_LIST = `
  query GetNewsList($page: Int, $limit: Int) {
    newsList(page: $page, limit: $limit) {
      items {
        _id
        title
        description
        imageUrl
        date
        createdAt
        updatedAt
      }
      totalCount
      totalPages
      currentPage
    }
  }
`;

export const CREATE_NEWS = `
  mutation CreateNews($input: CreateNewsInput!) {
    createNews(input: $input) {
      _id
      title
      description
      imageUrl
      date
    }
  }
`;

export const UPDATE_NEWS = `
  mutation UpdateNews($id: ID!, $input: UpdateNewsInput!) {
    updateNews(id: $id, input: $input) {
      _id
      title
      description
      imageUrl
      date
    }
  }
`;

export const DELETE_NEWS = `
  mutation DeleteNews($id: ID!) {
    deleteNews(id: $id)
  }
`;