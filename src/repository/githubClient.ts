/**
 * GitHub API Client for accessing Azure-Sentinel repository remotely
 * No cloning required - uses GitHub API and raw file URLs
 */

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';
const REPO_OWNER = 'Azure';
const REPO_NAME = 'Azure-Sentinel';
const REPO_BRANCH = 'master';

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface GitHubTree {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

export class GitHubClient {
  private cache: Map<string, any> = new Map();

  /**
   * Get the latest commit SHA for the repository
   */
  async getLatestCommitSha(): Promise<string> {
    const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/commits/${REPO_BRANCH}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch commit: ${response.statusText}`);
      }

      const data = await response.json() as { sha: string };
      return data.sha;
    } catch (error) {
      console.error('Warning: Failed to get latest commit SHA:', error);
      return 'unknown';
    }
  }

  /**
   * Get file content from GitHub
   */
  async getFileContent(path: string): Promise<string> {
    const cacheKey = `file:${path}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const url = `${GITHUB_RAW_BASE}/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/${path}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
      }

      const content = await response.text();
      this.cache.set(cacheKey, content);
      return content;
    } catch (error) {
      throw new Error(`Error fetching ${path}: ${error}`);
    }
  }

  /**
   * List directory contents
   */
  async listDirectory(path: string): Promise<GitHubTreeItem[]> {
    const cacheKey = `dir:${path}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${REPO_BRANCH}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to list ${path}: ${response.statusText}`);
      }

      const items = await response.json() as GitHubTreeItem[];
      this.cache.set(cacheKey, items);
      return items;
    } catch (error) {
      throw new Error(`Error listing ${path}: ${error}`);
    }
  }

  /**
   * Get full directory tree recursively (for Solutions directory)
   */
  async getTree(treeSha?: string): Promise<GitHubTree> {
    // If no treeSha provided, get it from the latest commit
    if (!treeSha) {
      const commitSha = await this.getLatestCommitSha();
      const commitUrl = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/git/commits/${commitSha}`;
      const commitResponse = await fetch(commitUrl);
      const commitData = await commitResponse.json() as { tree: { sha: string } };
      treeSha = commitData.tree.sha;
    }

    const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${treeSha}?recursive=1`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch tree: ${response.statusText}`);
      }

      return await response.json() as GitHubTree;
    } catch (error) {
      throw new Error(`Error fetching tree: ${error}`);
    }
  }

  /**
   * Find all files matching a pattern in the tree
   */
  filterTreeByPattern(tree: GitHubTree, pattern: RegExp): GitHubTreeItem[] {
    return tree.tree.filter((item) => item.type === 'blob' && pattern.test(item.path));
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Generate GitHub web URL for a path
   */
  getGitHubUrl(path: string): string {
    return `https://github.com/${REPO_OWNER}/${REPO_NAME}/tree/${REPO_BRANCH}/${path}`;
  }

  /**
   * Generate GitHub blob URL for a file
   */
  getGitHubBlobUrl(path: string): string {
    return `https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/${REPO_BRANCH}/${path}`;
  }
}
