# replit.md

## Overview

This is a modern basketball club website built with React and TypeScript. The application serves as a landing page and membership portal for "ICN FIRE," a workplace basketball club that focuses on structured 5-on-5 training and team development. The site features a multi-page design with smooth slide animations between pages, including home, about, rules, finance, and contact pages with membership application functionality.

## Recent Changes (November 2025)

- **Added image copy functionality**: Implemented copy-to-clipboard buttons for all 4 guest recruitment images using Clipboard API with toast notifications
- **Fixed deployment documentation**: Updated GITHUB_SETUP.md to clarify that `dist/public` (not `dist`) should be deployed to GitHub Pages as the web root to ensure all images load correctly

## Previous Changes (August 2025)

- **Enhanced page transition animations**: Implemented bidirectional slide animations where both current and new pages move simultaneously
- **Improved navigation direction logic**: Added context-based direction detection that determines slide direction based on menu order
- **Converted from single-page to multi-page architecture**: Transformed the scroll-based single-page layout into a React Router-based multi-page structure
- **Added page transition animations**: Implemented directional slide animations using framer-motion for smooth page transitions
- **Restructured navigation system**: Updated Navigation component to use router links with direction detection
- **Created page-based components**: Organized sections into dedicated pages in src/pages/ directory
- **Removed Footer component**: Simplified layout to Navigation and main content only

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **API Pattern**: RESTful API endpoints for membership applications and contact messages
- **Data Storage**: In-memory storage implementation with interface for future database integration
- **Validation**: Zod schemas for request/response validation
- **Development**: Hot module replacement via Vite middleware integration

### Component Design
- **Layout**: Multi-page application with persistent Navigation and Footer
- **Page Structure**: 
  - Home (/): Hero, About, Highlights, Tournaments
  - About Us (/about): Schedule, News
  - Rules (/rules): Rules, JoinUs
  - Finance (/finance): Finance
  - Join Us (/contact): Contact
- **Page Transitions**: Right-to-left slide animations using framer-motion
- **Component Structure**: Modular section-based components organized into page layouts
- **Design System**: Consistent design tokens using CSS custom properties
- **Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints

### Data Layer
- **Schema Definition**: Shared TypeScript types using Drizzle ORM schema definitions
- **Database Preparation**: Drizzle configuration setup for PostgreSQL (schema ready but currently using in-memory storage)
- **Type Safety**: End-to-end type safety from database schema to frontend components

### Development Workflow
- **Build System**: ESBuild for server bundling, Vite for client bundling
- **Development Server**: Express server with Vite middleware for hot reloading
- **Code Organization**: Monorepo structure with shared types and schemas

## External Dependencies

### Core Libraries
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database ORM (configured for PostgreSQL)
- **@neondatabase/serverless**: Database driver for Neon PostgreSQL
- **wouter**: Lightweight React router
- **react-hook-form**: Form state management
- **zod**: Runtime type validation

### UI Components
- **@radix-ui/***: Headless UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Component variant management

### Development Tools
- **vite**: Frontend build tool and development server
- **typescript**: Type checking and compilation
- **esbuild**: Server-side bundling
- **drizzle-kit**: Database migration and introspection tools

### Replit Integration
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Development tooling (conditional)