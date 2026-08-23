import Link from "next/link";
import { HelpCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { EmptyState } from "@/components/shared/empty-state";
import { AnswerQuestionForm } from "@/features/enquiries/components/answer-question-form";
import { deleteQuestionAction } from "@/features/enquiries/actions/delete-question";
import { listQuestionsAdmin } from "@/features/enquiries/services/product-questions";
import { formatDate } from "@/lib/format";

const STATUSES = ["pending", "answered", "all"] as const;
type Status = (typeof STATUSES)[number];

const TAB_LABEL: Record<Status, string> = {
  pending: "Pending",
  answered: "Answered",
  all: "All",
};

export default async function AdminQuestionsPage({
  searchParams,
}: PageProps<"/admin/questions">) {
  const query = await searchParams;
  const statusRaw = Array.isArray(query.status) ? query.status[0] : query.status;
  const status: Status = STATUSES.includes(statusRaw as Status) ? (statusRaw as Status) : "pending";

  const questions = await listQuestionsAdmin(status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Product Q&A</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Answer pre-sales questions — publishing an answer puts it straight on the product page.
        </p>
      </div>

      <div className="flex gap-2">
        {STATUSES.map((value) => (
          <Button key={value} asChild size="sm" variant={value === status ? "default" : "outline"}>
            <Link href={`/admin/questions?status=${value}`}>{TAB_LABEL[value]}</Link>
          </Button>
        ))}
      </div>

      {questions.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title={status === "pending" ? "No pending questions" : "No questions here"}
          description={
            status === "pending"
              ? "You're caught up — new questions from product pages will appear here."
              : "Nothing matches this filter yet."
          }
        />
      ) : (
        <div className="space-y-4">
          {questions.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href={`/product/${item.product.slug}`}
                    target="_blank"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {item.product.name}
                  </Link>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.answer ? "outline" : "secondary"}>
                      {item.answer ? "Answered" : "Pending"}
                    </Badge>
                    <ConfirmDeleteButton
                      name="this question"
                      action={deleteQuestionAction.bind(null, item.id)}
                    />
                  </div>
                </div>

                <p className="mt-3 text-sm font-medium">Q: {item.question}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  From {item.email} · {formatDate(item.createdAt)}
                </p>

                {item.answer ? (
                  <p className="mt-3 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                    A: {item.answer}
                  </p>
                ) : (
                  <AnswerQuestionForm questionId={item.id} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
