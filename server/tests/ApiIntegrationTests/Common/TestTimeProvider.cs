namespace ApiIntegrationTests.Common;

public class TestTimeProvider(DateTimeOffset initialTime) : TimeProvider
{
    public override DateTimeOffset GetUtcNow() => initialTime;

    public void Advance(TimeSpan duration)
    {
        initialTime = initialTime.Add(duration);
    }
}