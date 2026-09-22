"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AnswerSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import type { z } from "zod";
import dynamic from "next/dynamic";
import { createAnswer } from "@/lib/actions/answer.action";
import Image from "next/image";

type AnswerFormValues = z.infer<typeof AnswerSchema>;

const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false,
});

interface Params {
  questionId: string;
}

export default function AnswerForm({ questionId }: Params) {
  const [isPending, startTransition] = useTransition();
  const [editorKey, setEditorKey] = useState(0);

  const form = useForm<AnswerFormValues>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      content: "",
    },
  });

  const handleSubmit = (data: AnswerFormValues) => {
    startTransition(async () => {
      const result = await createAnswer({ questionId, ...data });

      if (result.success) {
        toast.success("Answer submitted successfully.");
        form.reset();
        setEditorKey((key) => key + 1);
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
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <FieldGroup>
        <Controller
          name="content"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
                <h4 className="paragraph-semibold text-dark400_light800">
                  Write your answer here
                </h4>
                <Button
                  type="button"
                  disabled
                  className="btn light-border-2 gap-1.5 rounded-md border px-4 py-2.5 text-primary-500 shadow-none dark:text-primary-500"
                >
                  <Image
                    src="/icons/stars.svg"
                    alt="Generate AI answer"
                    width={12}
                    height={12}
                    className="object-contain"
                  />
                  Generate AI answer
                </Button>
              </div>
              <FieldLabel htmlFor="content" className="sr-only">
                Answer content
              </FieldLabel>
              <Editor
                key={editorKey}
                value={field.value}
                editorRef={null}
                fieldChange={field.onChange}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
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
            <>Submit Answer</>
          )}
        </Button>
      </div>
    </form>
  );
}
