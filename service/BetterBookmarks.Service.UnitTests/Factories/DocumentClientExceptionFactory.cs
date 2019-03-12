using System;
using System.Net;
using System.Reflection;
using Microsoft.Azure.Documents;
using BindingFlags = System.Reflection.BindingFlags;

namespace BetterBookmarks.Service.UnitTests.Factories
{
    public static class DocumentClientExceptionFactory
    {
        public static DocumentClientException CreateDocumentClientException(string message, HttpStatusCode statusCode)
        {
            //DocumentClientException constructor is internal to the Azure.Documents assembly. Need to use reflection to create one. :/
            var dceType = typeof(DocumentClientException);
            var constructor = dceType.GetConstructor(BindingFlags.NonPublic, null, new Type[] {typeof(string), typeof(Exception), typeof(Nullable<HttpStatusCode>), typeof(Uri), typeof(string)}, new ParameterModifier[0]);
            var exception = (DocumentClientException) constructor.Invoke(new object[] {message, null, statusCode});
            return exception;
        }
    }
}