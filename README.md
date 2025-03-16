# TodakuReader

TodakuReader is a Japanese language learning application that helps users improve their language skills through grammar points, vocabulary exploration, and reading practice.

## Features

- **Grammar Browser**: Browse and search Japanese grammar points with offline mode support
- **Vocabulary Browser**: Explore Japanese vocabulary with offline mode and caching
- **Story Generator**: Create Japanese stories to practice reading
- **Story Reader**: Read Japanese stories with translation support

## Tech Stack

- **Frontend**: React, Styled Components
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Authentication**: JWT with Google OAuth

## Installation

### Prerequisites

- Node.js (v16+)
- PostgreSQL
- npm or yarn

### Local Development Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/TodakuReader.git
cd TodakuReader
```

2. **Set up the backend**

```bash
cd server
npm install
cp .env.example .env
# Edit the .env file with your database credentials and Google OAuth credentials
```

3. **Set up the frontend**

```bash
cd client
npm install
cp .env.example .env
# Edit the .env file with your backend API URL
```

4. **Start the development servers**

Backend:
```bash
cd server
npm run dev
```

Frontend:
```bash
cd client
npm start
```

## Deployment

### Production Setup

1. **Build the frontend**

```bash
cd client
npm run build
```

2. **Setup environment variables**

Make sure to set up all the required environment variables on your production server:

```
NODE_ENV=production
PORT=5001
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
GOOGLE_CLIENT_ID=your_google_client_id
JWT_SECRET=your_jwt_secret
```

3. **Start the server**

```bash
cd server
npm start
```

## Health Check Scripts

The application includes health check scripts to ensure proper functionality:

- Check Grammar Browser: `npm run check-grammar`
- Check Vocabulary Browser: `npm run check-vocabulary`

## Testing

Run tests for the client:

```bash
cd client
npm test
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 