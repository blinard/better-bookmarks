# First get an auth token based on the client_id, client_secret and refresh_token passed in via arguments
fetchToken='curl -d '\"'{ client_id: '\'$1\'', client_secret: '\'$2\'', refresh_token: '\'$3\'', grant_type: '\'refresh_token\'' }" -H '\''Content-Type: application/json'\'' -X POST -s https://www.googleapis.com/oauth2/v4/token | jq '\''.access_token'\'
# echo $fetchToken

authToken=`eval $fetchToken | sed 's/"//g'`
# echo $authToken

# Display current extension version from Chrome WebStore Api
curl \
-H 'Authorization: Bearer '$authToken  \
-H 'x-goog-api-version: 2' \
-s https://www.googleapis.com/chromewebstore/v1.1/items/pefeencopjdpgkdkdpomklgfjkodmdhm?projection=draft \
| jq .

# Push the package up to the Chrome WebStore extension
curl \
-H 'Authorization: Bearer '$authToken  \
-H 'x-goog-api-version: 2' \
-X PUT \
-T package.zip \
-# -s \
https://www.googleapis.com/upload/chromewebstore/v1.1/items/pefeencopjdpgkdkdpomklgfjkodmdhm?uploadType=media

# Publish the new package to testers
curl \
-H 'Authorization: Bearer '$authToken  \
-H 'x-goog-api-version: 2' \
-X POST \
-s \
https://www.googleapis.com/chromewebstore/v1.1/items/pefeencopjdpgkdkdpomklgfjkodmdhm/publish?publishTarget=trustedTesters

# Display current extension version from Chrome WebStore Api
curl \
-H 'Authorization: Bearer '$authToken  \
-H 'x-goog-api-version: 2' \
-s https://www.googleapis.com/chromewebstore/v1.1/items/pefeencopjdpgkdkdpomklgfjkodmdhm?projection=draft \
| jq .

echo Done