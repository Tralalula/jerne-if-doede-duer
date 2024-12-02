namespace Service.Exceptions;

[Serializable]
public class TooManyRequestsException : Exception
{
    public int RetryAfterSeconds { get; }

    public TooManyRequestsException() : this("Too many requests")
    {
    }

    public TooManyRequestsException(string message, int retryAfterSeconds = 3600) : base(message)
    {
        RetryAfterSeconds = retryAfterSeconds;
    }

    public TooManyRequestsException(string message, Exception inner) : base(message, inner)
    {
        RetryAfterSeconds = 3600;
    }

    public TooManyRequestsException(string message, Exception inner, int retryAfterSeconds) : base(message, inner)
    {
        RetryAfterSeconds = retryAfterSeconds;
    }
    
    public static TooManyRequestsException FromJson(dynamic json)
    {
        const string text = "";
        return new TooManyRequestsException(text);
    }
}