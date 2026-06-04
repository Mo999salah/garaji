# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

### IMPORTANT RULES - READ FIRST

1. BEFORE YOU CHANGE ANYTHING - Ask user if they have a .env.local file
2. NEVER COMMIT .env.local or .env files
3. NEVER ADD API KEYS TO CODE
4. NEVER COMMIT YOUR DEV PORT
5. The web dev server uses port 8081 (default) - you can change with EXPO_PORT if needed

### Development Server Setup Rules

When user starts server with `npm run web`:

1. The dev server runs on http://localhost:8081
2. Expo uses the port specified in `EXPO_DEV_SERVER_URL` env variable
3. User may have changed port in `.env.local` - use that value
4. Default is 8081 if no port specified

### Environment Variable Rules

1. ALWAYS check for `.env.local` file first
2. If `.env.local` exists, use it
3. If not, use `.env` file
4. If neither exists, use default values

### Code Commit Rules

1. NEVER commit `.env.local` or `.env` files
2. NEVER commit environment variables to code
3. NEVER commit `package-lock.json` or `yarn.lock` files
4. NEVER commit `node_modules` directory
5. ALWAYS run `npm run lint` before committing

### Testing Rules

1. For web testing, use `npm run web` to start dev server
2. The dev server runs on the port defined in `.env.local` or `.env`
3. Default port is 8081 if no port specified
4. For mobile testing, use `npm run start`

### Versioning Rules

1. Expo 54 docs: https://docs.expo.dev/versions/v54.0.0/
2. Check current Expo version with: `npm list expo`
3. Check current React Native version with: `npm list react-native`

### Port Management Rules

1. Use EXPO_DEV_SERVER_URL env variable for dev server URL
2. Default port is 8081
3. User may have changed port in `.env.local` - always check first
4. You can change port with: `EXPO_DEV_SERVER_URL=http://localhost:8082 npm run web`

### Security Rules

1. NEVER commit API keys to code
2. NEVER commit `.env` files to code
3. ALWAYS use environment variables for secrets
4. Check for `.env.local` file first

### Performance Rules

1. Always minify production builds
2. Use lazy loading for heavy components
3. Implement code splitting
4. Optimize images

### Mobile Rules (Future)

1. Expo Go app may have limitations
2. For testing native features, use development builds
3. Expo Dev Client: https://docs.expo.dev/develop/tools/dev-client/
