# Azure Sentinel Solutions Analyzer MCP Server

An MCP (Model Context Protocol) server that analyzes Azure Sentinel solutions and maps data connectors to Log Analytics tables. This is a TypeScript rewrite of the Azure Sentinel Solutions Analyzer Python tool, exposing its functionality through the MCP protocol for use with AI agents like Claude.

## Features

- **Direct GitHub Access**: Uses GitHub API - no cloning or downloads required!
- **Zero Setup**: Works immediately, no git repository cloning or storage needed
- **Always Current**: Accesses latest data directly from GitHub
- **Comprehensive Analysis**: Analyzes all solutions in the Azure Sentinel Content Hub
- **6 Detection Methods**: Implements all table detection strategies from the original Python tool:
  - graphQueries.{index}.baseQuery
  - sampleQueries.{index}.query
  - dataTypes.{index}.lastDataReceivedQuery
  - connectivityCriterias.{index}.value
  - ARM template logAnalyticsTableId variables
  - Parser function resolution with cycle prevention
- **Tolerant Parsing**: Multi-stage JSON parsing with fallback strategies
- **KQL Query Analysis**: Context-aware Kusto Query Language parser
- **YAML Parser Resolution**: Recursive parser-to-table mapping with depth limiting
- **MCP Integration**: Full MCP server implementation with 6 powerful tools

## Installation

### Via npx (Recommended)

```bash
npx sentinel-analyzer-mcp
```

### Global Installation

```bash
npm install -g sentinel-analyzer-mcp
```

### From Source

```bash
git clone <repository-url>
cd tables-mcp
npm install
npm run build
```

## Usage

### With Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sentinel-analyzer": {
      "command": "npx",
      "args": ["sentinel-analyzer-mcp"]
    }
  }
}
```

### With Other MCP Clients

The server communicates via stdin/stdout using the MCP protocol. Configure your MCP client to run:

```bash
npx sentinel-analyzer-mcp
```

## Available Tools

### 1. analyze_solutions

Run full analysis on all Azure Sentinel solutions.

**Parameters:**
- `force_refresh` (boolean, optional): Force re-clone repository
- `output_format` (enum, optional): 'json' | 'csv' | 'summary' (default: 'json')

**Example:**
```json
{
  "force_refresh": false,
  "output_format": "summary"
}
```

**Returns:** Complete analysis results with connector-table mappings

### 2. get_connector_tables

Get table mappings for a specific connector.

**Parameters:**
- `connector_id` (string, required): The connector identifier

**Example:**
```json
{
  "connector_id": "AzureActiveDirectory"
}
```

**Returns:** Connector details with all associated tables

### 3. search_solutions

Search solutions by name, publisher, or criteria.

**Parameters:**
- `query` (string, required): Search term
- `publisher` (string, optional): Filter by publisher
- `support_tier` (string, optional): Filter by support tier

**Example:**
```json
{
  "query": "Azure",
  "publisher": "Microsoft"
}
```

**Returns:** List of matching solutions with metadata

### 4. get_solution_details

Get comprehensive information about a specific solution.

**Parameters:**
- `solution_name` (string, required): Name of the solution

**Example:**
```json
{
  "solution_name": "Azure Active Directory"
}
```

**Returns:** Full solution details including connectors and tables

### 5. list_tables

Get all unique Log Analytics tables across all solutions.

**Parameters:**
- `table_type` (enum, optional): 'all' | 'custom' | 'standard' (default: 'all')

**Example:**
```json
{
  "table_type": "custom"
}
```

**Returns:** List of tables with connector associations

### 6. validate_connector

Validate a connector JSON definition and extract tables.

**Parameters:**
- `connector_json` (string, required): Connector JSON content

**Example:**
```json
{
  "connector_json": "{\"id\": \"test\", \"title\": \"Test Connector\"}"
}
```

**Returns:** Validation result with errors, warnings, and extracted tables

## How It Works

### Repository Access

The server uses GitHub's API to access the Azure-Sentinel repository directly:
- **No downloads**: Fetches files via HTTPS from GitHub
- **No storage**: No local repository clone needed
- **Always current**: Gets latest commit automatically
- **In-memory caching**: Results cached by commit SHA for performance

### Table Detection

The analyzer uses 6 sophisticated detection methods to identify Log Analytics tables:

1. **Graph Queries**: Analyzes `graphQueries[].baseQuery` fields
2. **Sample Queries**: Parses `sampleQueries[].query` fields
3. **Data Types**: Examines `dataTypes[].lastDataReceivedQuery`
4. **Connectivity Criteria**: Checks `connectivityCriterias[].value`
5. **ARM Variables**: Resolves `logAnalyticsTableId` template variables
6. **Parser Resolution**: Recursively resolves YAML parser functions to tables

### KQL Parser

The built-in KQL parser:
- Detects pipeline heads (tables before `|` operator)
- Strips comments while preserving URLs
- Removes field context (content after operators like `project`, `extend`, etc.)
- Validates table name candidates
- Applies plural corrections for common mistakes

### Error Handling

The analyzer implements tolerant parsing:
- Multi-stage JSON parsing with fallback strategies
- Continues processing on individual connector failures
- Categorizes issues (parse errors, missing tables, etc.)
- Generates detailed issue reports

## Architecture

```
src/
├── analyzer/
│   ├── solutionAnalyzer.ts    # Main orchestration engine
│   ├── kqlParser.ts            # KQL query parser
│   ├── jsonParser.ts           # Tolerant JSON parsing
│   ├── parserResolver.ts       # YAML parser resolution
│   └── tableExtractor.ts       # Table detection logic
├── repository/
│   └── repoManager.ts          # Git clone/update management
├── generators/
│   └── csvGenerator.ts         # CSV/JSON output generation
├── tools/
│   └── index.ts                # MCP tool implementations
├── types/
│   └── index.ts                # TypeScript type definitions
└── index.ts                    # MCP server entry point
```

## Performance

- **Caching**: Analysis results and file contents cached by repository commit hash
- **Parallel Requests**: Multiple files fetched concurrently
- **No Downloads**: Zero initial download time - starts instantly
- **Typical Performance**: 100+ solutions analyzed on first run, instant on subsequent runs

## Comparison to Python Version

This TypeScript implementation provides:

✅ **Feature Parity**: All 6 detection methods implemented
✅ **Same Logic**: Matching parsing and resolution algorithms
✅ **MCP Integration**: Exposed via Model Context Protocol for AI agents
✅ **GitHub API Access**: No cloning, no storage, instant start
✅ **Better Distribution**: Runnable via npx, no Python or Git dependency
✅ **Type Safety**: Full TypeScript type definitions

## Troubleshooting

### GitHub API Rate Limiting

The server uses GitHub's public API which has rate limits:
- **Unauthenticated**: 60 requests/hour
- **With GitHub Token**: 5000 requests/hour

For heavy use, set a GitHub personal access token:
```bash
export GITHUB_TOKEN=your_token_here
npx sentinel-analyzer-mcp
```

### Analysis Takes Too Long

Use the `summary` output format for faster results:

```json
{
  "output_format": "summary"
}
```

Or use `force_refresh: false` to use cached results.

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

### Dev Mode

```bash
npm run dev
```

## Contributing

Contributions welcome! This project maintains feature parity with the Azure Sentinel Solutions Analyzer Python tool while adding MCP integration.

## License

MIT

## Credits

Based on the Azure Sentinel Solutions Analyzer Python tool from the [Azure-Sentinel](https://github.com/Azure/Azure-Sentinel) repository.

## Related Projects

- [Azure Sentinel](https://github.com/Azure/Azure-Sentinel) - Official Azure Sentinel repository
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification
