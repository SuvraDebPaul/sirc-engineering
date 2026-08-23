"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";

import { answerQuestionAction } from "@/features/enquiries/actions/answer-question";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AnswerQuestionForm({ questionId }: { questionId: string }) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await answerQuestionAction(questionId, answer);
      if (result?.error) setError(result.error);
      else router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <Textarea
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        rows={3}
        placeholder="Write the public answer…"
        required
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="size-4" aria-hidden="true" />
        )}
        Publish answer
      </Button>
    </form>
  );
}
