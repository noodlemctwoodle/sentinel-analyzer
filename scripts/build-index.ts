#!/usr/bin/env tsx
/**
 * Pre-build script to generate analysis index
 * Runs during npm build to create a snapshot of all Sentinel solutions
 */

import { GitHubClient } from '../src/repository/githubClient.js';
import { SolutionAnalyzer } from '../src/analyzer/solutionAnalyzer.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildIndex() {
  console.log('🔍 Building pre-built index...');

  try {
    const github = new GitHubClient();
    const analyzer = new SolutionAnalyzer(github);

    console.log('📊 Analyzing all Microsoft Sentinel solutions...');
    const result = await analyzer.analyze();

    // Add build metadata
    const indexData = {
      ...result,
      metadata: {
        ...result.metadata,
        preBuiltAt: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
      },
    };

    // Ensure dist directory exists
    const distDir = path.join(__dirname, '../dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    // Write to dist/pre-built-index.json
    const outputPath = path.join(distDir, 'pre-built-index.json');
    fs.writeFileSync(outputPath, JSON.stringify(indexData, null, 2));

    console.log('✅ Pre-built index created successfully');
    console.log(`   - Solutions: ${result.metadata.totalSolutions}`);
    console.log(`   - Connectors: ${result.metadata.totalConnectors}`);
    console.log(`   - Tables: ${result.metadata.totalTables}`);
    console.log(`   - Mappings: ${result.mappings.length}`);
    console.log(`   - Location: ${outputPath}`);
    console.log(`   - Size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('❌ Failed to build index:', error);
    process.exit(1);
  }
}

buildIndex();
