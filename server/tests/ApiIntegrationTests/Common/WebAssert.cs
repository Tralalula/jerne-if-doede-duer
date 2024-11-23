using System.Text.Json;
using Generated;
using Microsoft.AspNetCore.Mvc;

namespace ApiIntegrationTests.Common;

public class WebAssert
{
   public static async Task ThrowsProblemAsync<T>(Func<Task> action, int expectedStatusCode, string expectedType)
   {
      var exception = await Assert.ThrowsAsync<ApiException>(action);
      Assert.Equal(expectedStatusCode, exception.StatusCode);
      
      var problem = JsonSerializer.Deserialize<ProblemDetails>(exception.Response);
      Assert.Equal(expectedType, problem?.Type);
   }
}