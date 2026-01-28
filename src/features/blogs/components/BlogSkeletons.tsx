import * as React from "react";
import { Card, CardContent, Skeleton, Stack } from "@mui/material";

export function StoriesSkeleton({ count = 5 }: { count?: number }) {
  return (
    <Stack spacing={1.5}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ display: "flex", gap: 2 }}>
            <Stack sx={{ flex: 1 }}>
              <Skeleton variant="text" width="70%" height={28} />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="55%" />
              <Skeleton
                variant="rounded"
                width={140}
                height={30}
                sx={{ mt: 1 }}
              />
            </Stack>
            <Skeleton
              variant="rounded"
              width={150}
              height={86}
              sx={{ borderRadius: 2 }}
            />
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

export function BestPicksSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Stack spacing={1.25}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <Skeleton variant="text" width="85%" />
            <Skeleton variant="text" width="55%" />
            <Skeleton variant="text" width="35%" />
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
