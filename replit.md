# AI Studio 3D

## Overview

AI Studio 3D is an interactive web application that combines AI capabilities with immersive 3D experiences. The platform provides users with AI-powered chat functionality using multiple language models (Llama, Mistral, CodeLlama) and AI image generation capabilities, all wrapped in a modern 3D interface built with React Three Fiber. The application is designed as a full-stack solution with a React frontend, Express backend, and PostgreSQL database for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built using React with TypeScript and follows a component-based architecture:
- **UI Framework**: React with TypeScript for type safety and modern development patterns
- **Styling**: Tailwind CSS with shadcn/ui components for consistent, responsive design
- **3D Graphics**: React Three Fiber (@react-three/fiber) with drei helpers for interactive 3D scenes
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
The server follows a RESTful API design pattern:
- **Framework**: Express.js with TypeScript for robust server-side development
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Integration**: HuggingFace Inference API for AI model access
- **Session Management**: Express sessions with PostgreSQL storage
- **Development**: Hot reload support with Vite integration in development mode

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless deployment
- **Schema Management**: Drizzle Kit for migrations and schema updates
- **Tables**: 
  - `chat_messages`: Stores conversation history with model information
  - `generated_images`: Stores image generation requests and metadata
  - `users`: User authentication and management
- **Fallback Storage**: In-memory storage implementation for development/testing

### Authentication and Authorization
- **Session-based Authentication**: Express sessions with PostgreSQL backing store
- **User Management**: Simple username/password system with secure password handling
- **Session Persistence**: connect-pg-simple for reliable session storage

### External Service Integrations
- **HuggingFace API**: Multiple AI model access (Llama-2-7b-chat-hf, Mistral-7B-Instruct-v0.1, CodeLlama-7b-Instruct-hf)
- **Neon Database**: Serverless PostgreSQL hosting with automatic scaling
- **Replit Integration**: Development environment optimization with custom plugins

## External Dependencies

### Core AI Services
- **HuggingFace Inference API**: Provides access to open-source language models for chat functionality
- **Stable Diffusion Models**: Image generation capabilities through HuggingFace model hub

### Database and Storage
- **Neon PostgreSQL**: Serverless PostgreSQL database with automatic scaling and backup
- **Drizzle ORM**: Type-safe database toolkit for schema management and queries

### UI and Design System
- **Radix UI**: Headless UI primitives for accessible component foundation
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **shadcn/ui**: Pre-built component library built on Radix UI and Tailwind

### 3D Graphics and Animation
- **Three.js**: Core 3D graphics library for WebGL rendering
- **React Three Fiber**: React renderer for Three.js with declarative API
- **@react-three/drei**: Helper components and utilities for common 3D patterns

### Development and Build Tools
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Static type checking for enhanced development experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS integration