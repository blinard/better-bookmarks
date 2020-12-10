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

namespace BetterBookmarks.Functions
{
    public class AuthenticateImpl
    {
        private readonly IAuthStatesRepository _pkceVerifierRepository;

        public AuthenticateImpl(IAuthStatesRepository pkceVerifierRepository)
        {
            _pkceVerifierRepository = pkceVerifierRepository;
        }

        public async Task<HttpResponseMessage> Run(HttpRequest req, ILogger log)
        {
            var code = "";
            Console.WriteLine("Path is: " + req.Path);
            Console.WriteLine("QueryString is: " + req.QueryString);
            // Get the Auth Code and State from the Request Url

            var pkceVerifier = await _pkceVerifierRepository.GetAuthStateAsync(req.Query["state"]);

            var urlBase = "https://df306839473c.ngrok.io";
            // Build token request using code and pkceVerifier
            var request = new HttpRequestMessage(HttpMethod.Post, "https://login.microsoftonline.com/common/oauth2/v2.0/token");
            //request.Headers.Add("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
            
            var body = new List<KeyValuePair<string, string>>(6);
            body.Add(new KeyValuePair<string, string>("client_id", "ab8d1625-d6be-4548-ab9f-0a0c0f958d6b"));
            body.Add(new KeyValuePair<string, string>("redirect_uri", urlBase + "/api/Authenticate"));
            body.Add(new KeyValuePair<string, string>("grant_type", "authorization_code"));
            body.Add(new KeyValuePair<string, string>("code", req.Query["code"]));
            body.Add(new KeyValuePair<string, string>("scope", "openid profile offline_access"));
            body.Add(new KeyValuePair<string, string>("code_verifier", pkceVerifier.VerifierCode));

            request.Content = new FormUrlEncodedContent(body);
            // Execute token request and receive auth response
            // TODO: Use a singleton HttpClient
            using(var client = new HttpClient()) 
            {
                var resp = await client.SendAsync(request);
                Console.WriteLine("Response received!");
                Console.WriteLine("Status code: " + resp.StatusCode);

                // Acquire html/page to send in response
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
                html = html.Replace("__AUTHRESPONSE__", (await resp.Content.ReadAsStringAsync()).Trim());

                // Send hydrated html/page response
                var response = new HttpResponseMessage(HttpStatusCode.OK);
                response.Content = new StringContent(html);
                response.Content.Headers.ContentType = new MediaTypeHeaderValue("text/html");
                return response;
            }
        }
    }
}
