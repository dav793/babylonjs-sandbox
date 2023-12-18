# Troubleshooting

### Module not found / Can't resolve module
1. Delete node modules folder with `rm -rf node_modules`
2. Delete package-lock.json `rm -f package-lock.json`
3. Clean up npm cache `npm cache clean --force` (try again if it fails)
4. Install packages again `npm install`