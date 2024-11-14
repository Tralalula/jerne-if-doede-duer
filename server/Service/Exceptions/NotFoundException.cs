namespace Service.Exceptions;

[Serializable]
public class NotFoundException : Exception
{
    public NotFoundException()
    {
    }

    public NotFoundException(string message) : base(message)
    {
    }

    public NotFoundException(string message, Exception inner) : base(message, inner)
    {
    }

    public static NotFoundException FromJson(dynamic json)
    {
        const string text = "";

        return new NotFoundException(text);
    }
}