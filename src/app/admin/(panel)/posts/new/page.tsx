import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { Loading } from "@/components/admin/ui";
import { PostEditor } from "../PostEditor";

export const metadata = { title: "New post" };

export default function NewPostPage() {
  return (
    <Suspense fallback={<Loading />}>
      <New />
    </Suspense>
  );
}

async function New() {
  await requireAdmin();
  return <PostEditor post={null} />;
}
