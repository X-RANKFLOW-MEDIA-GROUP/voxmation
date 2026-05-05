# DocVault - Document & Image Storage

A modern, dark-themed web application for managing and organizing your documents and images with AI-powered smart naming.

## Features

✨ **User Authentication**
- Email/password login
- Google OAuth integration
- Protected dashboard

📁 **File Management**
- Drag-and-drop file uploads (images + PDFs)
- Smart file organization (All Files, Images, Documents, Shared)
- Grid and list view toggles
- File metadata display (name, size, upload date)

🤖 **AI-Powered Naming**
- Automatic smart name suggestions after upload
- Customizable file names
- Skip naming if desired

🔗 **Sharing**
- Generate public share links
- Copy link to clipboard
- Link expiration (30 days)
- Access control management

🎨 **Design**
- Dark mode by default (zinc/slate theme)
- Responsive layout
- Smooth animations with Framer Motion
- Accessible UI with Lucide icons

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Context API
- **Date Formatting**: date-fns

## Project Structure

```
docvault/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Homepage redirect
│   ├── globals.css             # Global styles
│   ├── providers.tsx           # Auth provider wrapper
│   ├── login/
│   │   └── page.tsx            # Login page
│   └── dashboard/
│       ├── layout.tsx          # Dashboard layout with sidebar
│       ├── page.tsx            # All files view
│       ├── images/
│       │   └── page.tsx        # Images view
│       ├── documents/
│       │   └── page.tsx        # Documents view
│       └── shared/
│           └── page.tsx        # Shared files view
├── components/
│   ├── ui/
│   │   ├── button.tsx          # Button component
│   │   ├── input.tsx           # Input component
│   │   └── dialog.tsx          # Dialog component
│   ├── sidebar.tsx             # Navigation sidebar
│   ├── file-upload.tsx         # Drag-drop upload
│   ├── file-grid.tsx           # Grid/list file view
│   ├── ai-naming-modal.tsx     # Smart naming modal
│   ├── share-modal.tsx         # Share link modal
│   └── ...
├── lib/
│   ├── auth-context.tsx        # Auth state management
│   ├── file-context.tsx        # File state management
│   ├── utils.ts                # Utility functions
│   └── ...
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── ...
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Navigate to the project:
```bash
cd docvault
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Create environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your settings
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Routes

- `/` - Homepage (redirects to login or dashboard)
- `/login` - Login page with email and Google options
- `/dashboard` - All files view
- `/dashboard/images` - Images view
- `/dashboard/documents` - Documents view
- `/dashboard/shared` - Shared files view

## Key Components

### FileUpload
Drag-and-drop file upload with:
- Real-time progress tracking
- File validation (images, PDFs, max 50MB)
- Integration with AI naming flow

### AINamingModal
Modal for AI-suggested file names with:
- 2-second simulated analysis
- Editable suggestions
- Skip option for default naming

### FileGrid
Displays files in grid or list view with:
- Category filtering
- Share button for each file
- Responsive layout

### ShareModal
Share file via public link with:
- One-click copy to clipboard
- Link expiration info
- Access permissions management

## Customization

### Theme Colors
Edit `globals.css` to customize:
- Primary color (currently blue/blue-600)
- Background (currently zinc-900/800)
- Text colors (zinc palette)
- Hover states and transitions

### File Upload Limits
Modify `file-upload.tsx`:
- Change `50MB` limit in `processFiles()`
- Add/remove file type validation
- Customize accept patterns

### AI Naming Patterns
Edit `file-context.tsx`:
- Modify smart name suggestions
- Add industry-specific patterns
- Customize naming templates

## Performance Optimizations

- Server-side rendering where possible
- Client-side state management with Context API
- Lazy loading of images
- CSS-in-JS optimization with Tailwind
- Memoized file filtering

## Browser Support

- Chrome/Edge 88+
- Firefox 87+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- Backend integration (database for persistent storage)
- Real AI analysis for naming suggestions
- File versioning
- Collaboration features
- Advanced search and filtering
- File preview modals
- Download history tracking
- Tags and custom categories

## Deployment

Deploy to Vercel with one click:

```bash
vercel deploy
```

Or manually:
1. Build: `npm run build`
2. Start: `npm start`

## License

MIT

## Support

For issues or questions, please refer to the component documentation or file an issue in the repository.
