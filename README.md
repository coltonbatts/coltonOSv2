# Colton OS

![Build Status](https://github.com/coltonbatts/coltonOSv2/actions/workflows/ci.yml/badge.svg)

A personal operating system and dashboard built with React, Vite, and Tailwind CSS.

## Overview

Colton OS is a web-based personal dashboard featuring an "Industrial Brutalism meets High-Tech Minimal" design aesthetic. It serves as a central hub for tasks, notes, and other personal data, fully integrated with Firebase for real-time data persistence and authentication.

## Features

- **Dashboard**: Central hub with quick actions and system status.
- **Projects View**: Kanban-style project management with progress tracking.
- **Vault**: A comprehensive asset management system for:
  - **Projects**: Portfolio and client work.
  - **Assets**: Templates, graphics, and reusable files.
  - **Prompts**: AI system prompts and context blocks.
  - **Links**: Bookmarks and references.
- **Firebase Integration**:
  - Anonymous Authentication.
  - Real-time Firestore updates.
  - Robust error handling and connection status.
- **UI/UX**:
  - Dark mode "Industrial Brutalism" aesthetic.
  - Toast notifications for user feedback.
  - Responsive design for all devices.

## Tech Stack

- **Frontend:** React, Vite
- **Styling:** Tailwind CSS, Lucide React (Icons)
- **Backend/Database:** Firebase (Firestore, Auth)

## Architecture

Colton OS is built as a single-page application (SPA) using React. It leverages a module-based architecture where views are lazy-loaded (conceptually) and state is managed locally within views or via Firebase listeners.

### Data Model

The application uses a flat data structure in Firestore:

- **Users (`/users/{uid}`)**: Stores user preferences and profile data.
- **Projects (`/users/{uid}/projects/{projectId}`)**: Kanban cards with status (`todo`, `doing`, `done`).
- **Assets (`/users/{uid}/assets/{assetId}`)**: Items in the Vault, categorized by `type` (project, asset, prompt, link).

### Authentication

Currently supports **Anonymous Authentication** for instant onboarding. Users can upgrade to permanent accounts (Email/Google) to persist data across devices.

### Error Handling

The application includes a global error boundary and specific connection status indicators. if `firebase.js` is missing credentials, a full-screen "System Error" overlay guides the user to fix their `.env.local` configuration.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/coltonbatts/coltonOSv2.git
    cd coltonOS
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables:
    Create a `.env.local` file in the root directory with your Firebase configuration:

    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4. Start the development server:

    ```bash
    npm run dev
    ```

## Building for Production

To build the application for production:

```bash
npm run build
```
