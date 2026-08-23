"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";

import {
  blogPostSchema,
  type BlogPostInput,
  type PostBlockInput,
} from "@/features/content/schemas/blog-post.schema";
import { createBlogPostAction } from "@/features/content/actions/create-blog-post";
import { updateBlogPostAction } from "@/features/content/actions/update-blog-post";
import { slugify } from "@/lib/slugify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** The scalar fields RHF manages directly. `tags` and `blocks` are built from
    separate local state at submit time — see the note above `BlockRow`. */
type ScalarFields = Omit<BlogPostInput, "tags" | "blocks">;

const BLOCK_TYPE_LABEL: Record<PostBlockInput["type"], string> = {
  p: "Paragraph",
  h2: "Heading",
  quote: "Quote",
  ul: "Bullet list",
};

/**
 * One row in the block editor.
 *
 * Carries both `text` and `items` regardless of type so the row's shape
 * never changes as the admin switches the type dropdown — only which field
 * is shown and read changes. Converted to the real tagged-union `PostBlockInput`
 * at submit time.
 */
interface BlockRow {
  key: string;
  type: PostBlockInput["type"];
  text: string;
  /** Newline-separated — one bullet per line — only read when type is "ul". */
  items: string;
}

const blockToRow = (block: PostBlockInput, key: string): BlockRow =>
  block.type === "ul"
    ? { key, type: "ul", text: "", items: block.items.join("\n") }
    : { key, type: block.type, text: block.text, items: "" };

const rowToBlock = (row: BlockRow): PostBlockInput =>
  row.type === "ul"
    ? {
        type: "ul",
        items: row.items
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      }
    : { type: row.type, text: row.text.trim() };

type BlogPostRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  status: string;
  publishedAt: Date;
  tags: unknown;
  blocks: unknown;
  imageUrl: string;
};

export function BlogPostForm({ post }: { post?: BlogPostRecord }) {
  const router = useRouter();
  const idPrefix = useId();
  const [formError, setFormError] = useState<string | null>(null);
  // Editing an existing post starts "touched" — see the identical note in
  // `product-form.tsx`. Only a genuinely new post auto-fills its slug.
  const [slugTouched, setSlugTouched] = useState(!!post);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(post?.imageUrl ?? null);

  const [tagsText, setTagsText] = useState(
    Array.isArray(post?.tags) ? (post.tags as string[]).join(", ") : "",
  );

  const [blocks, setBlocks] = useState<BlockRow[]>(() => {
    const initial = Array.isArray(post?.blocks) ? (post.blocks as PostBlockInput[]) : [];
    return initial.length > 0
      ? initial.map((block, index) => blockToRow(block, `${index}`))
      : [{ key: "0", type: "p", text: "", items: "" }];
  });

  const {
    register,
    handleSubmit,
    setError,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ScalarFields>({
    resolver: zodResolver(blogPostSchema.omit({ tags: true, blocks: true })),
    defaultValues: {
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      excerpt: post?.excerpt ?? "",
      category: post?.category ?? "",
      author: post?.author ?? "",
      status: (post?.status as "DRAFT" | "PUBLISHED") ?? "DRAFT",
      publishedAt: (post?.publishedAt ?? new Date()).toISOString().slice(0, 10),
    },
  });

  const nameValue = useWatch({ control, name: "title" });
  const status = useWatch({ control, name: "status" });

  useEffect(() => {
    if (!slugTouched) setValue("slug", slugify(nameValue), { shouldValidate: false });
  }, [nameValue, slugTouched, setValue]);

  const addBlock = () =>
    setBlocks([...blocks, { key: `${Date.now()}`, type: "p", text: "", items: "" }]);
  const removeBlock = (index: number) => setBlocks(blocks.filter((_, i) => i !== index));
  const updateBlock = (index: number, patch: Partial<BlockRow>) =>
    setBlocks(blocks.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const [blocksError, setBlocksError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (scalarData) => {
    setFormError(null);
    setBlocksError(null);

    const tags = tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const postBlocks = blocks.map(rowToBlock);

    const parsed = blogPostSchema.safeParse({ ...scalarData, tags, blocks: postBlocks });
    if (!parsed.success) {
      const blockIssue = parsed.error.issues.find((issue) => issue.path[0] === "blocks");
      if (blockIssue) setBlocksError(blockIssue.message);
      return;
    }

    const result = post
      ? await updateBlogPostAction(post.id, parsed.data, imageFile)
      : await createBlogPostAction(parsed.data, imageFile);

    if (result?.errors) {
      const { form, image, tags: tagsErr, blocks: blocksErr, ...fieldErrors } = result.errors;
      if (form) setFormError(form);
      else if (image) setFormError(image);
      if (tagsErr) setFormError(tagsErr);
      if (blocksErr) setBlocksError(blocksErr);
      for (const [field, message] of Object.entries(fieldErrors)) {
        if (message) setError(field as keyof ScalarFields, { message });
      }
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-3xl space-y-8">
      {formError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {formError}
        </div>
      )}

      <section className="space-y-5">
        <h2 className="font-semibold tracking-tight">Basics</h2>

        <FormField name="title" label="Title" required error={errors.title?.message}>
          {(props) => <Input {...props} {...register("title")} />}
        </FormField>

        <FormField
          name="slug"
          label="Slug"
          required
          error={errors.slug?.message}
          hint="Auto-filled from the title — edit here to customize it."
        >
          {(props) => (
            <Input {...props} {...register("slug", { onChange: () => setSlugTouched(true) })} />
          )}
        </FormField>

        <FormField name="excerpt" label="Excerpt" required error={errors.excerpt?.message}>
          {(props) => <Textarea {...props} rows={3} {...register("excerpt")} />}
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField name="category" label="Category" required error={errors.category?.message}>
            {(props) => <Input {...props} placeholder="Calibration" {...register("category")} />}
          </FormField>
          <FormField name="author" label="Author" required error={errors.author?.message}>
            {(props) => <Input {...props} placeholder="SIRC Laboratory" {...register("author")} />}
          </FormField>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-status`}>Status</Label>
            <Select
              value={status}
              onValueChange={(value) =>
                setValue("status", value as "DRAFT" | "PUBLISHED", { shouldValidate: true })
              }
            >
              <SelectTrigger id={`${idPrefix}-status`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <FormField
            name="publishedAt"
            label="Publish date"
            required
            error={errors.publishedAt?.message}
          >
            {(props) => <Input {...props} type="date" {...register("publishedAt")} />}
          </FormField>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-tags`}>Tags</Label>
          <Input
            id={`${idPrefix}-tags`}
            value={tagsText}
            onChange={(event) => setTagsText(event.target.value)}
            placeholder="Calibration, Intervals, Drift, Compliance"
          />
          <p className="text-xs text-muted-foreground">Comma-separated.</p>
        </div>
      </section>

      <section className="space-y-2">
        <Label htmlFor="image">Cover image</Label>
        {imagePreview && (
          <Image
            src={imagePreview}
            alt=""
            width={320}
            height={180}
            unoptimized
            className="h-40 w-full max-w-sm rounded-md border bg-card object-cover"
          />
        )}
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              setImageFile(file);
              setImagePreview(URL.createObjectURL(file));
            }
          }}
          className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium"
        />
        {!post && <p className="text-xs text-muted-foreground">Required for a new post.</p>}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold tracking-tight">Content</h2>
          <Button type="button" variant="outline" size="sm" onClick={addBlock}>
            <Plus className="size-4" aria-hidden="true" />
            Add block
          </Button>
        </div>

        {blocksError && <p className="text-sm text-destructive">{blocksError}</p>}

        <div className="space-y-3">
          {blocks.map((row, index) => (
            <div key={row.key} className="space-y-2 rounded-xl border p-4">
              <div className="flex items-center justify-between gap-2">
                <Select
                  value={row.type}
                  onValueChange={(value) =>
                    updateBlock(index, { type: value as PostBlockInput["type"] })
                  }
                >
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(BLOCK_TYPE_LABEL) as PostBlockInput["type"][]).map((type) => (
                      <SelectItem key={type} value={type}>
                        {BLOCK_TYPE_LABEL[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeBlock(index)}
                  aria-label="Remove block"
                  disabled={blocks.length === 1}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>

              {row.type === "ul" ? (
                <Textarea
                  value={row.items}
                  onChange={(event) => updateBlock(index, { items: event.target.value })}
                  rows={4}
                  placeholder={"One bullet per line"}
                />
              ) : (
                <Textarea
                  value={row.text}
                  onChange={(event) => updateBlock(index, { text: event.target.value })}
                  rows={row.type === "h2" ? 1 : 4}
                  placeholder={
                    row.type === "h2"
                      ? "Section heading"
                      : row.type === "quote"
                        ? "Quoted text"
                        : "Paragraph text"
                  }
                />
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {isSubmitting ? "Saving…" : post ? "Save changes" : "Create post"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.push("/admin/blog")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
