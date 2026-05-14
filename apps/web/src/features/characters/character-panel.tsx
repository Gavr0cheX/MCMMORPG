"use client";

import { useQuery } from "@tanstack/react-query";
import { Swords } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";

type Character = {
  id: string;
  name: string;
  classKey: string;
  level: number;
  currentServerSlug?: string | null;
};

export function CharacterPanel() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["characters"],
    queryFn: () => apiFetch<Character[]>("/characters")
  });

  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <Swords size={18} className="text-[var(--gold)]" />
        <CardTitle>Characters</CardTitle>
      </div>
      {isLoading ? <div className="h-20 animate-pulse rounded-md bg-[#0a0e13]" /> : null}
      {!isLoading && data.length === 0 ? <p className="text-sm text-[var(--muted)]">No characters yet.</p> : null}
      <div className="grid gap-3">
        {data.map((character) => (
          <div key={character.id} className="flex items-center justify-between rounded-md border border-[var(--border)] p-3">
            <div>
              <div className="font-semibold">{character.name}</div>
              <div className="text-xs uppercase text-[var(--muted)]">{character.classKey}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-[var(--gold)]">Lv {character.level}</div>
              <div className="text-xs text-[var(--muted)]">{character.currentServerSlug ?? "offline"}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
