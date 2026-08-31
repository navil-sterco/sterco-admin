import { urlFromBase } from '../config';

const NEWS_GRAPHQL_URL = urlFromBase('/case-studies');

export async function caseStudiesGraphqlRequest(query, variables = {}) {
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

export const GET_CASE_STUDIES = `
  query GetCaseStudies($page: Int, $limit: Int) {
    caseStudies(page: $page, limit: $limit) {
      items {
        _id
        title
        thumbnailImage
        logoImage
        date
        htmlContent
        createdAt
        updatedAt
      }
      totalCount
      totalPages
      currentPage
    }
  }
`;

export const GET_CASE_STUDY_BY_ID = `
  query GetCaseStudyById($id: ID!) {
    caseStudy(id: $id) {
      _id
      title
      thumbnailImage
      logoImage
      date
      htmlContent
    }
  }
`;

export const CREATE_CASE_STUDY = `
  mutation CreateCaseStudy($input: CreateCaseStudyInput!) {
    createCaseStudy(input: $input) {
      _id
      title
    }
  }
`;

export const UPDATE_CASE_STUDY = `
  mutation UpdateCaseStudy($id: ID!, $input: UpdateCaseStudyInput!) {
    updateCaseStudy(id: $id, input: $input) {
      _id
      title
    }
  }
`;

export const DELETE_CASE_STUDY = `
  mutation DeleteCaseStudy($id: ID!) {
    deleteCaseStudy(id: $id)
  }
`;