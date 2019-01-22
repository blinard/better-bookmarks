FROM microsoft/dotnet:2.2-aspnetcore-runtime AS base
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends unzip procps \
    && rm -rf /var/lib/apt/lists/* \
    && curl -sSL https://aka.ms/getvsdbgsh | bash /dev/stdin -v latest -l /vsdbg
EXPOSE 80
EXPOSE 443

FROM microsoft/dotnet:2.2-sdk AS build
WORKDIR /src

COPY ["BetterBookmarks.Service.csproj", "./"]
RUN dotnet restore "./BetterBookmarks.Service.csproj"
COPY . .
RUN dotnet build "BetterBookmarks.Service.csproj" -c Debug -o /app

FROM build AS publish
RUN dotnet publish "BetterBookmarks.Service.csproj" -c Debug -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "BetterBookmarks.Service.dll"]
