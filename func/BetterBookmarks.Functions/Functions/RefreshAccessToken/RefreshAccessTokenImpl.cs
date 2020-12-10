using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using BetterBookmarks.Wrappers;
using System.Net.Http;
using System.Collections.Generic;
using System;

namespace BetterBookmarks.Functions
{
    public class RefreshAccessTokenImpl
    {
        private readonly IHttpClientWrapper _httpClient;

        public RefreshAccessTokenImpl(IHttpClientWrapper httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<IActionResult> Run(HttpRequest req, ILogger log)
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var refreshAccessTokenReq = JsonConvert.DeserializeObject<RefreshAccessTokenRequest>(requestBody);

            var request = new HttpRequestMessage(HttpMethod.Post, "https://login.microsoftonline.com/common/oauth2/v2.0/token");
            var body = new List<KeyValuePair<string, string>>(6);
            body.Add(new KeyValuePair<string, string>("client_id", refreshAccessTokenReq.ClientId));
            body.Add(new KeyValuePair<string, string>("redirect_uri", refreshAccessTokenReq.RedirectUrl));
            body.Add(new KeyValuePair<string, string>("grant_type", "refresh_token"));
            body.Add(new KeyValuePair<string, string>("refresh_token", refreshAccessTokenReq.RefreshToken));
            body.Add(new KeyValuePair<string, string>("scope", refreshAccessTokenReq.Scopes));

            request.Content = new FormUrlEncodedContent(body);

            try 
            {
                var resp = await _httpClient.SendAsync(request);
                resp.EnsureSuccessStatusCode();

                var respContentString = await resp.Content.ReadAsStringAsync();
                var respContent = JsonConvert.DeserializeObject(respContentString);
                return new JsonResult(respContent);
            }
            catch(Exception ex) 
            {
                log.LogError(ex, "Exception occurred during RefreshAccessTokenImpl execution");
                throw;
            }
        }
    }
}
