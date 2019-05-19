FROM microsoft/dotnet:2.2-sdk AS installer-env
ARG VERSION
ARG BUILDCONFIG=Debug

COPY . /src/dotnet-function-app
RUN cd /src/dotnet-function-app && \
    mkdir -p /home/site/wwwroot && \
    dotnet publish *.csproj --configuration ${BUILDCONFIG} --output /home/site/wwwroot /p:Version=${VERSION}

FROM mcr.microsoft.com/azure-functions/dotnet:2.0
ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true

COPY --from=installer-env ["/home/site/wwwroot", "/home/site/wwwroot"]