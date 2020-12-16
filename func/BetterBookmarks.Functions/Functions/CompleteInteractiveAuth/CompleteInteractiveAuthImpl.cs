using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using BetterBookmarks.Repositories;
using BetterBookmarks.Services;
using System.Collections.Generic;
using BetterBookmarks.Models;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using BetterBookmarks.Wrappers;

namespace BetterBookmarks.Functions
{
    public class CompleteInteractiveAuthImpl
    {
        private readonly IAuthStatesRepository _authStateRepository;
        private readonly IHttpClientWrapper _httpClient;

        public CompleteInteractiveAuthImpl(IAuthStatesRepository authStateRepository, IHttpClientWrapper httpClient)
        {
            _authStateRepository = authStateRepository;
            _httpClient = httpClient;
        }

        public async Task<HttpResponseMessage> Run(HttpRequest req, ILogger log)
        {
            Console.WriteLine("Path is: " + req.Path);
            Console.WriteLine("QueryString is: " + req.QueryString);
            // Get the Auth Code and State from the Request Url

            var authState = await _authStateRepository.GetAuthStateAsync(req.Query["state"]);

            // Build token request using code and pkceVerifier
            var request = new HttpRequestMessage(HttpMethod.Post, "https://login.microsoftonline.com/common/oauth2/v2.0/token");
            
            var body = new List<KeyValuePair<string, string>>(6);
            body.Add(new KeyValuePair<string, string>("client_id", authState.ClientId));
            body.Add(new KeyValuePair<string, string>("redirect_uri", authState.RedirectUrl));
            body.Add(new KeyValuePair<string, string>("grant_type", "authorization_code"));
            body.Add(new KeyValuePair<string, string>("code", req.Query["code"]));
            body.Add(new KeyValuePair<string, string>("scope", authState.Scopes)); //was "openid profile offline_access"
            body.Add(new KeyValuePair<string, string>("code_verifier", authState.AuthCodeVerifier));

            request.Content = new FormUrlEncodedContent(body);
            HttpResponseMessage myResponse = new HttpResponseMessage(HttpStatusCode.InternalServerError);
            try 
            {
                // Execute token request and receive auth response
                var tokenFetchResponse = await _httpClient.SendAsync(request);
                Console.WriteLine("Response received!");
                Console.WriteLine("Status code: " + tokenFetchResponse.StatusCode);
                tokenFetchResponse.EnsureSuccessStatusCode();

                // Acquire html/page to send in response
                // TODO: Build a better auth success experience.
                var html = @"
                <html>
                    <head>
                        <title>Better Bookarks - Authenticated</title>
                    </head>
                    <body>
                        <h1>Authenticated Successfully</h1>
                        <p>You've authenticated successfully; please close this tab at your convenience.</p>
                        <div id='authResponse' style='display: none;'>__AUTHRESPONSE__</div>
                    </body>
                </html>
                ";
                
                // Hydrate auth response into html/page response
                html = html.Replace("__AUTHRESPONSE__", (await tokenFetchResponse.Content.ReadAsStringAsync()).Trim());

                // Send hydrated html/page response
                myResponse = new HttpResponseMessage(HttpStatusCode.OK);
                myResponse.Content = new StringContent(html);
                myResponse.Content.Headers.ContentType = new MediaTypeHeaderValue("text/html");
            }
            catch(Exception ex)
            {
                Console.WriteLine("Exception occurred: " + ex);
                // TODO: Build a better auth failure experience.
                var html = @"
                <html>
                    <head>
                        <title>Better Bookarks - Authentication Failed</title>
                    </head>
                    <body>
                        <h1>Authentication Failed</h1>
                        <p>We failed to authenticate you for some reason. We're sorry for the inconvenience, please try again later.</p>
                    </body>
                </html>
                ";
                
                // Send hydrated html/page response
                myResponse = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                myResponse.Content = new StringContent(html);
                myResponse.Content.Headers.ContentType = new MediaTypeHeaderValue("text/html");
            }

            return myResponse;                
        }
    }
}
