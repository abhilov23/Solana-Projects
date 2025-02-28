# cruddapp - Solana CRUD Application

Welcome to `cruddapp`, a decentralized CRUD (Create, Read, Update, Delete) application built on the Solana blockchain using Anchor. This project demonstrates a simple journal entry system where users can create, update, and delete entries stored on-chain, with each entry tied to a Program Derived Address (PDA) based on a title and owner. It serves as a learning tool for Solana development and can be extended for real-world use cases like logging or data management.

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Development](#development)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Overview
`cruddapp` is a Solana program written in Rust with Anchor, providing a TypeScript/JavaScript interface for frontend integration. It uses PDAs to uniquely identify journal entries based on a title and owner public key. The frontend leverages React hooks with `@tanstack/react-query` for state management and `@solana/wallet-adapter-react` for wallet interactions, though it can be adapted to use stored keys for signing.

This project is ideal for developers learning Anchor, Solana program development, and frontend integration, with a focus on on-chain data persistence.

---

## Features
- **Create Entries**: Store new journal entries with a title and message, linked to the owner’s public key.
- **Read Entries**: Fetch all or specific journal entries stored on-chain.
- **Update Entries**: Modify the message of an existing entry.
- **Delete Entries**: Remove entries from the blockchain.
- **PDA-based Storage**: Uses Program Derived Addresses for unique entry identification.
- **React Integration**: Provides custom hooks for querying and mutating data.

---

## Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git** (for cloning the repository)
- **Rust** (for building the Anchor program)
- **Solana CLI** (for deploying and interacting with the program)
- **Anchor CLI** (`anchor` package)

Required dependencies:
- `@project-serum/anchor`
- `@solana/web3.js`
- `@tanstack/react-query`
- `react`
- `react-dom`
- `react-hot-toast`
- `axios` (optional, for server-side signing)

---

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/cruddapp.git
   cd cruddapp