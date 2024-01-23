# Troubleshooting

### Module not found / Can't resolve module
1. Delete node modules folder with `rm -rf node_modules`
2. Delete package-lock.json `rm -f package-lock.json`
3. Clean up npm cache `npm cache clean --force` (try again if it fails)
4. Install packages again `npm install`

OR

1. Install all babylonjs dependencies with a specific version
```bash
npm install --save @babylonjs/core@6.34.1 @babylonjs/inspector@6.34.1 @babylonjs/loaders@6.34.1 @babylonjs/serializers@6.34
.1 @babylonjs/materials@6.34.1 @babylonjs/gui@6.34.1 @babylonjs/gui-editor@6.34.1
```