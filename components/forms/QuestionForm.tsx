"use client";

import { useState, type KeyboardEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { X } from "lucide-react";

import { AskQuestionSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { z } from "zod";

type QuestionFormValues = z.infer<typeof AskQuestionSchema>;

export default function QuestionForm() {
  const [tagInput, setTagInput] = useState("");

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(AskQuestionSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: [],
    },
  });

  const handleCreateQuestion = (data: QuestionFormValues) => {
    console.log(data);
    // TODO: call your server action / API route here
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
              <FieldLabel htmlFor="title">Question Title <span className="text-primary-500">*</span></FieldLabel>
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
              <FieldLabel htmlFor="content">Detailed Explanation <span className="text-primary-500">*</span></FieldLabel>
              Editor
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
              if (field.value.includes(newTag)) {
                setTagInput("");
                return;
              }

              field.onChange([...field.value, newTag]);
              setTagInput("");
            };

            const handleRemoveTag = (tagToRemove: string) => {
              field.onChange(field.value.filter((tag: string) => tag !== tagToRemove));
            };

            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="tags">Tags <span className="text-primary-500">*</span></FieldLabel>
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  placeholder="Type a tag and press Enter"
                  className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                />
                {field.value.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-2.5">
                    {field.value.map((tag: string) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="subtle-medium background-light800_dark300 text-light400_light500 flex items-center gap-2 rounded-md border-none px-4 py-2 capitalize"
                      >
                        {tag}
                        <X size={12} />
                      </button>
                    ))}
                  </div>
                )}
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            );
          }}
        />
      </FieldGroup>

      <div className="mt-16 flex justify-end">
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="primary-gradient paragraph-medium min-h-12 rounded-2 px-4 py-3 font-inter text-light-900! w-fit"
        >
          {form.formState.isSubmitting ? "Submitting..." : "Ask a Question"}
        </Button>
      </div>
    </form>
  );
}