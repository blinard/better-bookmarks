FROM microsoft/dotnet:2.2-sdk AS build-env
ARG buildConfiguration=Debug
WORKDIR /bb.server

# Copy csproj and restore as distinct layers
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and build
COPY . ./
RUN dotnet publish -c ${buildConfiguration} -o publish

# Build runtime image
FROM microsoft/dotnet:2.2-aspnetcore-runtime
WORKDIR /bb.server
COPY --from=build-env /bb.server/publish .
ENTRYPOINT ["dotnet", "BetterBookmarks.Service.dll"]