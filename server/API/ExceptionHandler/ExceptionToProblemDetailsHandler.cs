using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;

using Service.Exceptions;

namespace API.ExceptionHandler;

public class ExceptionToProblemDetailsHandler(IProblemDetailsService problemDetailsService, ILogger<ExceptionToProblemDetailsHandler> logger) : IExceptionHandler
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
            TooManyRequestsException => StatusCodes.Status429TooManyRequests, 
            _ => StatusCodes.Status500InternalServerError
        };
        
        LogException(exception, httpContext);
        
        if (exception is TooManyRequestsException tooManyRequestsException)
        {
            httpContext.Response.Headers.RetryAfter = tooManyRequestsException.RetryAfterSeconds.ToString();
            httpContext.Response.Headers.Append("X-RateLimit-Reset", DateTime.UtcNow.AddSeconds(tooManyRequestsException.RetryAfterSeconds).ToString("R"));
        }
        
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

    private void LogException(Exception exception, HttpContext httpContext) 
    {
        switch (exception)
        {
            case UnauthorizedException:
            case ValidationException:
            case TooManyRequestsException:
                logger.LogWarning(
                    "API Security Event: {ExceptionType}. Path: {Path}, TraceId: {TraceId}",
                    exception.GetType().Name,
                    httpContext.Request.Path,
                    httpContext.TraceIdentifier);
                break;
                
            case NotFoundException:
                logger.LogInformation(
                    "Resource Not Found. Path: {Path}, TraceId: {TraceId}",
                    httpContext.Request.Path,
                    httpContext.TraceIdentifier);
                break;
                
            default:
                logger.LogError(exception,
                    "Unhandled Exception. Path: {Path}, TraceId: {TraceId}",
                    httpContext.Request.Path,
                    httpContext.TraceIdentifier);
                break;
        }
    }

    private static string GetTitleForException(Exception exception)
    {
        return exception switch
        {
            ValidationException => "Validation failed",
            UnauthorizedException => "Unauthorized access",
            NotFoundException => "Resource not found",
            ConflictException => "Conflict occurred",
            TooManyRequestsException => "Too many requests",
            _ => "An internal error occurred"
        };
    }
    
    private static string GetDetailForException(Exception exception) => exception switch
    {
        ValidationException => "One or more validation errors occurred.",
        _ => exception.Message
    };
}