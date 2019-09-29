fetchToken="curl -d \"{ client_id: '$1', client_secret: '$2', refresh_token: '$3', grant_type: 'refresh_token' }\" -H 'Content-Type: application/json' -X POST -s https://www.googleapis.com/oauth2/v4/token | jq '.access_token'"
# echo $fetchToken
authToken=`eval $fetchToken`
echo $authToken


