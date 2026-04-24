import { SkeletonCard } from "@/components/ui/Skeleton";
export default function Loading() {
  return (
    <div className="p-6 space-y-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
