/**
 * Repository configuration types
 */

export interface RepositoryConfig {
  owner: string;
  name: string;
  branch: string;
  solutionsPath: string;
}

export const DEFAULT_REPOSITORY_CONFIG: RepositoryConfig = {
  owner: process.env.SENTINEL_REPO_OWNER || 'Azure',
  name: process.env.SENTINEL_REPO_NAME || 'Azure-Sentinel',
  branch: process.env.SENTINEL_REPO_BRANCH || 'master',
  solutionsPath: process.env.SENTINEL_SOLUTIONS_PATH || 'Solutions',
};
