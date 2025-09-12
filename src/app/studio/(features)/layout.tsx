import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getQueryClient, HydrateClient } from "@/lib/query";
import { browserClient } from "@/lib/rpc";

type TrackTablePrefetchProps = {
  children: React.ReactNode;
};

function TrackTablePrefetch({ children }: TrackTablePrefetchProps) {
  const queryClient = getQueryClient();
  queryClient.prefetchQuery(browserClient.track.findUserTracks.queryOptions());
  return <HydrateClient client={queryClient}>{children}</HydrateClient>;
}

function TrackTableSkeleton() {
  return (
    <section className="container relative flex h-full max-w-(--breakpoint-lg) flex-col gap-4 py-4">
      <div className="flex w-full items-end justify-between gap-2">
        <Skeleton className="h-full w-64 max-w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div>
        <div className="flex items-center py-4">
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[450px]">Track Name</TableHead>
                  <TableHead className="w-48">Status</TableHead>
                  <TableHead className="min-w-48" />
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="h-16">
                  <TableCell>
                    <Skeleton className="h-8 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-32" />
                  </TableCell>
                </TableRow>
                <TableRow className="h-16">
                  <TableCell>
                    <Skeleton className="h-8 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-32" />
                  </TableCell>
                </TableRow>
                <TableRow className="h-16">
                  <TableCell>
                    <Skeleton className="h-8 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-32" />
                  </TableCell>
                </TableRow>
                <TableRow className="h-16">
                  <TableCell>
                    <Skeleton className="h-8 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-32" />
                  </TableCell>
                </TableRow>
                <TableRow className="h-16">
                  <TableCell>
                    <Skeleton className="h-8 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-32" />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
}

interface StudioFeaturesLayoutProps {
  children: React.ReactNode;
}

export default async function StudioFeaturesLayout({
  children,
}: StudioFeaturesLayoutProps) {
  return (
    /* Here we don't add more `loading.tsx` or Suspense down the tree because we have
            already determined if a good connection has been made through the prefetchQuery */
    <Suspense fallback={<TrackTableSkeleton />}>
      <TrackTablePrefetch>{children}</TrackTablePrefetch>
    </Suspense>
  );
}
