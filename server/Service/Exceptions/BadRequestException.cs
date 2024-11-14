namespace Service.Exceptions;

[Serializable]
public class BadRequestException : Exception
{
    public BadRequestException()
    {
    }

    public BadRequestException(string message) : base(message)
    {
    }

    public BadRequestException(string message, Exception inner) : base(message, inner)
    {
    }

    public static BadRequestException FromJson(dynamic json)
    {
        const string text = "";

        return new BadRequestException(text);
    }
}