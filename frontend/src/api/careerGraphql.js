import { urlFromBase } from '../config';

const CAREER_GRAPHQL_URL = urlFromBase('/careers');

export async function careerGraphqlRequest(query, variables = {}) {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  const response = await fetch(CAREER_GRAPHQL_URL, {
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

export const GET_CAREERS = `
  query GetCareers($page: Int, $limit: Int) {
    careers(page: $page, limit: $limit) {
      items {
        _id
        title
        experience
        industry
        joining
        slug
        responsibilities
        requirements
        createdAt
      }
      totalCount
      totalPages
      currentPage
    }
  }
`;

export const GET_CAREER_BY_ID = `
  query GetCareerById($id: ID!) {
    career(id: $id) {
      _id
      title
      experience
      industry
      joining
      responsibilities
      requirements
      slug
    }
  }
`;

export const CREATE_CAREER = `
  mutation CreateCareer($input: CreateCareerInput!) {
    createCareer(input: $input) {
      _id
      title
      slug
    }
  }
`;

export const UPDATE_CAREER = `
  mutation UpdateCareer($id: ID!, $input: UpdateCareerInput!) {
    updateCareer(id: $id, input: $input) {
      _id
      title
      slug
    }
  }
`;

export const DELETE_CAREER = `
  mutation DeleteCareer($id: ID!) {
    deleteCareer(id: $id)
  }
`;