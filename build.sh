cd client
gulp build
cd ../web
yarn build
cd ..
cp -Rf web/build/* client/dist/options/
