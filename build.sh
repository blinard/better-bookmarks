cd client
gulp build
cd ..

if [ ! "$2" ] || [ $2 != "nooptions" ]
then
    cd web
    yarn build
    cd ..
    cp -Rf web/build/* client/dist/options/
    rm client/dist/options/manifest.json
fi

if [ "$1" ] && [ $1 == "dev" ]
then
    sed -i '' -e 's/m.m.p.r/1.0.0.0/g' client/dist/manifest.json
fi