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

namespace BetterBookmarks.Functions
{
    public class StoreAuthStateImpl
    {
        private readonly IAuthStatesRepository _authStateRepository;

        public StoreAuthStateImpl(IAuthStatesRepository authStateRepository)
        {
            _authStateRepository = authStateRepository;
        }

        public async Task<IActionResult> Run(HttpRequest req, ILogger log)
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var pkceVerifier = JsonConvert.DeserializeObject<AuthState>(requestBody);

            Console.WriteLine("Storing authState with StateKey: " + pkceVerifier.StateKey);
            await _authStateRepository.SaveAuthStateAsync(pkceVerifier);
            return new StatusCodeResult(204);
        }
    }
}
