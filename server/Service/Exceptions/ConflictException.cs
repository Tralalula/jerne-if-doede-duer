namespace Service.Exceptions;

[Serializable]
public class ConflictException : Exception
{
    public ConflictException()
    {
    }

    public ConflictException(string message) : base(message)
    {
    }

    public ConflictException(string message, Exception inner) : base(message, inner)
    {
    }

    public static ConflictException FromJson(dynamic json)
    {
        const string text = "";

        return new ConflictException(text);
    }
}