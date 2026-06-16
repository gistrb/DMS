# Stage 1: Build React frontend
FROM node:22-alpine AS frontend-build
WORKDIR /frontend
COPY DMS.Frontend/package*.json ./
RUN npm ci
COPY DMS.Frontend/ .
RUN npm run build

# Stage 2: Build .NET backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /backend
COPY DMS.Backend/*.csproj ./
RUN dotnet restore
COPY DMS.Backend/ .
RUN dotnet publish -c Release -o /publish

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=backend-build /publish .
COPY --from=frontend-build /frontend/dist wwwroot
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "DMS.Backend.dll"]
