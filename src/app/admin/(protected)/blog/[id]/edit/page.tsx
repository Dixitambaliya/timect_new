import BlogEditorForm from "../../BlogEditorForm";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = parseInt(id, 10);

  return <BlogEditorForm postId={postId} />;
}
