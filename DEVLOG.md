```bash
npx create-react-app reach-sample-react-app
cd reach-sample-react-app

npm install --save assert @reach-sh/stdlib@0.1.2-rc.5
git add package.json package-lock.json
git commit -m 'installed reach js stdlib'

curl https://raw.githubusercontent.com/reach-sh/reach-lang/master/reach -o reach ; chmod +x reach
git add reach
git commit -m 'installed reach shell script'

./reach update

curl https://raw.githubusercontent.com/reach-sh/reach-lang/master/examples/overview/index.rsh -o src/index.rsh
git add src/index.rsh
git commit -m 'copy examples/overview/index.rsh'

# edit package.json with compile-rsh script
# (cd src && ../reach compile)
npm run compile-rsh
git add package.json build/index.main.mjs
git commit -m 'add compile-rsh and built mjs'

# the rest of the owl
git add src/Alice.js src/Bob.js src/CtcInfo.js src/sleep.js src/App.js
git commit -m 'working reach app'

# in another terminal
npm run start
# after taking some time for React to compile,
# localhost:3000 now has the working app running

# edit the css
git add src/App.css
git commit -m 'shrink the spinning logo'

# edit the opts on src/index.rsh
npm run compile-rsh
git add src/index.rsh src/build/index.main.mjs
git commit -m 'exercise some rsh opts'
```
