namespace Service.Exceptions;

[Serializable]
public class UnauthorizedException : Exception
{
    public UnauthorizedException()
    {
    }

    public UnauthorizedException(string message) : base(message)
    {
    }

    public UnauthorizedException(string message, Exception inner) : base(message, inner)
    {
    }

    public static UnauthorizedException FromJson(dynamic json)
    {
        const string text = "";

        return new UnauthorizedException(text);
    }
}