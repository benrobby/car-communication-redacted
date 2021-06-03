# Run this app
1. npm install
2. download a zoom video sdk and copy "@zoomus" to .\node_modules\
3. modify you sdkKey in src/config/dev.js
4. enter a Here maps api key in src/feature/map/here-map.tsx
5. create a firebase realtime db and add the config in src/config/firebaseconfig.ts
6. npm run start
7. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

Notice:
1. this demo only support nodejs 14,and npm 6, don't support nodejs 15 and npm 7, place check version node -v and npm -v
2. nodejs could can't work if path contain & and other special char
