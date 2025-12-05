/**
 * Repository Manager for Azure-Sentinel GitHub repository
 * Uses GitHub API - no cloning required!
 */

import { GitHubClient } from './githubClient.js';

export class RepositoryManager {
  private github: GitHubClient;

  constructor() {
    this.github = new GitHubClient();
  }

  /**
   * Ensure repository is accessible (always ready with GitHub API)
   */
  async ensureRepository(forceRefresh = false): Promise<void> {
    if (forceRefresh) {
      console.error('Force refresh requested, clearing cache...');
      this.github.clearCache();
    }

    console.error('Using Azure-Sentinel repository via GitHub API (no download needed)');
  }

  /**
   * Get the current commit hash of the repository
   */
  async getCurrentCommit(): Promise<string> {
    return await this.github.getLatestCommitSha();
  }

  /**
   * Get GitHub client for direct access
   */
  getGitHubClient(): GitHubClient {
    return this.github;
  }

  /**
   * Get file content from GitHub
   */
  async getFileContent(path: string): Promise<string> {
    return await this.github.getFileContent(path);
  }

  /**
   * List directory contents
   */
  async listDirectory(path: string): Promise<any[]> {
    return await this.github.listDirectory(path);
  }

  /**
   * Get GitHub URL for a path
   */
  getGitHubUrl(path: string): string {
    return this.github.getGitHubUrl(path);
  }

  /**
   * Get GitHub blob URL for a file
   */
  getGitHubBlobUrl(path: string): string {
    return this.github.getGitHubBlobUrl(path);
  }
}
