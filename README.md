# Octav Plugin for ElizaOS

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful ElizaOS plugin for fetching real-time portfolio balances across multiple blockchains. This plugin enables AI agents to retrieve wallet holdings and asset values, returning comprehensive portfolio data denominated in USD.

## ✨ Features

- Fetchers portfolio balances

## 🚀 Quick Start

### Installation

```bash
bun add plugin-octav
```

### Basic Setup

1. **Environment Configuration**

Create a `.env` file in your project root:

Get an [Octav API KEY](https://data.octav.fi/)

```env
OCTAV_API_KEY=__INSERT_API_KEY___
```

2. **Character Configuration**

Add to your character's `plugins` array:

```json
{
  "plugins": ["plugin-octav"]
}
```

## 📖 Available Actions

#### Check Portfolio balances

```
"Can you fetch portfolio balances of 0xEF...395"
```

**Action**: `GET_PORTFOLIO`

## 🛠️ Development

### Building the Plugin

```bash
# Install dependencies
bun install

# Build the plugin
bun run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/x-feature`
3. Commit changes: `git commit -m 'Add X feature'`
4. Push to branch: `git push origin feature/x-feature`
5. Open a Pull Request
