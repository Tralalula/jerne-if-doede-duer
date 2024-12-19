using System.Globalization;
using DataAccess;
using DataAccess.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Service.Exceptions;
using Service.Models.Requests;
using Service.Models.Responses;

namespace Service;

public interface IBoardService
{
    public Task<BoardPickResponse> PlaceBoardBetAsync(BoardPickRequest board, Guid userId);
    public Task<GameStatusResponse> GetGameStatusAsync(Guid userId);
    public Task<BoardWinningSequenceConfirmedResponse> ConfirmWinningSequence(BoardWinningSequenceRequest request, Guid userId);

    public Task<BoardWinningSequenceResponse> PickWinningSequenceAsync(BoardWinningSequenceRequest request, Guid userId);
}

public class BoardService(AppDbContext context, UserManager<User> userManager, TimeProvider timeProvider) : IBoardService
{
    public void ValidateBoard(List<int> numbers)
    {
        int count = numbers.Count;
        if (count < 5 || count > 8)
            throw new BadRequestException("You must pick between 5 and 8 numbers.");

        if (numbers.Any(n => n < 1 || n > 16))
            throw new BadRequestException("Selected numbers must be within the range 1-16.");

        if (numbers.Distinct().Count() != count)
            throw new BadRequestException("Selected numbers must be unique.");
    }

    public async Task<Game?> GetActiveGameAsync()
    {
        var currentTime = timeProvider.GetUtcNow().UtcDateTime;

        var game = await context.Games
            .Where(game => game.StartTime <= currentTime && currentTime <= game.EndTime && game.Active)
            .FirstOrDefaultAsync();
        
        return game;
    }
    
    public int GetBoardPrice(int length)
    {
        return length switch
        {
            5 => 20,
            6 => 40,
            7 => 80,
            8 => 160,
            _ => throw new ArgumentException("Invalid board pick.")
        };
    }
    
    private bool IsWithinRestrictedTime(TimeProvider timeProvider)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;
        var timeZone = TimeZoneInfo.FindSystemTimeZoneById("Central European Standard Time");
        var localNow = TimeZoneInfo.ConvertTimeFromUtc(now, timeZone);

        // tidspunkt imellem: lørdag 17:00 til mandag 00:00
        var isSaturdayAfterFive = localNow.DayOfWeek == DayOfWeek.Saturday && localNow.TimeOfDay >= new TimeSpan(17, 0, 0);
        var isSunday = localNow.DayOfWeek == DayOfWeek.Sunday;
        var isMondayBeforeMidnight = localNow.DayOfWeek == DayOfWeek.Monday && localNow.TimeOfDay < new TimeSpan(0, 0, 0);

        return isSaturdayAfterFive || isSunday || isMondayBeforeMidnight;
    }
    
    private DateTime GetNextMondayAtMidnight(TimeProvider timeProvider)
    {
        var today = timeProvider.GetUtcNow().UtcDateTime;
        var daysUntilMonday = ((int)DayOfWeek.Monday - (int)today.DayOfWeek + 7) % 7;
        if (daysUntilMonday == 0)
            daysUntilMonday = 7;
        
        return today.AddDays(daysUntilMonday).AddHours(-today.Hour).AddMinutes(-today.Minute).AddSeconds(-today.Second);
    }
    
    private bool AreNumbersMatching(List<int> boardNumbers, List<int> selectedNumbers)
    {
        if (boardNumbers == null || selectedNumbers == null || !boardNumbers.Any())
            return false;

        return selectedNumbers.All(selectedNumber => boardNumbers.Contains(selectedNumber));
    }
    
    public async Task<BoardPickResponse> PlaceBoardBetAsync(BoardPickRequest board, Guid userId)
    {
        if (IsWithinRestrictedTime(timeProvider))
            throw new UnauthorizedException("Du kan ikke købe et bræt på nuværende tidspunkt.");
        
        var user = await userManager.FindByIdAsync(userId.ToString()) ?? throw new NotFoundException("Bruger ikke fundet");
        
        if (user.Status == UserStatus.Inactive)
            throw new UnauthorizedException("Du har ikke tilladelse til at købe et bræt.");
        
        if (board.Amount <= 0)
            throw new BadRequestException("Du skal mindst købe 1 bræt.");

        var totalPrice = GetBoardPrice(board.SelectedNumbers.Count) * board.Amount;
        
        if (user.Credits < totalPrice)
            throw new BadRequestException("Du har ikke nok credits til at købe dette bræt.");

        board.SelectedNumbers = board.SelectedNumbers.OrderBy(n => n).ToList();
        ValidateBoard(board.SelectedNumbers);

        var game = await GetActiveGameAsync();
        
        if (game == null)
            throw new NotFoundException("Ingen aktiv spil fundet.");

        var purchase = board.ToPurchase(timeProvider, totalPrice);

        var newBoards = new List<Board>();
        using (var transaction = await context.Database.BeginTransactionAsync())
        {
            try
            {
                user.Credits -= totalPrice;
                context.Users.Update(user);

                context.Purchases.Add(purchase);
                await context.SaveChangesAsync();
                
                for (int i = 0; i < board.Amount; i++)
                {
                    var newBoard = board.ToBoard(user, game, timeProvider, purchase);
                    newBoards.Add(newBoard);
                }
                
                await context.Boards.AddRangeAsync(newBoards);
                await context.SaveChangesAsync();
                
                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw new BadRequestException($"En fejl skete ved køb af bræt.");
            }
        }
        if (!newBoards.Any())
            throw new Exception("Ingen boards blev oprettet.");
        
        return BoardPickResponse.FromEntity(purchase, newBoards.First(), newBoards.Count);
    }
    
    public async Task<GameStatusResponse> GetGameStatusAsync(Guid userId)
    {
        var user = await userManager.FindByIdAsync(userId.ToString()) ?? throw new NotFoundException("Bruger ikke fundet");
        var game = await GetActiveGameAsync();
        
        var currentTime = timeProvider.GetUtcNow().UtcDateTime;
        
        var status = new GameStatusResponse
        {
            GameWeek = game?.FieldCount != null
                ? game.FieldCount
                : 0,
            IsGameActive = game != null 
                           && !IsWithinRestrictedTime(timeProvider) 
                           && user.Status == UserStatus.Active,
            StartTime = game?.StartTime != null
                ? new DateTimeOffset(game.StartTime).ToUnixTimeSeconds()
                : new DateTimeOffset(GetNextMondayAtMidnight(timeProvider)).ToUnixTimeSeconds(),
            EndTime = game?.EndTime != null
                ? new DateTimeOffset(game.EndTime).ToUnixTimeSeconds()
                : null,
            TimeLeft = game != null && game.EndTime > currentTime
                ? (int)(game.EndTime - currentTime).TotalSeconds
                : 0
        };
        
        return status;
    }

    private async Task<List<BoardResponse>> GetWinningBoardsAsync(List<int> selectedNumbers)
    {
        var game = await GetActiveGameAsync();
        
        if (game == null)
            throw new NotFoundException("Ingen aktive spil fundet.");
        
        var matchingBoards = await context.Boards
            .Where(board => board.GameId == game.Id)
            .ToListAsync();

        var matchedBoards = matchingBoards
            .Where(board => AreNumbersMatching(board.Configuration, selectedNumbers))
            .ToList();

        var boardResponses = matchedBoards
            .Select(board => new
            {
                board,
                User = context.Users.FirstOrDefault(u => u.Id == board.UserId)
            })
            .Select(result => new BoardResponse
            {
                BoardId = result.board.Id,
                Configuration = result.board.Configuration.OrderBy(n => n).ToList(),
                PlacedOn = result.board.Timestamp,
                Price = GetBoardPrice(result.board.Configuration.Count),
                User = result.User != null 
                    ? UserResponse.FromEntity(result.User) 
                    : null            
            })
            .ToList();
        
        return boardResponses;
    }

    public async Task<BoardWinningSequenceResponse> PickWinningSequenceAsync(BoardWinningSequenceRequest request, Guid userId)
    {
        var user = await userManager.FindByIdAsync(userId.ToString()) 
                   ?? throw new NotFoundException("Bruger ikke fundet");

        var boards = await GetWinningBoardsAsync(request.SelectedNumbers);
        
        var game = await GetActiveGameAsync();
        if (game == null)
            throw new BadRequestException("Ingen aktiv spil fundet.");

        return BoardWinningSequenceResponse.FromEntity(boards.Count, request.SelectedNumbers, game);
    }
    
    public async Task<BoardWinningSequenceConfirmedResponse> ConfirmWinningSequence(BoardWinningSequenceRequest request, Guid userId)
    {
        var user = await userManager.FindByIdAsync(userId.ToString()) 
                   ?? throw new NotFoundException("Bruger ikke fundet");
        
        var boards = await GetWinningBoardsAsync(request.SelectedNumbers);
        
        var game = await GetActiveGameAsync();
        
        if (game == null)
            throw new NotFoundException("Ingen aktiv spil fundet.");
        
        game.Active = false;

        var startTime = timeProvider.GetUtcNow().UtcDateTime;
        
        var calendar = CultureInfo.CurrentCulture.Calendar;
        var dateTimeFormat = CultureInfo.CurrentCulture.DateTimeFormat;

        var nextWeekDate = startTime.AddDays(5);
        int nextWeekNumber = calendar.GetWeekOfYear(nextWeekDate, dateTimeFormat.CalendarWeekRule, dateTimeFormat.FirstDayOfWeek);

        var newGame = new Game
        {
            Timestamp = startTime,
            Active = true,
            EndTime = GetNextMondayAtMidnight(timeProvider),
            StartTime = startTime,
            FieldCount = nextWeekNumber
        };
        
        var winnerSequence = new WinnerSequence
        {
            GameId = game.Id,
            Timestamp = startTime,
            Sequence = request.SelectedNumbers
        };
        
        await context.WinnerSequences.AddAsync(winnerSequence);
        await context.Games.AddAsync(newGame);
        await context.SaveChangesAsync();
        
        var response = new BoardWinningSequenceConfirmedResponse
        {
            Boards = boards,
            GameId = game.Id,
            GameWeek = game.FieldCount,
            TotalWinners = boards.Count
        };

        return response;
    }    
}