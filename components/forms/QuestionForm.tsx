"use client";

import { useRef, useState, useTransition, type KeyboardEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { AskQuestionSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { z } from "zod";
import { MDXEditorMethods } from "@mdxeditor/editor";
import dynamic from "next/dynamic";
import TagCard from "../cards/TagCard";
import { createQuestion, editQuestion } from "@/lib/actions/question.action";
import { useRouter } from "next/navigation";
import ROUTES from "@/constants/routes";

type QuestionFormValues = z.infer<typeof AskQuestionSchema>;

const Editor = dynamic(() => import("@/components/editor"), {
  // Make sure we turn SSR off
  ssr: false,
});

const MAX_TAGS = 3;
const MAX_TAG_LENGTH = 15;

interface Params {
  question?: Question;
  isEdit?: boolean;
}

export default function QuestionForm({ question, isEdit = false }: Params) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const editorRef = useRef<MDXEditorMethods>(null);
  const [tagInput, setTagInput] = useState("");

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(AskQuestionSchema),
    defaultValues: {
      title: question?.title || "",
      content: question?.content || "",
      tags: question?.tags.map((tag) => tag.name) || [],
    },
  });

  const handleCreateQuestion = async (data: QuestionFormValues) => {
    startTransition(async () => {
      if (isEdit && question) {
        const result = await editQuestion({
          questionId: question?._id,
          ...data,
        });
        if (result.success) {
          toast.success("Question updated successfully.");
          if (result.data) router.push(ROUTES.QUESTION(result.data._id));
        } else {
          toast.error(
            `${result.status}: ${result.error?.message || "something went wrong"}`,
          );
        }
        return;
      }
      const result = await createQuestion(data);

      if (result.success) {
        toast.success("Question created successfully.");
        if (result.data) router.push(ROUTES.QUESTION(result.data._id));
      } else {
        toast.error(
          `${result.status}: ${result.error?.message || "something went wrong"}`,
        );
      }
    });
  };

  return (
    <form
      className="flex w-full flex-col gap-10"
      onSubmit={form.handleSubmit(handleCreateQuestion)}
    >
      <FieldGroup>
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="title">
                Question Title <span className="text-primary-500">*</span>
              </FieldLabel>
              <Input
                {...field}
                id="title"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                placeholder="e.g. How does React's useEffect cleanup work?"
                className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="content"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="content">
                Detailed Explanation of your problem{" "}
                <span className="text-primary-500">*</span>
              </FieldLabel>
              <Editor
                value={field.value}
                editorRef={editorRef}
                fieldChange={field.onChange}
              />
            </Field>
          )}
        />

        <Controller
          name="tags"
          control={form.control}
          render={({ field, fieldState }) => {
            const handleAddTag = (e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key !== "Enter") return;
              e.preventDefault();

              const newTag = tagInput.trim();
              if (!newTag) return;

              if (newTag.length > MAX_TAG_LENGTH) {
                toast.warning(
                  `Tags must be ${MAX_TAG_LENGTH} characters or less.`,
                );
                return;
              }

              if (field.value.length >= MAX_TAGS) {
                toast.warning(`You can only add up to ${MAX_TAGS} tags.`);
                return;
              }

              if (field.value.includes(newTag)) {
                setTagInput("");
                return;
              }

              field.onChange([...field.value, newTag]);
              setTagInput("");
            };

            const handleRemoveTag = (tagToRemove: string) => {
              field.onChange(
                field.value.filter((tag: string) => tag !== tagToRemove),
              );
            };

            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="tags">
                  Tags <span className="text-primary-500">*</span>
                </FieldLabel>
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  disabled={field.value.length >= MAX_TAGS}
                  placeholder={
                    field.value.length >= MAX_TAGS
                      ? `Maximum of ${MAX_TAGS} tags reached`
                      : "Type a tag and press Enter"
                  }
                  className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                />
                {field.value.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-2.5">
                    {field.value.map((tag: string) => (
                      <TagCard
                        key={tag}
                        _id={tag}
                        name={tag}
                        compact
                        remove
                        isButton
                        handleRemove={() => handleRemoveTag(tag)}
                      />
                    ))}
                  </div>
                )}
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            );
          }}
        />
      </FieldGroup>

      <div className="mt-16 flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          className="primary-gradient paragraph-medium min-h-12 rounded-2 px-4 py-3 font-inter text-light-900! w-fit"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin aria-hidden:true"></Loader2>
              <span>Submitting...</span>
            </>
          ) : (
            <>{isEdit ? "Edit" : "Ask a Question"}</>
          )}
        </Button>
      </div>
    </form>
  );
}
