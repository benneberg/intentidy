/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Diff } from '../types';

export interface RepoInfo {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  openIssues: number;
  defaultBranch: string;
  lastCommit?: {
    hash: string;
    message: string;
    author: string;
    date: string;
  };
}

export async function fetchRepoInfo(owner: string, repo: string): Promise<RepoInfo | null> {
  try {
    const res = await fetch(`/api/git/repo?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`);
    if (!res.ok) {
      console.warn(`Git proxy returned status ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch repository info:", error);
    return null;
  }
}

export async function fetchRepoDiffs(owner: string, repo: string, ref?: string): Promise<Diff[]> {
  try {
    const url = `/api/git/diffs?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}${ref ? `&ref=${encodeURIComponent(ref)}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Git diff proxy returned status ${res.status}`);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch diffs from git service:", error);
    return [];
  }
}

export async function syncRepoRuntime(cardId: string): Promise<{ success: boolean; lastCommit?: any; lastSync?: string }> {
  try {
    const res = await fetch(`/api/git/sync/${cardId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      throw new Error(`Sync failed with status ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error synchronizing repository runtime:", error);
    return { success: false };
  }
}
