# Reclaim - Electronic Waste Recycling App

Reclaim is a web application that helps users identify and properly dispose of electronic waste. The app uses image recognition to detect electronic items and provides information about their environmental impact, recycling options, and upcycling ideas.

## Features

- Image-based e-waste detection
- Environmental impact analysis
- Recycling guidelines and nearby centers
- Upcycling suggestions
- Points system for recycling and upcycling activities
- Leaderboard to track user contributions

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
\`\`\`bash
git clone [your-repository-url]
cd reclaim-frontend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm start
\`\`\`

The app will open in your default browser at http://localhost:3000.

## Deployment

To deploy the app to Google Cloud Platform App Engine:

1. Build the production version:
\`\`\`bash
npm run build
\`\`\`

2. Deploy to App Engine:
\`\`\`bash
gcloud app deploy
\`\`\`

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- Axios for API calls
- React Icons
- React Confetti for animations

## API Endpoints

The app interacts with two main API endpoints:

1. Detection API: \`https://reclaim-backend.el.r.appspot.com/detect\`
   - Accepts an image file
   - Returns detected object and materials

2. Analysis API: \`https://reclaim-backend.el.r.appspot.com/analyze\`
   - Accepts detection results
   - Returns environmental impact, recycling, and upcycling information

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
