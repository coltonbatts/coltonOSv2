# Colton OS

A personal operating system and dashboard built with React, Vite, and Tailwind CSS.

## Overview

Colton OS is a web-based personal dashboard featuring an "Industrial Brutalism meets High-Tech Minimal" design aesthetic. It serves as a central hub for tasks, notes, and other personal data, integrated with Firebase.

## Tech Stack

- **Frontend:** React, Vite
- **Styling:** Tailwind CSS
- **Backend/Database:** Firebase (Firestore, Auth)
- **Icons:** Lucide React

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
