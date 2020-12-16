using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using BetterBookmarks.Repositories;
using BetterBookmarks.Models;

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
            var authState = JsonConvert.DeserializeObject<AuthState>(requestBody);

            Console.WriteLine("Storing authState with StateKey: " + authState.StateKey);
            await _authStateRepository.SaveAuthStateAsync(authState);
            return new StatusCodeResult(204);
        }
    }
}
