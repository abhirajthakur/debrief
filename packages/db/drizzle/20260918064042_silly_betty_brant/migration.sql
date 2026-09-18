CREATE TYPE "action_item_status" AS ENUM('pending_review', 'auto_executed', 'executed', 'rejected', 'failed');--> statement-breakpoint
CREATE TYPE "action_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "run_status" AS ENUM('queued', 'extracting', 'routing', 'executing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "span_status" AS ENUM('success', 'error');--> statement-breakpoint
CREATE TYPE "span_type" AS ENUM('llm', 'tool');--> statement-breakpoint
CREATE TABLE "action_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"run_id" uuid NOT NULL,
	"task" text NOT NULL,
	"owner" text,
	"due_date" timestamp with time zone,
	"priority" "action_priority" NOT NULL,
	"confidence" real NOT NULL,
	"source_quote" text,
	"status" "action_item_status" DEFAULT 'pending_review'::"action_item_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"transcript" text NOT NULL,
	"status" "run_status" DEFAULT 'queued'::"run_status" NOT NULL,
	"prompt_version" text NOT NULL,
	"model" text NOT NULL,
	"error" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "spans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"run_id" uuid NOT NULL,
	"parent_id" uuid,
	"type" "span_type" NOT NULL,
	"name" text NOT NULL,
	"input" jsonb NOT NULL,
	"output" jsonb,
	"status" "span_status" DEFAULT 'success'::"span_status" NOT NULL,
	"error_message" text,
	"latency_ms" integer,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_run_id_runs_id_fkey" FOREIGN KEY ("run_id") REFERENCES "runs"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "spans" ADD CONSTRAINT "spans_run_id_runs_id_fkey" FOREIGN KEY ("run_id") REFERENCES "runs"("id") ON DELETE CASCADE;