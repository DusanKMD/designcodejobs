"use client";

import { useId, useMemo, useState } from "react";
import { textFromFile } from "@/components/resume-files";
import type { ListingKeyword } from "@/lib/listing-keywords";
import { scoreResume } from "@/lib/resume-checker";

export function ResumeChecker({ keywords }: { keywords: ListingKeyword[] }) {
  const id = useId();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const result = useMemo(() => (text.trim() ? scoreResume(text, keywords) : null), [text, keywords]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setReading(true);
    try {
      setText(await textFromFile(file));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "That file could not be read. Paste the text instead.");
    } finally {
      setReading(false);
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line p-5 sm:p-6">
        <p className="text-[13.5px] leading-6 text-fg-2">
          The resume stays in this browser. PDF and DOCX files are read on your device. Design Code Jobs does not upload, store, or send the file.
        </p>
        <div className="mt-4">
          <label htmlFor={`${id}-resume`} className="text-[13px] font-medium text-fg">Resume text</label>
          <textarea
            id={`${id}-resume`}
            className="field mt-1.5 min-h-48"
            value={text}
            onChange={(event) => { setText(event.target.value); setError(""); }}
            placeholder="Paste the resume in reading order."
            aria-describedby={`${id}-privacy`}
          />
          <p id={`${id}-privacy`} className="mt-1.5 text-[12px] text-muted">Nothing is saved when you leave this page.</p>
        </div>
        <div className="mt-4">
          <label htmlFor={`${id}-file`} className="text-[13px] font-medium text-fg">Or choose a PDF or DOCX</label>
          <input
            id={`${id}-file`}
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            className="mt-1.5 block w-full text-sm text-fg-2 file:mr-3 file:rounded-lg file:border file:border-line file:bg-card file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-fg"
            aria-describedby={`${id}-privacy`}
            onChange={(event) => onFile(event.target.files?.[0])}
          />
        </div>
        {reading ? <p className="mt-3 text-sm text-muted" role="status">Reading the file on this device…</p> : null}
        {error ? <p className="mt-3 text-sm text-fg" role="alert">{error}</p> : null}
      </div>

      <div className="p-5 sm:p-6" aria-live="polite">
        {result ? (
          <>
            <p className="text-[13px] text-muted">Score · {result.words} words</p>
            <p className="mt-1 font-mono text-[40px] font-medium tracking-tight text-fg tabular">{result.score}<span className="text-[18px] text-muted"> / 100</span></p>
            <ul className="mt-5 divide-y divide-line border-y border-line">
              {result.rows.map((row) => (
                <li key={row.id} className="py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-medium text-fg">{row.label}</p>
                    <p className="font-mono text-sm tabular text-fg-2">{row.score} / {row.max}</p>
                  </div>
                  <p className="mt-1 text-[13px] leading-6 text-muted">{row.detail}</p>
                  {row.fixes.map((fix) => (
                    <p key={fix} className="mt-1 text-[13.5px] leading-6 text-fg-2">{fix}</p>
                  ))}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[15px] font-medium text-fg">Keywords from live listings missing here</p>
            {result.missing.length ? (
              <ul className="mt-2 flex flex-wrap gap-2">
                {result.missing.slice(0, 12).map((term) => (
                  <li key={term} className="rounded-full border border-line bg-chip px-2.5 py-0.5 text-[12.5px] font-medium text-fg">{term}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">Every tracked term from the current listings already appears in this text.</p>
            )}
          </>
        ) : (
          <p className="text-[15px] leading-7 text-fg-2">Paste a resume or choose a file. The score, the seven rows, and the missing keywords show up here.</p>
        )}
      </div>
    </div>
  );
}
