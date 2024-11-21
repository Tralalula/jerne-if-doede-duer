$connectionString = "Server=localhost;Database=jerneif;User Id=user;Password=pass;"
$context = "AppDbContext"
$identityUserFilePath = "Models/AspNetUser.cs"

$tables = @("AspNetUsers", "games", "purchases", "transactions", "boards", "autoplay_boards", "pot", "winner_sequences", "user_history", "balance_history", "refresh_tokens")

$scaffoldCommand = "dotnet ef dbcontext scaffold `"$connectionString`" Npgsql.EntityFrameworkCore.PostgreSQL --output-dir Models --context-dir . --context $context --no-onconfiguring --data-annotations --force"

foreach ($table in $tables) {
  $scaffoldCommand += " -t $table"
}

Invoke-Expression $scaffoldCommand

(Get-Content "$context.cs") -replace ": DbContext", ": IdentityDbContext<User, Role, Guid>" | Set-Content "$context.cs"

$usings = @"
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

"@

$existingContent = Get-Content "$context.cs" | Out-String
Set-Content "$context.cs" -Value "$usings$existingContent"

$content = Get-Content "$context.cs" -Raw
$content = $content -replace "OnModelCreatingPartial\(modelBuilder\);", "base.OnModelCreating(modelBuilder);"
Set-Content "$context.cs" -Value $content

(Get-Content $identityUserFilePath -Raw) `
    -replace "\[Index\(""NormalizedEmail"".*?\]\r?\n", "" `
    -replace "\[Index\(""NormalizedUserName"".*?\]\r?\n", "" `
    -replace "AspNetUser", "User" `
    | Set-Content $identityUserFilePath

$userContent = Get-Content $identityUserFilePath -Raw
$replacement = '$1' + "`n    [InverseProperty"
$userContent = $userContent -replace "(?s)(public partial class User\s*\{).*?\[InverseProperty", $replacement
Set-Content $identityUserFilePath -Value $userContent

$modelsDirectory = "Models"

$csFiles = Get-ChildItem $modelsDirectory -Filter "*.cs" | Where-Object {
  $_.Name -notmatch "^(AspNetUser|User|Role)\.cs$"
}

foreach ($file in $csFiles) {
  Write-Host "Processing file: $($file.FullName)"
  $fileContent = Get-Content $file.FullName -Raw
  $updatedContent = $fileContent -replace "\bAspNetUser\b", "User"
  Set-Content $file.FullName -Value $updatedContent
}

Write-Host "Replacement complete!"

$appDbContextContent = Get-Content "$context.cs" -Raw
$appDbContextContent = $appDbContextContent -replace "\s*public virtual DbSet<AspNetUser> AspNetUsers \{ get; set; \}\r?\n", ""
$appDbContextContent = $appDbContextContent -replace "(?s)modelBuilder\.Entity<AspNetUser>\(.*?\}\);\r?\n", ""
Set-Content "$context.cs" -Value $appDbContextContent