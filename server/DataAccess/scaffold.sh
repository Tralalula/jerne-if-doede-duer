#!/bin/bash
dotnet ef dbcontext scaffold \
  "Server=localhost;Database=jerneif;User Id=user;Password=pass;" \
  Npgsql.EntityFrameworkCore.PostgreSQL \
  --output-dir ./Models \
  --context-dir . \
  --context AppDbContext  \
  --no-onconfiguring \
  --data-annotations \
  --force