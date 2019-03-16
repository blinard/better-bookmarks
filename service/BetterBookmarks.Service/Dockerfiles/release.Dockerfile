FROM microsoft/dotnet:2.2-aspnetcore-runtime AS base
WORKDIR /app
EXPOSE 80

FROM microsoft/dotnet:2.2-sdk AS build
WORKDIR /src

COPY ["BetterBookmarks.Service.csproj", "./"]
RUN dotnet restore "./BetterBookmarks.Service.csproj"
COPY . .
RUN dotnet build "BetterBookmarks.Service.csproj" -c Release -o /app

FROM build AS publish
RUN dotnet publish "BetterBookmarks.Service.csproj" -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "BetterBookmarks.Service.dll", "--urls=http://0.0.0.0:80"]
