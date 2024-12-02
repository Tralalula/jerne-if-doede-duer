using System.Text.Json;
using Generated;
using Microsoft.AspNetCore.Http;
using ProblemDetails = Microsoft.AspNetCore.Mvc.ProblemDetails;

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
    
    public static async Task ThrowsValidationAsync(Func<Task> action)
    {
        var exception = await Assert.ThrowsAsync<ApiException>(action);
        Assert.Equal(StatusCodes.Status400BadRequest, exception.StatusCode);

        var problem = JsonSerializer.Deserialize<ProblemDetails>(exception.Response);
        Assert.NotNull(problem);
    }
}