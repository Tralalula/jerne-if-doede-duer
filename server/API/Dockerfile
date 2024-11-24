FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["server/API/API.csproj", "server/API/"]
COPY ["server/Service/Service.csproj", "server/Service/"]
COPY ["server/DataAccess/DataAccess.csproj", "server/DataAccess/"]
COPY ["server/SharedDependencies/SharedDependencies.csproj", "server/SharedDependencies/"]
RUN dotnet restore "server/API/API.csproj"
COPY . .
WORKDIR "/src/server/API"
RUN dotnet build "API.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "API.dll"]