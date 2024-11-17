using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;

using Service.Exceptions;

namespace API.ExceptionHandler;

public class ExceptionToProblemDetailsHandler(IProblemDetailsService problemDetailsService) : IExceptionHandler
{
    
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    { 
        httpContext.Response.StatusCode = exception switch
        {
            ValidationException => StatusCodes.Status400BadRequest, // FluentValidator exception
            BadRequestException => StatusCodes.Status400BadRequest,
            UnauthorizedException => StatusCodes.Status401Unauthorized,
            NotFoundException => StatusCodes.Status404NotFound,
            ConflictException => StatusCodes.Status409Conflict,
            _ => StatusCodes.Status500InternalServerError
        };

       var problemDetails = new ProblemDetailsContext
       {
           HttpContext = httpContext,
           ProblemDetails =
           {
               Title = GetTitleForException(exception),
               Detail = GetDetailForException(exception),
               Type = exception.GetType().Name,
               Instance = httpContext.Request.Path,
               Extensions = { ["traceId"] = httpContext.TraceIdentifier }
           },
           Exception = exception
       };
       
       if (exception is ValidationException validationException)
       {
            problemDetails.ProblemDetails.Extensions["errors"] = validationException.Errors.Select(e => new
            {
                Field = e.PropertyName,
                Error = e.ErrorMessage
            });
       }

       return await problemDetailsService.TryWriteAsync(problemDetails);
    }
    
    private static string GetTitleForException(Exception exception)
    {
        return exception switch
        {
            ValidationException => "Validation failed",
            UnauthorizedException => "Unauthorized access",
            NotFoundException => "Resource not found",
            ConflictException => "Conflict occurred",
            _ => "An internal error occurred"
        };
    }
    
    private static string GetDetailForException(Exception exception) => exception switch
    {
        ValidationException => "One or more validation errors occurred.",
        _ => exception.Message
    };
}